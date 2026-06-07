-- Amanz' Alert — duration prediction + historical-stats foundation.
-- Adds per-suburb median resolution time so each active report can show
-- "Typical resolution: ~Xh based on N prior outages in this suburb."
-- Run after 0005_complaints.sql.

-- Per-suburb outage history. One row per (suburb, municipality).
-- Used both for inline predictions and the upcoming /stats scoreboard.
create or replace view outage_history_by_suburb as
  select
    suburb,
    municipality,
    count(*) as resolved_count,
    extract(epoch from
      percentile_cont(0.5) within group (
        order by (resolved_at - created_at)
      )
    )::int as median_seconds,
    extract(epoch from avg(resolved_at - created_at))::int as mean_seconds,
    extract(epoch from sum(resolved_at - created_at))::bigint as total_seconds,
    count(*) filter (where created_at > now() - interval '30 days') as count_30d,
    count(*) filter (where created_at > now() - interval '90 days') as count_90d
  from reports
  where resolved_at is not null
    and suburb is not null
  group by suburb, municipality;

-- Per-municipality fallback for when a suburb has too little data.
create or replace view outage_history_by_municipality as
  select
    municipality,
    count(*) as resolved_count,
    extract(epoch from
      percentile_cont(0.5) within group (
        order by (resolved_at - created_at)
      )
    )::int as median_seconds
  from reports
  where resolved_at is not null
    and municipality is not null
  group by municipality;

-- Reliability scoreboard: suburbs ranked by outage frequency + downtime.
-- Ongoing outages (resolved_at is null) count their current age toward downtime.
create or replace view scoreboard_by_suburb as
  select
    suburb,
    municipality,
    count(*) filter (where created_at > now() - interval '30 days') as outage_count_30d,
    coalesce(sum(case
      when created_at > now() - interval '30 days'
      then extract(epoch from coalesce(resolved_at, now()) - created_at)
      else 0
    end), 0)::bigint as downtime_seconds_30d,
    count(*) filter (where created_at > now() - interval '90 days') as outage_count_90d,
    coalesce(sum(case
      when created_at > now() - interval '90 days'
      then extract(epoch from coalesce(resolved_at, now()) - created_at)
      else 0
    end), 0)::bigint as downtime_seconds_90d,
    count(*) filter (where resolved_at is null) as currently_out
  from reports
  where suburb is not null
    and created_at > now() - interval '90 days'
  group by suburb, municipality
  having count(*) filter (where created_at > now() - interval '90 days') > 0;

-- Rebuild reports_with_counts to include the inline prediction.
drop view if exists reports_with_counts;

create view reports_with_counts as
  select
    r.*,
    coalesce((select count(*) from report_confirmations c
              where c.report_id = r.id and c.kind = 'still_out'), 0) as still_out_count,
    coalesce((select count(*) from report_confirmations c
              where c.report_id = r.id and c.kind = 'resolved'), 0) as resolved_count,
    coalesce((select count(*) from complaints_filed cf
              where cf.report_id = r.id), 0) as complaint_count,
    (
      -- Prefer suburb-level history; fall back to municipality.
      coalesce(
        (select median_seconds
         from outage_history_by_suburb h
         where h.suburb = r.suburb
           and h.municipality is not distinct from r.municipality
           and h.resolved_count >= 3),
        (select median_seconds
         from outage_history_by_municipality h
         where h.municipality is not distinct from r.municipality
           and h.resolved_count >= 5)
      )
    ) as predicted_resolution_seconds,
    (
      coalesce(
        (select resolved_count
         from outage_history_by_suburb h
         where h.suburb = r.suburb
           and h.municipality is not distinct from r.municipality
           and h.resolved_count >= 3),
        (select resolved_count
         from outage_history_by_municipality h
         where h.municipality is not distinct from r.municipality
           and h.resolved_count >= 5),
        0
      )
    ) as prediction_sample_size
  from reports_public r;

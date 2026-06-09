-- Amanz' Alert — province segregation for stats.
-- Adds province to every report (populated at reverse-geocoding time),
-- exposes it through the public views, and adds a province-level scoreboard.
-- Run after 0007_authorities.sql.

alter table reports add column if not exists province text;

create index if not exists reports_province_idx on reports (province);

-- Rebuild dependent views in dependency order so we can insert the new column.
drop view if exists scoreboard_by_province;
drop view if exists scoreboard_by_suburb;
drop view if exists outage_history_by_municipality;
drop view if exists outage_history_by_suburb;
drop view if exists reports_with_counts;
drop view if exists reports_public;

create view reports_public as
  select id, created_at, lat, lng, severity, cause, note, photo_url,
         municipality, suburb, province, resolved_at
  from reports;

create view outage_history_by_suburb as
  select
    suburb,
    municipality,
    province,
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
  group by suburb, municipality, province;

create view outage_history_by_municipality as
  select
    municipality,
    province,
    count(*) as resolved_count,
    extract(epoch from
      percentile_cont(0.5) within group (
        order by (resolved_at - created_at)
      )
    )::int as median_seconds
  from reports
  where resolved_at is not null
    and municipality is not null
  group by municipality, province;

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

create view scoreboard_by_suburb as
  select
    suburb,
    municipality,
    province,
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
  group by suburb, municipality, province
  having count(*) filter (where created_at > now() - interval '90 days') > 0;

create view scoreboard_by_province as
  select
    coalesce(province, 'Unknown') as province,
    count(distinct suburb) filter (where suburb is not null) as suburb_count,
    count(distinct municipality) filter (where municipality is not null) as municipality_count,
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
  where created_at > now() - interval '90 days'
  group by coalesce(province, 'Unknown')
  having count(*) filter (where created_at > now() - interval '90 days') > 0;

import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "size"> & { size?: number };

function base({ size = 18, strokeWidth = 1.6, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

/** Brand mark — a water droplet. Filled, used in the logo. */
export function DropMark({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2.5C12 2.5 5 9.6 5 14.3a7 7 0 0 0 14 0C19 9.6 12 2.5 12 2.5Z"
        fill="currentColor"
      />
      <path
        d="M9 14.5a3 3 0 0 0 2.2 2.8"
        stroke="white"
        strokeOpacity={0.85}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function MapPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function Megaphone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l3.5 3.2a.7.7 0 0 0 1.2-.5V7.3a.7.7 0 0 0-1.2-.5L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M14 8.5a4 4 0 0 1 0 7" />
      <path d="M7 14v3.2a1.8 1.8 0 0 0 3.5.6" />
    </svg>
  );
}

export function Share(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  );
}

export function Camera(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8h2.5l1.3-1.8a1 1 0 0 1 .8-.4h6.8a1 1 0 0 1 .8.4L17.5 8H20a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export function Search(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function Plus(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 5 8-5" />
    </svg>
  );
}

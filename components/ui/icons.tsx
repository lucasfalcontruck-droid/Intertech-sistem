import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps, children: React.ReactNode) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      {children}
    </svg>
  );
}

export const IconDashboard = (props: IconProps) =>
  base(
    props,
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>,
  );

export const IconMarketplace = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M9 13a3 3 0 0 0 6 0" />
    </>,
  );

export const IconBox = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </>,
  );

export const IconBoxTop = (props: IconProps) => base(props, <path d="M21 8 12 3 3 8l9 5 9-5Z" />);

export const IconFinanceiro = (props: IconProps) =>
  base(
    props,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1-3 2.3c0 3 6 1.5 6 4.4 0 1.4-1.3 2.5-3 2.5s-3-1-3-2.5" />
    </>,
  );

export const IconOrders = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3" />
      <rect x="11" y="11" width="10" height="10" rx="2" />
    </>,
  );

export const IconReports = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-6 4 3 5-8" />
    </>,
  );

export const IconSettings = (props: IconProps) =>
  base(
    props,
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.2.7.7 1.2 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </>,
  );

export const IconSearch = (props: IconProps) =>
  base(
    props,
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>,
  );

export const IconBell = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>,
  );

export const IconPlus = (props: IconProps) => base(props, <path d="M12 5v14M5 12h14" />);

export const IconExport = (props: IconProps) =>
  base(props, <path d="M12 3v13m0 0-4-4m4 4 4-4M5 21h14" />);

export const IconRevenue = (props: IconProps) =>
  base(props, <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />);

export const IconCart = (props: IconProps) =>
  base(
    props,
    <>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </>,
  );

export const IconTicket = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4M4 6v12a2 2 0 0 0 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </>,
  );

export const IconAlertTriangle = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>,
  );

export const IconTrendUp = (props: IconProps) => base(props, <path d="m6 9 6-6 6 6M12 3v18" />);

export const IconTrendDown = (props: IconProps) => base(props, <path d="m6 15 6 6 6-6M12 21V3" />);

export const IconCash = (props: IconProps) =>
  base(
    props,
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M2 10h20" />
    </>,
  );

export const IconXCircle = (props: IconProps) =>
  base(
    props,
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </>,
  );

export const IconPencil = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>,
  );

export const IconTrash = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
      <path d="M10 11v6M14 11v6" />
    </>,
  );

export const IconCheck = (props: IconProps) => base(props, <path d="M20 6 9 17l-5-5" />);

export const IconRefresh = (props: IconProps) =>
  base(
    props,
    <>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M8 16H3v5" />
    </>,
  );

export const IconGear = IconSettings;

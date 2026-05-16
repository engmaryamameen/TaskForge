import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const iconBaseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IconFrame({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg {...iconBaseProps} {...props}>
      {children}
    </svg>
  );
}

/**
 * TaskForge sidebar icon options
 *
 * Suggested sizes:
 * - Sidebar expanded: className="h-5 w-5"
 * - Sidebar collapsed: className="h-5 w-5"
 *
 * All icons use currentColor, so active/inactive states can be controlled with Tailwind:
 * - Active: text-primary-600
 * - Inactive: text-neutral-400
 * - Hover: group-hover:text-neutral-700
 */

/* -------------------------------------------------------------------------- */
/* Dashboard */
/* -------------------------------------------------------------------------- */

export function DashboardGridIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4" width="6.4" height="6.4" rx="1.8" />
      <rect x="13.6" y="4" width="6.4" height="6.4" rx="1.8" />
      <rect x="4" y="13.6" width="6.4" height="6.4" rx="1.8" />
      <rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.8" />
    </IconFrame>
  );
}

export function DashboardCardsIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4.5" width="7" height="6.5" rx="2" />
      <rect x="13" y="4.5" width="7" height="3.8" rx="1.5" />
      <rect x="13" y="10.2" width="7" height="9.3" rx="2" />
      <rect x="4" y="13" width="7" height="6.5" rx="2" />
    </IconFrame>
  );
}

export function DashboardAnalyticsIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3.2" />
      <path d="M8 15.5v-4" />
      <path d="M12 15.5v-7" />
      <path d="M16 15.5v-5.5" />
      <path d="M7.5 17.5h9" />
    </IconFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Projects */
/* -------------------------------------------------------------------------- */

export function ProjectsFolderIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M3.8 7.4c0-1.2.8-2 2-2h4l1.8 2.2h6.6c1.2 0 2 .8 2 2v7.8c0 1.2-.8 2-2 2H5.8c-1.2 0-2-.8-2-2v-10Z" />
      <path d="M4.2 10h15.6" />
      <path d="M8 14h5.5" />
    </IconFrame>
  );
}

export function ProjectsLayersIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 3.8 20 8l-8 4.2L4 8l8-4.2Z" />
      <path d="M4 12.1 12 16.3l8-4.2" />
      <path d="M4 16.1 12 20.3l8-4.2" />
    </IconFrame>
  );
}

export function ProjectsBoardIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 8h8" />
      <path d="M8 12h5" />
      <path d="M8 16h6.5" />
    </IconFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Tasks */
/* -------------------------------------------------------------------------- */

export function TasksChecklistIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4.5" width="16" height="15" rx="3" />
      <path d="m8 9.4 1.4 1.4 3-3" />
      <path d="M14.5 9.5h2.2" />
      <path d="m8 15 1.4 1.4 3-3" />
      <path d="M14.5 15h2.2" />
    </IconFrame>
  );
}

export function TasksCircleCheckIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.2 2.2 4.8-5" />
    </IconFrame>
  );
}

export function TasksKanbanIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 8v8" />
      <path d="M12 8v5" />
      <path d="M16 8v7" />
    </IconFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Organizations */
/* -------------------------------------------------------------------------- */

export function OrganizationsNodesIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="7" r="2.6" />
      <circle cx="6.5" cy="16.5" r="2.3" />
      <circle cx="17.5" cy="16.5" r="2.3" />
      <path d="M10.8 9.3 7.7 14.4" />
      <path d="M13.2 9.3 16.3 14.4" />
      <path d="M8.8 16.5h6.4" />
    </IconFrame>
  );
}

export function OrganizationsTeamIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6.5 19c.6-3 2.6-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
      <path d="M5.4 11.2a2.3 2.3 0 1 0 0-4.6" />
      <path d="M18.6 6.6a2.3 2.3 0 1 0 0 4.6" />
      <path d="M3.5 18c.3-1.9 1.3-3.1 3-3.7" />
      <path d="M20.5 18c-.3-1.9-1.3-3.1-3-3.7" />
    </IconFrame>
  );
}

export function OrganizationsWorkspaceIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M8 9.2h3" />
      <path d="M8 13h8" />
      <path d="M8 16h5.5" />
      <circle cx="16.3" cy="9.2" r="1.2" />
    </IconFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Activity */
/* -------------------------------------------------------------------------- */

export function ActivityClockIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4.2 12a7.8 7.8 0 1 1 2.3 5.5" />
      <path d="M4.2 17.5h2.3v-2.3" />
      <path d="M12 7.8v4.7l3.2 1.9" />
    </IconFrame>
  );
}

export function ActivityPulseIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4 12h3l2-5 4 10 2-5h5" />
      <rect x="3.5" y="4" width="17" height="16" rx="3.2" />
    </IconFrame>
  );
}

export function ActivityTimelineIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M7 5v14" />
      <circle cx="7" cy="7" r="2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M11 7h7" />
      <path d="M11 17h7" />
      <path d="M11 12h5" />
    </IconFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings */
/* -------------------------------------------------------------------------- */

export function SettingsGearIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z" />
      <path d="M19.4 13.2c.1-.4.1-.8.1-1.2s0-.8-.1-1.2l2-1.4-2-3.4-2.4 1a8.2 8.2 0 0 0-2.1-1.2L14.6 3h-5.2l-.3 2.8A8.2 8.2 0 0 0 7 7L4.6 6l-2 3.4 2 1.4c-.1.4-.1.8-.1 1.2s0 .8.1 1.2l-2 1.4 2 3.4L7 17a8.2 8.2 0 0 0 2.1 1.2l.3 2.8h5.2l.3-2.8A8.2 8.2 0 0 0 17 17l2.4 1 2-3.4-2-1.4Z" />
    </IconFrame>
  );
}

export function SettingsSlidersIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 7h8" />
      <path d="M17 7h2" />
      <circle cx="15" cy="7" r="2" />
      <path d="M5 12h2" />
      <path d="M11 12h8" />
      <circle cx="9" cy="12" r="2" />
      <path d="M5 17h7" />
      <path d="M16 17h3" />
      <circle cx="14" cy="17" r="2" />
    </IconFrame>
  );
}

export function SettingsControlIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M8 9h8" />
      <path d="M8 15h8" />
      <circle cx="10" cy="9" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="14" cy="15" r="1.4" fill="currentColor" stroke="none" />
    </IconFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Utility icons */
/* -------------------------------------------------------------------------- */

export function SearchIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="10.8" cy="10.8" r="5.8" />
      <path d="m15.2 15.2 4 4" />
    </IconFrame>
  );
}

export function CollapseIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M15 6 9 12l6 6" />
    </IconFrame>
  );
}

export function ExpandIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m9 6 6 6-6 6" />
    </IconFrame>
  );
}

export function UpgradeSparkIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7-5.6-1.9L10.1 9 12 3.5Z" />
      <path d="M18.5 16.5 19.2 18.4 21 19l-1.8.6-.7 1.9-.7-1.9L16 19l1.8-.6.7-1.9Z" />
    </IconFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Recommended sets */
/* -------------------------------------------------------------------------- */

export const taskForgeIconSetA = {
  dashboard: DashboardGridIcon,
  projects: ProjectsFolderIcon,
  tasks: TasksChecklistIcon,
  organizations: OrganizationsNodesIcon,
  activity: ActivityClockIcon,
  settings: SettingsGearIcon,
  search: SearchIcon,
  collapse: CollapseIcon,
  expand: ExpandIcon,
  upgrade: UpgradeSparkIcon,
};

export const taskForgeIconSetB = {
  dashboard: DashboardCardsIcon,
  projects: ProjectsLayersIcon,
  tasks: TasksCircleCheckIcon,
  organizations: OrganizationsTeamIcon,
  activity: ActivityTimelineIcon,
  settings: SettingsSlidersIcon,
  search: SearchIcon,
  collapse: CollapseIcon,
  expand: ExpandIcon,
  upgrade: UpgradeSparkIcon,
};

export const taskForgeIconSetC = {
  dashboard: DashboardAnalyticsIcon,
  projects: ProjectsBoardIcon,
  tasks: TasksKanbanIcon,
  organizations: OrganizationsWorkspaceIcon,
  activity: ActivityPulseIcon,
  settings: SettingsControlIcon,
  search: SearchIcon,
  collapse: CollapseIcon,
  expand: ExpandIcon,
  upgrade: UpgradeSparkIcon,
};

import { IconFrame, type IconProps } from './icon-base';

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

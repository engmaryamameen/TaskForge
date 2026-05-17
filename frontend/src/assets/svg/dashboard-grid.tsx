import { IconFrame, type IconProps } from './icon-base';

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

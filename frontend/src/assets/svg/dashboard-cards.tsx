import { IconFrame, type IconProps } from './icon-base';

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

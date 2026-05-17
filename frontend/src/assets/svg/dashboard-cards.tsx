import { IconFrame, type IconProps } from './icon-base';

export function DashboardCardsIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="2" y="2" width="8.5" height="8" rx="2" />
      <rect x="13.5" y="2" width="8.5" height="5" rx="2" />
      <rect x="13.5" y="10" width="8.5" height="12" rx="2" />
      <rect x="2" y="13" width="8.5" height="9" rx="2" />
    </IconFrame>
  );
}

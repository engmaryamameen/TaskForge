import { IconFrame, type IconProps } from './icon-base';

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

import { IconFrame, type IconProps } from './icon-base';

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

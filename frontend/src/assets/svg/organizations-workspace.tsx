import { IconFrame, type IconProps } from './icon-base';

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

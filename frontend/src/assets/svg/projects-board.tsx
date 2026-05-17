import { IconFrame, type IconProps } from './icon-base';

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

import { IconFrame, type IconProps } from './icon-base';

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

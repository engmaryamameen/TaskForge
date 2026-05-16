import { IconFrame, type IconProps } from './icon-base';

export function ActivityPulseIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4 12h3l2-5 4 10 2-5h5" />
      <rect x="3.5" y="4" width="17" height="16" rx="3.2" />
    </IconFrame>
  );
}

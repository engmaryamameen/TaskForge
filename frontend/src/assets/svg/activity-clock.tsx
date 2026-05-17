import { IconFrame, type IconProps } from './icon-base';

export function ActivityClockIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4.2 12a7.8 7.8 0 1 1 2.3 5.5" />
      <path d="M4.2 17.5h2.3v-2.3" />
      <path d="M12 7.8v4.7l3.2 1.9" />
    </IconFrame>
  );
}

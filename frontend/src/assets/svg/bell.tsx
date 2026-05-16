import { IconFrame, type IconProps } from './icon-base';

export function BellIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M7.2 10.1c0-3 1.9-5.1 4.8-5.1s4.8 2.1 4.8 5.1v3.1c0 .7.3 1.3.7 1.8l1 1.1h-13l1-1.1c.4-.5.7-1.1.7-1.8v-3.1Z" />
      <path d="M9.8 18.4c.5.8 1.2 1.2 2.2 1.2s1.7-.4 2.2-1.2" />
      <path d="M12 3.3v1.2" />
    </IconFrame>
  );
}

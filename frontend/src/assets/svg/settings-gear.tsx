import { IconFrame, type IconProps } from './icon-base';

export function SettingsGearIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z" />
      <path d="M19.4 13.2c.1-.4.1-.8.1-1.2s0-.8-.1-1.2l2-1.4-2-3.4-2.4 1a8.2 8.2 0 0 0-2.1-1.2L14.6 3h-5.2l-.3 2.8A8.2 8.2 0 0 0 7 7L4.6 6l-2 3.4 2 1.4c-.1.4-.1.8-.1 1.2s0 .8.1 1.2l-2 1.4 2 3.4L7 17a8.2 8.2 0 0 0 2.1 1.2l.3 2.8h5.2l.3-2.8A8.2 8.2 0 0 0 17 17l2.4 1 2-3.4-2-1.4Z" />
    </IconFrame>
  );
}

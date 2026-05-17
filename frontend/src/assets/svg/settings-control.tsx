import { IconFrame, type IconProps } from './icon-base';

export function SettingsControlIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M8 9h8" />
      <path d="M8 15h8" />
      <circle cx="10" cy="9" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="14" cy="15" r="1.4" fill="currentColor" stroke="none" />
    </IconFrame>
  );
}

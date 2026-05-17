import { IconFrame, type IconProps } from './icon-base';

export function SettingsSlidersIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 7h8" />
      <path d="M17 7h2" />
      <circle cx="15" cy="7" r="2" />
      <path d="M5 12h2" />
      <path d="M11 12h8" />
      <circle cx="9" cy="12" r="2" />
      <path d="M5 17h7" />
      <path d="M16 17h3" />
      <circle cx="14" cy="17" r="2" />
    </IconFrame>
  );
}

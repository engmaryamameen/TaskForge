import { IconFrame, type IconProps } from './icon-base';

export function TasksCircleCheckIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.2 2.2 2.2 4.8-5" />
    </IconFrame>
  );
}

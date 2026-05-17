import { IconFrame, type IconProps } from './icon-base';

export function TasksChecklistIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4.5" width="16" height="15" rx="3" />
      <path d="m8 9.4 1.4 1.4 3-3" />
      <path d="M14.5 9.5h2.2" />
      <path d="m8 15 1.4 1.4 3-3" />
      <path d="M14.5 15h2.2" />
    </IconFrame>
  );
}

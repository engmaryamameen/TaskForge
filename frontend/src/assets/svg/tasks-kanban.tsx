import { IconFrame, type IconProps } from './icon-base';

export function TasksKanbanIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 8v8" />
      <path d="M12 8v5" />
      <path d="M16 8v7" />
    </IconFrame>
  );
}

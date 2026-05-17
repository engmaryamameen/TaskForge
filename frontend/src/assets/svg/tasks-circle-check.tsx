import { IconFrame, type IconProps } from './icon-base';

export function TasksCircleCheckIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 20h12m-12-8h12M12 4h12M1 19l3 3 5-5m-8-6l3 3 5-5m0-8L4 6 1 3" />
    </IconFrame>
  );
}

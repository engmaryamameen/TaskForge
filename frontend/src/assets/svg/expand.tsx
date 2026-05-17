import { IconFrame, type IconProps } from './icon-base';

export function ExpandIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m9 6 6 6-6 6" />
    </IconFrame>
  );
}

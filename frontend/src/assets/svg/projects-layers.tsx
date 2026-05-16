import { IconFrame, type IconProps } from './icon-base';

export function ProjectsLayersIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 3.8 20 8l-8 4.2L4 8l8-4.2Z" />
      <path d="M4 12.1 12 16.3l8-4.2" />
      <path d="M4 16.1 12 20.3l8-4.2" />
    </IconFrame>
  );
}

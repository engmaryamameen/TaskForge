import { IconFrame, type IconProps } from './icon-base';

export function ProjectsLayersIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 2 22 7l-10 5L2 7l10-5Z" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 17l10 5 10-5" />
    </IconFrame>
  );
}

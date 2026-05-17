import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;

export const iconBaseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function IconFrame({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg {...iconBaseProps} {...props}>
      {children}
    </svg>
  );
}

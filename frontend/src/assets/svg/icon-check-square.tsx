import type { SVGProps } from 'react';

export function IconCheckSquare(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeWidth={2} d="M12 20h12m-12-8h12M12 4h12M1 19l3 3 5-5m-8-6l3 3 5-5m0-8L4 6 1 3" />
    </svg>
  );
}

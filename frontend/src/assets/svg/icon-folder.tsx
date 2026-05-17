import type { SVGProps } from 'react';

export function IconFolder(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
      <path d="M12 2 22 7l-10 5L2 7l10-5Z" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  );
}

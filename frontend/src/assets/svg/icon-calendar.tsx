import type { SVGProps } from 'react';

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 3v2.25M16 3v2.25M5.25 8.25h13.5c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125h-13.5c-.621 0-1.125-.504-1.125-1.125v-10.5c0-.621.504-1.125 1.125-1.125z"
      />
      <path strokeLinecap="round" strokeWidth={1.5} d="M9 5.25v-2M15 5.25v-2" />
      <path strokeLinecap="round" strokeWidth={2} strokeOpacity={0.65} d="M9 13.25h.01M12 13.25h.01M15 13.25h.01M9 16.75h.01M12 16.75h.01M15 16.75h.01" />
    </svg>
  );
}

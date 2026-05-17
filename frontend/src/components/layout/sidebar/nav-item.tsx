'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconChevronRight } from '@/components/icons';

interface SubLink {
  href: string;
  label: string;
}

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
  badge?: number;
  subLinks?: SubLink[];
  subLinkIsActive?: (href: string) => boolean;
}

export function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  badge,
  subLinks,
  subLinkIsActive,
}: NavItemProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(isActive);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (isActive && subLinks?.length) setExpanded(true);
  }, [isActive, subLinks]);

  useEffect(() => {
    if (contentRef.current) setContentHeight(contentRef.current.scrollHeight);
  }, [expanded, subLinks]);

  const hasSubLinks = subLinks && subLinks.length > 0;

  const activeClass = 'bg-primary-50 text-primary-700 font-semibold';
  const inactiveClass = 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 font-medium';

  /* ── With sub-links ── */
  if (hasSubLinks) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.75 text-[13px] transition-colors duration-150 cursor-pointer ${
            isActive ? activeClass : inactiveClass
          }`}
        >
          <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
          <span className="flex-1 text-left">{label}</span>
          <IconChevronRight
            className={`h-3 w-3 shrink-0 text-neutral-300 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          />
        </button>

        <div
          className="overflow-hidden transition-all duration-250 ease-in-out"
          style={{ maxHeight: expanded ? contentHeight : 0 }}
        >
          <div ref={contentRef} className="ml-6.5 space-y-px border-l border-neutral-200/80 py-0.5 pl-2.5">
            {subLinks.map((sub) => {
              const subActive = subLinkIsActive
                ? subLinkIsActive(sub.href)
                : pathname === sub.href || pathname.startsWith(sub.href + '/');
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={onClick}
                  className={`block rounded-md px-2 py-1 text-xs transition-colors duration-150 ${
                    subActive
                      ? 'font-semibold text-primary-600'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {sub.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ── Simple link ── */
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.75 text-[13px] transition-colors duration-150 ${
        isActive ? activeClass : inactiveClass
      }`}
    >
      <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary-100 px-1 text-[10px] font-bold text-primary-700">
          {badge}
        </span>
      )}
    </Link>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconChevronRight } from '@/components/icons';

interface SubLink {
  href: string;
  label: string;
  badge?: string;
}

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
  badge?: number;
  subLinks?: SubLink[];
  /** When set, overrides default pathname matching for sub-links (e.g. query-aware Tasks links). */
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
    if (isActive && subLinks?.length) {
      setExpanded(true);
    }
  }, [isActive, subLinks]);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, subLinks]);

  const hasSubLinks = subLinks && subLinks.length > 0;

  if (hasSubLinks) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
            isActive
              ? 'text-primary-700'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
          <span className={`flex-1 text-left ${isActive ? 'font-semibold' : ''}`}>{label}</span>
          <IconChevronRight
            className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-200 ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        </button>

        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: expanded ? contentHeight : 0 }}
        >
          <div ref={contentRef} className="ml-9 mt-0.5 space-y-0.5 py-1 pl-1">
            {subLinks.map((sub) => {
              const subActive = subLinkIsActive
                ? subLinkIsActive(sub.href)
                : pathname === sub.href || pathname.startsWith(sub.href + '/');
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={onClick}
                  className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors duration-150 ${
                    subActive
                      ? 'font-semibold text-primary-600'
                      : 'font-normal text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {sub.label}
                  {sub.badge && (
                    <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-[9px] font-bold text-primary-700 uppercase">
                      {sub.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 ${
        isActive ? 'font-semibold text-primary-700' : 'text-neutral-600 hover:text-neutral-900'
      }`}
    >
      <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-100 px-1.5 text-[10px] font-semibold text-primary-700">
          {badge}
        </span>
      )}
    </Link>
  );
}

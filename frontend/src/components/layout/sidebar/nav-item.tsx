import Link from 'next/link';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
  badge?: number;
}

export function NavItem({ href, label, icon: Icon, isActive, onClick, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? 'bg-primary-50 text-primary-700 shadow-xs'
          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary-600" />
      )}
      <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-100 px-1.5 text-[10px] font-semibold text-primary-700">
          {badge}
        </span>
      )}
    </Link>
  );
}

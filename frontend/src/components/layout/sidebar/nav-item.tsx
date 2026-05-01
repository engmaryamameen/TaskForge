import Link from 'next/link';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
}

export function NavItem({ href, label, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-md px-3 py-[7px] text-[13px] font-medium transition-colors ${
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary-600" />
      )}
      <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
      {label}
    </Link>
  );
}

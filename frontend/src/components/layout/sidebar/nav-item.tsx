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
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-700 text-white'
          : 'text-blue-200 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-blue-300'}`} />
      {label}
    </Link>
  );
}

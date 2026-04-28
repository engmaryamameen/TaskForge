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
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
      {label}
    </Link>
  );
}

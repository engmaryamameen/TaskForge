import { getInitials } from '@/lib/utils';

const sizeStyles = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-12 w-12 text-base',
};

const colorPalette = [
  'bg-primary-600',
  'bg-success-600',
  'bg-purple-600',
  'bg-orange-600',
  'bg-teal-600',
  'bg-danger-600',
  'bg-warning-600',
  'bg-info-600',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  size?: keyof typeof sizeStyles;
  className?: string;
}

export function Avatar({ firstName = '', lastName = '', size = 'md', className = '' }: AvatarProps) {
  const initials = getInitials(firstName, lastName);
  const color = getColorFromName(`${firstName}${lastName}`);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white ${sizeStyles[size]} ${color} ${className}`}
      title={`${firstName} ${lastName}`.trim()}
    >
      {initials}
    </div>
  );
}

interface AvatarGroupProps {
  users: Array<{ firstName?: string; lastName?: string }>;
  max?: number;
  size?: keyof typeof sizeStyles;
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-1.5">
      {visible.map((user, i) => (
        <Avatar
          key={i}
          firstName={user.firstName}
          lastName={user.lastName}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`inline-flex items-center justify-center rounded-full bg-neutral-200 font-medium text-neutral-600 ring-2 ring-white ${sizeStyles[size]}`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

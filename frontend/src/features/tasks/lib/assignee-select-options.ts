import type { Membership } from '@/types';
import type { SelectOption } from '@/components/ui/select';

export function assigneeSelectOptions(members: Membership[] | undefined): SelectOption[] {
  const opts: SelectOption[] = [{ value: '', label: 'Unassigned' }];
  if (!members) return opts;
  for (const m of members) {
    if (m.user) {
      opts.push({
        value: m.userId,
        label: `${m.user.firstName} ${m.user.lastName}`.trim(),
      });
    }
  }
  return opts;
}

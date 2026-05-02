'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUpdateProfile } from '@/features/auth/hooks/useUpdateProfile';
import { useToast } from '@/components/toast/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ApiError } from '@/types';
import { IconMail } from '@/components/icons';
import { SettingsSection } from './settings-section';

export function ProfileSettingsForm() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const toast = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const dirty =
    !!user &&
    (firstName.trim() !== user.firstName || lastName.trim() !== user.lastName);

  function handleReset() {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !dirty) return;
    setFormError(null);
    setFieldErrors({});
    try {
      await updateProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      toast.success({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else {
        setFormError('Something went wrong. Try again.');
      }
    }
  }

  if (!user) return null;

  return (
    <SettingsSection
      title="Profile"
      description="Your personal details are visible to teammates in this workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar firstName={user.firstName} lastName={user.lastName} size="xl" />
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={fieldErrors.firstName}
              />
              <Input
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={fieldErrors.lastName}
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Email address
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2">
                <IconMail className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-700">{user.email}</span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                Email change requires verification — contact support if you need to update it.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                Status
              </label>
              <div className="mt-1">
                <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                  {user.status === 'active' ? 'Active' : 'Suspended'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {formError && (
          <p className="text-sm text-danger-600" role="alert">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={updateProfile.isPending} disabled={!dirty}>
            Save changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!dirty || updateProfile.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

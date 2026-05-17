'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { AuthShell, FormErrorAlert } from '@/features/auth/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth.store';
import { organizationsApi } from '@/lib/api/organizations.api';
import { connectSocket, joinOrgRoom } from '@/lib/socket';
import { authApi } from '@/lib/api/auth.api';
import { ApiError } from '@/types';
import {
  AUTH_FORM_STACK,
  AUTH_HEADER_SECTION,
  AUTH_DESKTOP_SUBMIT,
  AUTH_MOBILE_DOCK_INNER,
  AUTH_MOBILE_PRIMARY_DOCK,
  AUTH_MOBILE_SCROLL_COLUMN,
  AUTH_PAGE_SUBTITLE,
  AUTH_PAGE_TITLE,
  AUTH_ALERT_MARGIN,
} from '@/features/auth/lib/auth-spacing';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { accessToken, refreshToken, setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isPending) return;

    setError(null);
    setIsPending(true);

    try {
      await organizationsApi.create({ name: trimmed });

      // Refresh user to pick up the new currentOrganizationId
      const { data } = await authApi.me();
      const user = data.data!.user;
      setAuth(user, accessToken!, refreshToken!);

      const socket = connectSocket(accessToken!);
      if (user.currentOrganizationId) {
        socket.on('connect', () => joinOrgRoom(user.currentOrganizationId!));
        if (socket.connected) joinOrgRoom(user.currentOrganizationId!);
      }

      router.push('/');
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Could not create organization. Please try again.';
      setError(msg);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AuthShell
      compactVisual
      panelTitle={
        <>
          Set up your
          <br />
          workspace.
        </>
      }
      panelDescription="Create an organization to start managing projects with your team."
    >
      <div className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
        <div className={AUTH_MOBILE_SCROLL_COLUMN}>
          <header className={AUTH_HEADER_SECTION}>
            <h1 className={AUTH_PAGE_TITLE}>Create your organization</h1>
            <p className={AUTH_PAGE_SUBTITLE}>
              Give your workspace a name. You can always change it later.
            </p>
          </header>

          {error && (
            <FormErrorAlert className={AUTH_ALERT_MARGIN}>
              <p>{error}</p>
            </FormErrorAlert>
          )}

          <form onSubmit={handleSubmit} className={AUTH_FORM_STACK}>
            <Input
              id="org-name"
              label="Organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Inc"
              maxLength={100}
              autoFocus
              leftIcon={<Building2 className="h-4 w-4" />}
            />

            <Button
              type="submit"
              size="lg"
              loading={isPending}
              disabled={!isValid}
              className={AUTH_DESKTOP_SUBMIT}
            >
              Create organization
            </Button>
          </form>
        </div>

        <div className={AUTH_MOBILE_PRIMARY_DOCK}>
          <div className={AUTH_MOBILE_DOCK_INNER}>
            <Button
              type="submit"
              form="org-form"
              size="lg"
              loading={isPending}
              disabled={!isValid}
              className="min-h-[48px] w-full text-[15px]"
              onClick={handleSubmit}
            >
              Create organization
            </Button>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

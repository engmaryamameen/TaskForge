'use client';

import { useAuthStore } from '@/store/auth.store';
import { useCurrentOrganization, useOrgMembers } from '@/features/organizations/hooks/useOrganizations';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: org } = useCurrentOrganization();
  const { data: members } = useOrgMembers();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="space-y-6">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{user?.email}</dd>
            </div>
          </dl>
        </section>

        {org && (
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Organization
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium text-gray-900">{org.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Slug</dt>
                <dd className="font-medium text-gray-900">{org.slug}</dd>
              </div>
            </dl>
          </section>
        )}

        {members && members.length > 0 && (
          <section className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Members ({members.length})
            </h2>
            <ul className="divide-y divide-gray-100">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-gray-900">
                    {member.userId}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

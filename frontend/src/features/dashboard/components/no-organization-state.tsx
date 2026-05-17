'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconPlus, IconFolder, IconUsers, IconGlobe } from '@/components/icons';
import { CreateOrgModal } from '@/features/organizations/components/create-org-modal';

const steps = [
  {
    step: '01',
    title: 'Create organization',
    description: 'Spin up a dedicated space for your team’s projects and permissions.',
    icon: IconGlobe,
    accent: 'from-primary-600/90 to-primary-700',
    ring: 'ring-primary-200/90',
  },
  {
    step: '02',
    title: 'Add your first project',
    description: 'Organize work streams so tasks and ownership stay crystal clear.',
    icon: IconFolder,
    accent: 'from-violet-600/90 to-indigo-700',
    ring: 'ring-violet-200/90',
  },
  {
    step: '03',
    title: 'Invite teammates',
    description: 'Bring collaborators in with roles — everyone stays aligned.',
    icon: IconUsers,
    accent: 'from-teal-600/90 to-cyan-700',
    ring: 'ring-teal-200/90',
  },
] as const;

export function NoOrganizationState() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <CreateOrgModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-primary-50/[0.35] to-neutral-50/80 shadow-sm">
        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 20%, #0c5fd9 0%, transparent 45%),
                radial-gradient(circle at 80% 10%, #6366f1 0%, transparent 40%)`,
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-700 shadow-xs backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-600" aria-hidden />
              Let’s get started
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Welcome to TaskForge
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-neutral-600">
              Create your first organization to start organizing projects, tasks, and your team — everything stays in
              one place.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Button size="lg" leftIcon={<IconPlus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
                Create organization
              </Button>
              <Link href="/organizations">
                <Button variant="secondary" size="lg">
                  Learn more
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              Prefer to explore first?{' '}
              <Link href="/organizations" className="font-medium text-primary-600 hover:text-primary-700">
                View organization settings
              </Link>
            </p>
          </div>
        </div>

        <div className="grid gap-4 border-t border-neutral-200 bg-white/60 px-6 py-8 backdrop-blur-sm sm:grid-cols-3 sm:px-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex flex-col rounded-2xl border border-neutral-100 bg-white/95 p-5 shadow-xs transition-shadow hover:shadow-medium"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{item.step}</span>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-sm ring-1 ${item.ring}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

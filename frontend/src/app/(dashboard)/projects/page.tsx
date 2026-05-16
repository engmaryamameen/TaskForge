'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { CreateProjectModal } from '@/features/projects/components/create-project-modal';
import { ProjectCard } from '@/features/projects/components/project-card';
import { ProjectCardSkeleton } from '@/features/projects/components/project-card-skeleton';
import { ProjectFilters } from '@/features/projects/components/project-filters';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { IconPlus, IconFolder } from '@/components/icons';

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';

  const { data, isLoading, isError, refetch } = useProjects({ page, search: search || undefined });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    const params = new URLSearchParams();
    if (value) params.set('search', value);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '/projects');
  }, [router]);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (newPage > 1) params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  }

  const projects = data?.data;
  const total = data?.meta?.total ?? 0;
  const limit = 20;
  const totalPages = Math.ceil(total / limit);
  const hasProjects = projects && projects.length > 0;
  const isSearching = !!search;
  const singleColumnComfort = hasProjects && projects!.length === 1;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page header */}
      <header className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-linear-to-br from-white via-white to-primary-50/30 px-6 py-8 shadow-xs sm:px-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-100/40 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-700 ring-1 ring-primary-100">
                Workspace
              </span>
              {!isLoading && !isError && total > 0 && (
                <span className="text-[13px] font-medium tabular-nums text-neutral-500">
                  {total} project{total !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-[2rem]">Projects</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
                {total > 0
                  ? 'Plan, track, and ship work together — open a project to see tasks and activity.'
                  : 'Create a project to organize tasks, members, and delivery in one place.'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<IconPlus className="h-4 w-4" />}
            className="shrink-0 shadow-md shadow-primary-600/15"
            size="lg"
          >
            New Project
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-4 border-b border-neutral-200/70 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <ProjectFilters search={search} onSearchChange={handleSearchChange} className="sm:flex-1" />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="mt-10">
          <ErrorState onRetry={refetch} />
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && hasProjects && (
        <>
          <div
            className={`mt-8 grid grid-cols-1 gap-5 ${singleColumnComfort ? 'mx-auto max-w-xl' : 'sm:grid-cols-2 xl:grid-cols-3'}`}
          >
            {projects!.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              className="mt-12 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 px-3 py-3 shadow-xs backdrop-blur-sm"
              aria-label="Pagination"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-xl"
              >
                Previous
              </Button>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-xl"
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}

      {/* Empty */}
      {!isLoading && !isError && !hasProjects && !isSearching && (
        <div className="mt-10">
          <EmptyState
            title="No projects yet"
            description="Create your first project to start organizing your team's work."
            icon={<IconFolder className="h-6 w-6" />}
            action={{ label: 'Create your first project', onClick: () => setShowCreateModal(true) }}
          />
        </div>
      )}

      {!isLoading && !isError && !hasProjects && isSearching && (
        <div className="mt-10">
          <EmptyState
            title={`No projects match “${search}”`}
            description="Try a different search term or create a new project."
          />
        </div>
      )}

      <CreateProjectModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}

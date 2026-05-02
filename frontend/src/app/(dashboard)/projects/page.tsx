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

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Projects</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {total > 0 ? `${total} project${total !== 1 ? 's' : ''} in your workspace` : 'Organize your work into projects'}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={<IconPlus className="h-4 w-4" />}
        >
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ProjectFilters search={search} onSearchChange={handleSearchChange} />
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && <ErrorState onRetry={refetch} />}

      {/* Project grid */}
      {!isLoading && !isError && hasProjects && (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty states */}
      {!isLoading && !isError && !hasProjects && !isSearching && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing your team's work."
          icon={<IconFolder className="h-6 w-6" />}
          action={{ label: 'Create your first project', onClick: () => setShowCreateModal(true) }}
        />
      )}

      {!isLoading && !isError && !hasProjects && isSearching && (
        <EmptyState
          title={`No projects match \u201c${search}\u201d`}
          description="Try a different search term or create a new project."
        />
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

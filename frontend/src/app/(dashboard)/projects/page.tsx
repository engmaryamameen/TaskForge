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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button onClick={() => setShowCreateModal(true)}>Create Project</Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ProjectFilters search={search} onSearchChange={handleSearchChange} />
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`rounded px-3 py-1.5 text-sm font-medium ${
                    p === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty state: no projects at all */}
      {!isLoading && !isError && !hasProjects && !isSearching && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start organizing your work."
          action={{ label: 'Create your first project', onClick: () => setShowCreateModal(true) }}
        />
      )}

      {/* Empty state: no search results */}
      {!isLoading && !isError && !hasProjects && isSearching && (
        <EmptyState
          title={`No projects match \u201c${search}\u201d`}
          description="Try a different search term."
        />
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

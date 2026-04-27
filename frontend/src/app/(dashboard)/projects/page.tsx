'use client';

import Link from 'next/link';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { formatRelative } from '@/lib/utils';

export default function ProjectsPage() {
  const { data, isLoading } = useProjects();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500">Loading projects...</p>
      )}

      {data?.data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {project.name}
              </h3>
              {project.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {project.description}
                </p>
              )}
              <p className="mt-3 text-xs text-gray-400">
                Created {formatRelative(project.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      )}

      {data?.data?.length === 0 && (
        <p className="text-sm text-gray-500">
          No projects yet. Create your first project to get started.
        </p>
      )}
    </div>
  );
}

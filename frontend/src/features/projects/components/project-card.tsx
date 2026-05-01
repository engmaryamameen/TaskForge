import Link from 'next/link';
import type { Project } from '@/types';
import { formatRelative, truncate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-lg border border-gray-200 bg-white p-5 shadow-soft transition-all duration-200 hover:shadow-medium hover:border-primary-200"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary-50 text-sm font-bold text-primary-600">
          {project.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
              {truncate(project.description, 100)}
            </p>
          )}
          <p className="mt-2 text-[11px] text-gray-400">
            {formatRelative(project.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

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
      className="block rounded-xl border border-gray-100 bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-medium hover:border-gray-200"
    >
      <h3 className="text-lg font-semibold tracking-tight text-gray-900">{project.name}</h3>
      {project.description && (
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {truncate(project.description, 120)}
        </p>
      )}
      <p className="mt-3 text-xs text-gray-400">
        Created {formatRelative(project.createdAt)}
      </p>
    </Link>
  );
}

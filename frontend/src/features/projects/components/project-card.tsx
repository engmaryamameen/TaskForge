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
      className="block rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
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

import Link from 'next/link';
import type { Project } from '@/types';
import { formatRelative, truncate } from '@/lib/utils';
import { IconFolder, IconArrowRight } from '@/components/icons';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:shadow-medium hover:border-primary-200"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-700 transition-colors group-hover:bg-primary-100">
          {project.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors">
            {project.name}
          </h3>
          {project.description ? (
            <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {truncate(project.description, 100)}
            </p>
          ) : (
            <p className="mt-1 text-xs text-neutral-400 italic">No description</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
        <p className="text-[11px] text-neutral-400">
          {formatRelative(project.createdAt)}
        </p>
        <span className="flex items-center gap-1 text-[11px] font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100">
          Open <IconArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

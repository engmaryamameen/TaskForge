import Link from 'next/link';
import type { Project } from '@/types';
import { formatRelative, truncate } from '@/lib/utils';
import { IconArrowRight, IconCalendar } from '@/components/icons';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const updatedAt = project.updatedAt || project.createdAt;
  const hasDescription = Boolean(project.description?.trim());

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-large"
    >
      {/* Soft top highlight on hover — no side stripe */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />

      <div className="flex flex-1 flex-col p-5 pt-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary-50 to-primary-100/80 text-base font-bold tracking-tight text-primary-800 shadow-inner ring-1 ring-primary-100/80 transition-transform duration-300 group-hover:scale-[1.02] group-hover:from-primary-100 group-hover:to-primary-50"
            aria-hidden
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-neutral-900 transition-colors group-hover:text-primary-700">
              {project.name}
            </h3>
            {hasDescription ? (
              <p className="text-[13px] leading-relaxed text-neutral-500 line-clamp-2">
                {truncate(project.description!, 120)}
              </p>
            ) : (
              <p className="text-[13px] italic text-neutral-400">No description yet</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-1.5 text-[12px] text-neutral-400">
            <IconCalendar className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
            <span className="text-neutral-500">Updated {formatRelative(updatedAt)}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary-600 transition-transform duration-200 group-hover:translate-x-0.5">
            Open
            <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

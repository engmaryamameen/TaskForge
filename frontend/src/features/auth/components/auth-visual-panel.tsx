import { IconBolt, IconCheckSquare, IconFolder, IconUsers } from '@/components/icons';

type AuthVisualPanelProps = {
  title: React.ReactNode;
  description: string;
};

export function AuthVisualPanel({ title, description }: AuthVisualPanelProps) {
  return (
    <div className="relative flex h-full min-h-[520px] flex-col overflow-hidden lg:min-h-full">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(165deg, #2563eb 0%, #1e3a8a 46%, #0f172a 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute -right-10 top-[18%] h-56 w-56 rounded-full bg-sky-400/12 blur-3xl" />
      <div className="absolute -left-12 bottom-[8%] h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="absolute right-6 top-10 h-28 w-28 rounded-full border border-white/10 opacity-80" />
      <div className="absolute bottom-16 right-10 h-16 w-16 rotate-12 rounded-xl border border-white/5 bg-white/5" />

      <svg
        className="pointer-events-none absolute bottom-0 right-0 h-28 w-full text-white/10 lg:-right-px lg:top-0 lg:h-full lg:w-22"
        viewBox="0 0 120 400"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0,400 C40,360 30,240 50,200 C70,160 100,120 95,60 C90,20 100,0 120,0 L120,400 Z"
        />
      </svg>

      <div className="relative z-10 flex h-full min-h-[520px] flex-col px-8 pb-9 pt-9 sm:px-9 sm:pb-10 sm:pt-10 lg:min-h-[600px] lg:px-10 lg:pb-10 lg:pt-10 xl:px-11 xl:pt-11">
        <header className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md">
            <IconBolt className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white sm:text-xl">TaskForge</span>
        </header>

        <div className="mt-9 flex max-w-88 flex-col sm:mt-10 lg:mt-11 lg:max-w-96">
          <h2 className="text-[1.75rem] font-bold leading-[1.18] tracking-tight text-white sm:text-4xl xl:text-[2.35rem] xl:leading-[1.12]">
            {title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/70 lg:text-base">{description}</p>

          <div className="mt-6 flex flex-wrap gap-2 sm:mt-7">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/10 backdrop-blur-sm">
              <IconFolder className="h-3.5 w-3.5 text-white/75" />
              <span className="text-[13px] font-medium text-white/85">Projects</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/10 backdrop-blur-sm">
              <IconCheckSquare className="h-3.5 w-3.5 text-white/75" />
              <span className="text-[13px] font-medium text-white/85">Tasks</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/10 backdrop-blur-sm">
              <IconUsers className="h-3.5 w-3.5 text-white/75" />
              <span className="text-[13px] font-medium text-white/85">Teams</span>
            </div>
          </div>
        </div>

        <p className="mt-auto pt-10 text-[12px] leading-relaxed text-white/35 lg:pt-12">
          &copy; {new Date().getFullYear()} TaskForge — Built for engineering teams
        </p>
      </div>
    </div>
  );
}

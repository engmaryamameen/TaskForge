import { IconBolt, IconCheckSquare, IconFolder, IconUsers } from '@/components/icons';

type AuthVisualPanelProps = {
  title: React.ReactNode;
  description: string;
};

export function AuthVisualPanel({ title, description }: AuthVisualPanelProps) {
  return (
    <div className="relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden p-8 sm:p-10 lg:min-h-[620px] lg:p-10 xl:p-12">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(165deg, #2563eb 0%, #1e3a8a 45%, #0f172a 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <div className="absolute -right-8 top-1/4 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full border border-white/10" />
      <div className="absolute bottom-12 right-8 h-24 w-24 rotate-12 rounded-2xl border border-white/5 bg-white/5" />

      <svg
        className="absolute bottom-0 right-0 h-32 w-full text-white/10 lg:-right-px lg:top-0 lg:h-full lg:w-24"
        viewBox="0 0 120 400"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0,400 C40,360 30,240 50,200 C70,160 100,120 95,60 C90,20 100,0 120,0 L120,400 Z"
        />
      </svg>

      <div className="relative z-10 flex flex-col justify-between gap-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md">
            <IconBolt className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">TaskForge</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl xl:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">{description}</p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 ring-1 ring-white/10 backdrop-blur-sm">
              <IconFolder className="h-3.5 w-3.5 text-white/75" />
              <span className="text-[13px] font-medium text-white/85">Projects</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 ring-1 ring-white/10 backdrop-blur-sm">
              <IconCheckSquare className="h-3.5 w-3.5 text-white/75" />
              <span className="text-[13px] font-medium text-white/85">Tasks</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 ring-1 ring-white/10 backdrop-blur-sm">
              <IconUsers className="h-3.5 w-3.5 text-white/75" />
              <span className="text-[13px] font-medium text-white/85">Teams</span>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-white/35">
          &copy; {new Date().getFullYear()} TaskForge — Built for engineering teams
        </p>
      </div>
    </div>
  );
}

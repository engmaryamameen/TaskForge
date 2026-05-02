import { IconBolt } from '@/components/icons';
import { AuthVisualPanel } from './auth-visual-panel';

type AuthShellProps = {
  children: React.ReactNode;
  /** Left panel marketing — defaults are productivity-focused */
  panelTitle?: React.ReactNode;
  panelDescription?: string;
  /** Replace entire left column (rare) */
  visual?: React.ReactNode;
  /** Use a shorter left panel on compact auth flows */
  compactVisual?: boolean;
};

const defaultTitle = (
  <>
    Ship work
    <br />
    with clarity.
  </>
);
const defaultDescription =
  'Multi-tenant project management for teams that plan, track, and deliver without the noise.';

export function AuthShell({
  children,
  panelTitle = defaultTitle,
  panelDescription = defaultDescription,
  visual,
  compactVisual = false,
}: AuthShellProps) {
  const desktopMinH = compactVisual ? 'lg:min-h-[520px]' : 'lg:min-h-[600px]';
  const visualW = compactVisual ? 'lg:w-[42%]' : 'lg:w-[46%]';

  return (
    <div className="min-h-dvh w-full bg-white lg:min-h-screen lg:bg-[#f8fafc]">
      <div className="flex min-h-dvh w-full flex-col lg:box-border lg:min-h-screen lg:justify-center lg:px-6 lg:py-10">
        <div
          className={`mx-auto flex min-h-dvh w-full max-w-[1180px] flex-col overflow-hidden bg-white lg:min-h-0 ${desktopMinH} lg:h-auto lg:w-full lg:max-w-[1180px] lg:flex-row lg:rounded-3xl lg:border lg:border-neutral-200/80 lg:shadow-[0_25px_50px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.04)]`}
        >
          {/* Desktop blue panel */}
          <div className={`relative hidden min-h-0 shrink-0 overflow-hidden lg:block ${visualW}`}>
            {visual ?? <AuthVisualPanel title={panelTitle} description={panelDescription} />}
          </div>

          {/* Mobile brand strip */}
          <div className="flex shrink-0 items-center justify-center gap-2.5 border-b border-neutral-100 bg-white px-6 py-3 sm:py-3.5 lg:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 shadow-sm ring-1 ring-black/5">
              <IconBolt className="h-5 w-5 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-neutral-900">TaskForge</span>
          </div>

          {/* Form column */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-start bg-white lg:min-w-0 lg:flex-1 lg:justify-center">
            <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col min-h-0 px-6 pt-6 lg:flex lg:max-h-none lg:flex-none lg:justify-center lg:px-10 lg:py-11 xl:px-11">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Tighter gutters on phones so the card + form read wider; more room on xl */}
      <div className="mx-auto flex min-h-screen max-w-[1360px] items-center justify-center px-3 py-6 sm:px-5 sm:py-10 lg:px-6">
        <div
          className={`flex w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.04)] sm:rounded-3xl ${compactVisual ? 'lg:min-h-0' : 'lg:min-h-[620px]'} `}
        >
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div
              className={`relative hidden min-h-0 shrink-0 overflow-hidden lg:block ${compactVisual ? 'lg:w-[40%]' : 'lg:w-[45%]'} `}
            >
              {visual ?? <AuthVisualPanel title={panelTitle} description={panelDescription} />}
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center bg-white">
              <div className="flex justify-center border-b border-neutral-100 py-5 sm:py-6 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 shadow-md">
                  <IconBolt className="h-6 w-6 text-white" />
                </div>
              </div>
              <div
                className={`mx-auto w-full max-w-[540px] px-4 py-8 sm:px-8 sm:py-10 lg:px-11 lg:py-12 ${compactVisual ? '' : 'lg:min-h-[520px] lg:justify-center'} flex flex-col justify-center`}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

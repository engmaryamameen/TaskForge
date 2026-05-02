import { Check } from 'lucide-react';
import { evaluatePasswordRules, type PasswordRuleChecks } from '@/features/auth/lib/password-rules';

type PasswordRulesProps = {
  password: string;
};

const RULES: { key: keyof PasswordRuleChecks; label: string }[] = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'upper', label: 'One uppercase letter' },
  { key: 'lower', label: 'One lowercase letter' },
  { key: 'number', label: 'One number' },
];

export function PasswordRules({ password }: PasswordRulesProps) {
  const checks = evaluatePasswordRules(password);

  return (
    <ul className="mt-2 flex flex-col gap-1.5 text-[13px] leading-snug" aria-live="polite">
      {RULES.map(({ key, label }) => {
        const ok = checks[key];
        return (
          <li key={key} className="flex items-center gap-2">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                ok ? 'bg-success-100 text-success-600' : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              <Check className="h-3 w-3 stroke-[3]" aria-hidden />
            </span>
            <span className={ok ? 'text-success-700' : 'text-neutral-500'}>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

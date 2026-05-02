export type PasswordRuleChecks = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
};

export function evaluatePasswordRules(password: string): PasswordRuleChecks {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
}

export function meetsPasswordRules(password: string): boolean {
  const c = evaluatePasswordRules(password);
  return c.length && c.upper && c.lower && c.number;
}

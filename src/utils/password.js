export function getPasswordChecks(password) {
  const value = password || '';
  return {
    length: value.length >= 8,
    case: /[a-z]/.test(value) && /[A-Z]/.test(value),
    number: /\d/.test(value),
  };
}

export function isPasswordStrong(password) {
  const c = getPasswordChecks(password);
  return c.length && c.case && c.number;
}

export function passwordErrorMessage(password) {
  const c = getPasswordChecks(password);
  if (!c.length) return 'Password must be at least 8 characters';
  if (!c.case) return 'Password must include uppercase and lowercase letters';
  if (!c.number) return 'Password must include a number';
  return null;
}

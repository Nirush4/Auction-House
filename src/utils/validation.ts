export function required(value: string): string | null {
  return value.trim() ? null : 'This field is required.';
}

export function minLength(value: string, min: number): string | null {
  return value.trim().length >= min
    ? null
    : `Must be at least ${min} characters.`;
}

export function isEmail(value: string): string | null {
  return /^\S+@\S+\.\S+$/.test(value) ? null : 'Invalid email address.';
}

export function validate(errors: Array<string | null>): string[] {
  return errors.filter((e): e is string => Boolean(e));
}

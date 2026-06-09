export const LIMITS = {
  name: 50,
  email: 255,
  phone: 20,
  phoneMinDigits: 7,
  password: 128,
  passwordMin: 8,
  otp: 6,
} as const;

const NAME_REGEX = /^[\p{L}\p{M}'\-. ]+$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;
const PASSWORD_REGEX = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  digit: /[0-9]/,
  special: /[^a-zA-Z0-9]/,
};

/** Strip invalid chars as user types */
export function filterName(value: string) {
  return value.replace(/[^\p{L}\p{M}'\-. ]/gu, "").slice(0, LIMITS.name);
}

export function filterEmail(value: string) {
  return value.replace(/[^a-zA-Z0-9@._+-]/g, "").slice(0, LIMITS.email);
}

export function filterPhone(value: string) {
  return value.replace(/[^0-9+()\-\s]/g, "").slice(0, LIMITS.phone);
}

export function filterPassword(value: string) {
  return value.slice(0, LIMITS.password);
}

export function filterOtp(value: string) {
  return value.replace(/\D/g, "").slice(0, LIMITS.otp);
}

export function countDigits(value: string) {
  return (value.match(/\d/g) ?? []).length;
}

export function validateName(value: string, label = "Name") {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required`;
  if (trimmed.length > LIMITS.name) return `${label} must be at most ${LIMITS.name} characters`;
  if (!NAME_REGEX.test(trimmed)) return `${label} can only contain letters, spaces, hyphens and apostrophes`;
  return null;
}

export function validateEmail(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "Email is required";
  if (trimmed.length > LIMITS.email) return "Email is too long";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address";
  return null;
}

export function validatePhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Phone number is required";
  if (!PHONE_REGEX.test(trimmed)) return "Enter a valid phone number";
  if (countDigits(trimmed) < LIMITS.phoneMinDigits) {
    return `Phone number must have at least ${LIMITS.phoneMinDigits} digits`;
  }
  return null;
}

export function validatePassword(value: string) {
  if (!value) return "Password is required";
  if (value.length < LIMITS.passwordMin) return `Password must be at least ${LIMITS.passwordMin} characters`;
  if (value.length > LIMITS.password) return `Password must be at most ${LIMITS.password} characters`;
  if (!PASSWORD_REGEX.lower.test(value)) return "Password must include a lowercase letter";
  if (!PASSWORD_REGEX.upper.test(value)) return "Password must include an uppercase letter";
  if (!PASSWORD_REGEX.digit.test(value)) return "Password must include a number";
  if (!PASSWORD_REGEX.special.test(value)) return "Password must include a special character";
  return null;
}

export function validateRegisterForm(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}) {
  const firstNameErr = validateName(input.firstName, "First name");
  if (firstNameErr) return firstNameErr;

  const lastNameErr = validateName(input.lastName, "Last name");
  if (lastNameErr) return lastNameErr;

  const emailErr = validateEmail(input.email);
  if (emailErr) return emailErr;

  const phoneErr = validatePhone(input.phone);
  if (phoneErr) return phoneErr;

  const passwordErr = validatePassword(input.password);
  if (passwordErr) return passwordErr;

  if (input.password !== input.confirmPassword) return "Passwords do not match";

  return null;
}

export function validateLoginForm(input: { email: string; password: string }) {
  const emailErr = validateEmail(input.email);
  if (emailErr) return emailErr;

  if (!input.password) return "Password is required";
  if (input.password.length > LIMITS.password) return "Password is too long";

  return null;
}

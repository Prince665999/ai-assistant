export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}

export default { isValidEmail, isValidPassword, passwordsMatch };

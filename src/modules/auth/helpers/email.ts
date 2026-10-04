const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Похоже на адрес почты — достаточно, чтобы включить кнопку отправки кода;
// настоящую проверку делает сервер письмом.
export function isValidEmail(email: string) {
  return EMAIL_RE.test(email.trim());
}

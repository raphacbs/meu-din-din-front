const SESSION_STORAGE_KEY = "meu-din-din.session";

export interface AuthFormValues {
  email: string;
  password: string;
}

export interface AuthFormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export function validateAuthForm(values: AuthFormValues): AuthFormErrors {
  const errors: AuthFormErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Informe seu e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!values.password) {
    errors.password = "Informe sua senha.";
  } else if (values.password.length < 8) {
    errors.password = "A senha deve ter pelo menos 8 caracteres.";
  }

  return errors;
}

export function hasAuthFormErrors(errors: AuthFormErrors): boolean {
  return Boolean(errors.email || errors.password || errors.form);
}

export function readStoredSession(): { userId: string; email: string } | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export function writeStoredSession(session: { userId: string; email: string }): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function mapAuthError(status: number, message: string): string {
  if (status === 401) {
    return "E-mail ou senha inválidos.";
  }

  if (status === 409) {
    return message || "Este e-mail já está cadastrado.";
  }

  return message || "Não foi possível concluir a operação.";
}

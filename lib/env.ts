const DEFAULT_API_URL = "http://localhost:8080";

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export { DEFAULT_API_URL };

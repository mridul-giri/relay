import axios from "axios";

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: unknown } | undefined;
    if (data && typeof data.error === "string") return data.error;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

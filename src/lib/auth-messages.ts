/** Translate auth errors into friendly copy. Raw provider errors are never shown. */
export function friendlyAuthError(error: { message?: string | undefined; status?: number | undefined } | null): string {
  const raw = (error?.message ?? "").toLowerCase();

  if (raw.includes("invalid login credentials") || raw.includes("invalid password"))
    return "That email and password don't match. Please try again.";
  if (raw.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for the link.";
  if (raw.includes("user already registered") || raw.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (raw.includes("invalid email") || raw.includes("email address") )
    return "Please enter a valid email address.";
  if (raw.includes("password should be") || raw.includes("password is too short"))
    return "Please choose a password with at least 6 characters.";
  if (raw.includes("weak password") || raw.includes("pwned"))
    return "That password is too easy to guess. Please choose a stronger one.";
  if (raw.includes("rate limit") || error?.status === 429)
    return "Too many attempts just now. Please wait a minute and try again.";
  if (raw.includes("unsupported provider") || raw.includes("provider is not enabled"))
    return "Google sign-in isn't enabled for this app yet. Please use email for now.";
  if (raw.includes("popup") || raw.includes("cancel") || raw.includes("access_denied"))
    return "Google sign-in was cancelled.";
  if (raw.includes("failed to fetch") || raw.includes("network"))
    return "We couldn't connect right now. Please try again.";

  return "Something went wrong. Please try again.";
}

import { SignInButton } from "@/components/SignInButton";

export default function SignInPage() {
  return (
    <div className="card">
      <h2>Sign in</h2>
      <p>Only the configured allowlisted Google account can access this app.</p>
      <SignInButton />
    </div>
  );
}

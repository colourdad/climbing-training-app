import { SignIn, SignedIn, SignedOut } from '@clerk/clerk-react';

export function AuthGuard({ children }) {
  return (
    <>
      <SignedOut>
        <div className="auth-screen">
          <div className="auth-logo">
            <span className="auth-logo-title">Send</span>
            <span className="auth-logo-sub">Climbing Training</span>
          </div>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        {children}
      </SignedIn>
    </>
  );
}

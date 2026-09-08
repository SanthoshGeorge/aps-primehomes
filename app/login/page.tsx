"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, undefined);

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="APS PrimeHomes" className="h-14 w-auto mb-3" />
        <p className="text-sm text-gray-500 mb-6">Sign in to manage the properties.</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input className="input" id="email" name="email" type="email" required autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input className="input" id="password" name="password" type="password" required />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <SubmitButton />
        </form>

        <p className="text-xs text-gray-400 mt-6">
          Accounts are invite-only. If you were invited by email, use the link in that email first
          to set your password.
        </p>
      </div>
    </div>
  );
}

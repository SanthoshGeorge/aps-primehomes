"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { updatePassword } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Saving…" : "Set password"}
    </button>
  );
}

export default function UpdatePasswordPage() {
  const [state, formAction] = useFormState(updatePassword, undefined);

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="card">
        <h1 className="text-lg font-semibold mb-1">Set your password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Choose a password for your APS PrimeHomes account.
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="password">
              New password
            </label>
            <input className="input" id="password" name="password" type="password" required minLength={8} />
          </div>
          <div>
            <label className="label" htmlFor="confirm">
              Confirm password
            </label>
            <input className="input" id="confirm" name="confirm" type="password" required minLength={8} />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <SubmitButton />
        </form>

        <Link href="/settings" className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
          Cancel
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateName } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function SettingsForm({ currentName }: { currentName: string }) {
  const [state, formAction] = useFormState(updateName, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Display name
        </label>
        <input className="input" id="name" name="name" defaultValue={currentName} required />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Saved.</p>}
      <SubmitButton />
    </form>
  );
}

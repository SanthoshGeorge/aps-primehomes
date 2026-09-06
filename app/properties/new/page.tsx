"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createProperty } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Adding…" : "Add property"}
    </button>
  );
}

export default function NewPropertyPage() {
  const [state, formAction] = useFormState(createProperty, undefined);

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-6">Add a property</h1>
      <form action={formAction} className="card space-y-4">
        <div>
          <label className="label" htmlFor="nickname">
            Nickname / label
          </label>
          <input className="input" id="nickname" name="nickname" placeholder="e.g. Maple St" required />
        </div>
        <div>
          <label className="label" htmlFor="address">
            Address
          </label>
          <input className="input" id="address" name="address" required />
        </div>
        <div>
          <label className="label" htmlFor="property_type">
            Property type
          </label>
          <input className="input" id="property_type" name="property_type" placeholder="e.g. Single family" />
        </div>
        <div>
          <label className="label" htmlFor="date_acquired">
            Date acquired
          </label>
          <input className="input" id="date_acquired" name="date_acquired" type="date" />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <div className="flex gap-3">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

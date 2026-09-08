/** A number input with a fixed "$" prefix, for any dollar-amount field. */
export default function MoneyInput({
  id,
  name,
  defaultValue,
  required,
}: {
  id: string;
  name: string;
  defaultValue?: number | string | null;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
        $
      </span>
      <input
        className="input"
        style={{ paddingLeft: "1.5rem" }}
        id={id}
        name={name}
        type="number"
        step="0.01"
        min="0"
        defaultValue={defaultValue ?? ""}
        required={required}
      />
    </div>
  );
}

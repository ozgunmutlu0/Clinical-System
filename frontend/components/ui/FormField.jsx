export function FormField({
  label,
  as = "input",
  options = [],
  className = "",
  ...props
}) {
  return (
    <label className={`form-field ${className}`.trim()}>
      <span>{label}</span>
      {as === "textarea" ? (
        <textarea {...props} />
      ) : as === "select" ? (
        <select {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...props} />
      )}
    </label>
  );
}

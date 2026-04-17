export const clearFieldError = <
  T extends object,
  K extends keyof T,
>(
  errors: T,
  field: K,
): T => {
  if (errors[field] == null) {
    return errors;
  }

  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
};

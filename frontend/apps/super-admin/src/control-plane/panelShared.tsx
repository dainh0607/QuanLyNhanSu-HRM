export const renderFieldError = (message?: string) =>
  message ? <p className="sa-form-helper sa-form-helper--error">{message}</p> : null;

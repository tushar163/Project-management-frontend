// Manual, per-field validation rather than react-hook-form or Zod.
// Each form keeps its own field state and calls validateField on every
// keystroke (onChange) and on submit, building an errors record.

export type FormErrors = Record<string, string>;

export function validateField(name: string, value: string): string {
  switch (name) {
    case "name":
      if (!value.trim()) return "Name is required.";
      if (value.trim().length < 2) return "Name must be at least 2 characters.";
      return "";

    case "email": {
      if (!value.trim()) return "Email is required.";
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) return "Enter a valid email address.";
      return "";
    }

    case "password":
      if (!value) return "Password is required.";
      if (value.length < 8) return "Password must be at least 8 characters.";
      return "";

    case "projectName":
      if (!value.trim()) return "Project name is required.";
      if (value.trim().length > 100) return "Keep the name under 100 characters.";
      return "";

    case "title":
      if (!value.trim()) return "Task title is required.";
      if (value.trim().length > 200) return "Keep the title under 200 characters.";
      return "";

    default:
      return "";
  }
}

export function validateForm(values: Record<string, string>): FormErrors {
  const errors: FormErrors = {};
  for (const [name, value] of Object.entries(values)) {
    const error = validateField(name, value);
    if (error) errors[name] = error;
  }
  return errors;
}
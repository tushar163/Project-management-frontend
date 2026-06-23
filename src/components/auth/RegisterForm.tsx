"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { useAuth } from "../../lib/hooks/useAuth";
import { validateForm, validateField, type FormErrors } from "../../lib/validation";
import { getApiErrorMessage } from "../../lib/api/client";

type FieldName = "name" | "email" | "password";

export function RegisterForm() {
  const { register, isRegistering, registerError } = useAuth();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange =
    (name: FieldName) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const formErrors = validateForm(values);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    register(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-slate-500 mt-1">
          Start organizing your projects in minutes.
        </p>
      </div>

      <TextField name="name" isInvalid={Boolean(errors.name)}>
        <Label>Full name</Label>
        <Input
          autoComplete="name"
          value={values.name}
          onChange={handleChange("name")}
        />
        <FieldError>{errors.name}</FieldError>
      </TextField>

      <TextField name="email" type="email" isInvalid={Boolean(errors.email)}>
        <Label>Email</Label>
        <Input
          autoComplete="email"
          value={values.email}
          onChange={handleChange("email")}
        />
        <FieldError>{errors.email}</FieldError>
      </TextField>

      <TextField name="password" type="password" isInvalid={Boolean(errors.password)}>
        <Label>Password</Label>
        <Input
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange("password")}
        />
        <FieldError>{errors.password}</FieldError>
        <p className="text-xs text-slate-400 mt-1">At least 8 characters.</p>
      </TextField>

      {registerError && (
        <p className="text-sm text-red-600" role="alert">
          {getApiErrorMessage(registerError)}
        </p>
      )}

      <Button type="submit" isPending={isRegistering} fullWidth>
        Create account
      </Button>

      <p className="text-sm text-slate-500 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
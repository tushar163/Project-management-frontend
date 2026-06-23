"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";
import { useAuth } from "../../lib/hooks/useAuth";
import { validateField, type FormErrors } from "../../lib/validation";
import { getApiErrorMessage } from "../../lib/api/client";

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange =
    (name: "email" | "password") => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValues((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const emailError = validateField("email", values.email);
    const passwordError = validateField("password", values.password);
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    login(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back. Enter your details to continue.
        </p>
      </div>

      <TextField name="email" type="email" isInvalid={Boolean(errors.email)}>
        <Label>Email</Label>
        <Input
          placeholder="you@example.com"
          autoComplete="email"
          value={values.email}
          onChange={handleChange("email")}
        />
        <FieldError>{errors.email}</FieldError>
      </TextField>

      <TextField name="password" type="password" isInvalid={Boolean(errors.password)}>
        <Label>Password</Label>
        <Input
          placeholder="••••••••"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange("password")}
        />
        <FieldError>{errors.password}</FieldError>
      </TextField>

      {loginError && (
        <p className="text-sm text-red-600" role="alert">
          {getApiErrorMessage(loginError)}
        </p>
      )}

      <Button type="submit" isPending={isLoggingIn} fullWidth>
        Sign in
      </Button>

      <p className="text-sm text-slate-500 text-center">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
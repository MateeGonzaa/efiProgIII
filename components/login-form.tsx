"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import { useAuth } from "@/components/providers";
import { FormField } from "@/components/form-field";
import { Icon } from "@/components/icon";

export function LoginForm({ nextPath = "/cuenta/pedidos" }: { nextPath?: string }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const onSubmit = handleSubmit(async (values) => {
    setApiError("");
    try {
      await signIn(values.username, values.password);
      router.replace(nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/cuenta/pedidos");
    } catch (error) { setApiError(error instanceof Error ? error.message : "No pudimos iniciar sesión."); }
  });

  return <form className="auth-form" onSubmit={onSubmit} noValidate>
    {apiError && <div className="form-api-error" role="alert"><Icon name="close" size={16}/>{apiError}</div>}
    <FormField label="USUARIO" error={errors.username?.message}><input autoComplete="username" placeholder="Tu nombre de usuario" {...register("username")}/></FormField>
    <FormField label="CONTRASEÑA" error={errors.password?.message}><div className="password-input"><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Tu contraseña" {...register("password")}/><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "OCULTAR" : "VER"}</button></div></FormField>
    <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "ENTRANDO…" : "ENTRAR A LA CUEVA"}<Icon name="arrow" size={16}/></button>
    <p className="form-footnote"><Icon name="shield" size={15}/> Tus datos viajan protegidos con autenticación por token.</p>
  </form>;
}

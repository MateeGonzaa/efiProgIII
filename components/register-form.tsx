"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/lib/schemas";
import { useAuth } from "@/components/providers";
import { FormField } from "@/components/form-field";
import { Icon } from "@/components/icon";

export function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [apiError, setApiError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const onSubmit = handleSubmit(async ({ username, email, password, telefono }) => {
    setApiError("");
    try { await signUp({ username, email, password, telefono }); router.replace("/cuenta/perfil"); }
    catch (error) { setApiError(error instanceof Error ? error.message : "No pudimos crear tu cuenta."); }
  });
  return <form className="auth-form" onSubmit={onSubmit} noValidate>
    {apiError && <div className="form-api-error" role="alert"><Icon name="close" size={16}/>{apiError}</div>}
    <FormField label="USUARIO" error={errors.username?.message}><input autoComplete="username" placeholder="Al menos 3 caracteres" {...register("username")}/></FormField>
    <FormField label="EMAIL" error={errors.email?.message}><input type="email" autoComplete="email" placeholder="vos@ejemplo.com" {...register("email")}/></FormField>
    <FormField label="TELÉFONO" error={errors.telefono?.message} hint="Opcional · máximo 20 caracteres"><input type="tel" autoComplete="tel" placeholder="351 000 0000" {...register("telefono")}/></FormField>
    <FormField label="CONTRASEÑA" error={errors.password?.message}><input type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" {...register("password")}/></FormField>
    <button className="button button-primary auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "CREANDO CUENTA…" : "CREAR MI CUENTA"}<Icon name="arrow" size={16}/></button>
    <p className="form-footnote"><Icon name="spark" size={15}/> Al entrar, completá tu dirección para empezar a pedir.</p>
  </form>;
}

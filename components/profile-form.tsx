"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, getCustomerProfile } from "@/lib/api";
import { profileSchema, type ProfileValues } from "@/lib/schemas";
import { useAuth } from "@/components/providers";
import type { CustomerProfile } from "@/lib/types";
import { FormField } from "@/components/form-field";
import { ErrorNotice } from "@/components/status";
import { Icon } from "@/components/icon";

export function ProfileForm() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (!session) return;
    getCustomerProfile(session.token).then((data) => { setProfile(data); if (data) reset(data); }).catch((error: unknown) => setApiError(error instanceof Error ? error.message : "No pudimos cargar tu perfil.")).finally(() => setLoading(false));
  }, [session, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!session) return;
    setApiError(""); setSaved(false);
    try {
      const result = await apiRequest<CustomerProfile>(profile ? `clientes/${profile.id}/` : "clientes/", { method: profile ? "PATCH" : "POST", token: session.token, body: JSON.stringify(values) });
      setProfile(result); setSaved(true);
    } catch (error) { setApiError(error instanceof Error ? error.message : "No se pudo guardar el perfil."); }
  });

  if (loading) return <div className="account-loading"><span className="loading-orbit"/>CARGANDO PERFIL…</div>;
  return <div className="account-card profile-card"><div className="account-card-head"><div><span className="eyebrow">DATOS DE ENVÍO</span><h2>{profile ? "Tu dirección." : "Completá tu perfil."}</h2></div><span className="account-head-icon"><Icon name="user" size={22}/></span></div><p className="account-intro">Usamos esta información para preparar y enviar tus pedidos.</p>
    {apiError && <ErrorNotice message={apiError}/>}{saved && <div className="success-notice" role="status"><Icon name="check" size={16}/> Perfil guardado. Ya podés armar tu próximo pedido.</div>}
    <form className="profile-form" onSubmit={onSubmit} noValidate><FormField label="DIRECCIÓN DE ENVÍO" error={errors.direccion_envio?.message}><textarea rows={3} placeholder="Calle, número, piso y departamento" {...register("direccion_envio")}/></FormField><FormField label="CIUDAD" error={errors.ciudad?.message}><input placeholder="Córdoba" {...register("ciudad")}/></FormField><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting ? "GUARDANDO…" : profile ? "ACTUALIZAR PERFIL" : "GUARDAR PERFIL"}<Icon name="arrow" size={16}/></button></form>
  </div>;
}

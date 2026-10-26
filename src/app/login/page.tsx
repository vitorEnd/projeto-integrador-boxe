import AuthForm from "@/components/auth-form";
export default async function Login({ searchParams }: { searchParams: Promise<{ cadastro?: string }> }) {
  const params = await searchParams;
  return <>{params.cadastro === "ok" && <p role="status" className="status-success mx-auto mb-4 max-w-5xl">Conta criada com sucesso. Agora entre para completar seu perfil.</p>}<AuthForm mode="login" /></>;
}

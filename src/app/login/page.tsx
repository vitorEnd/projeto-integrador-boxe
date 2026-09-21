import AuthForm from "@/components/auth-form";
export default async function Login({ searchParams }: { searchParams: Promise<{ cadastro?: string }> }) {
  const params = await searchParams;
  return <>{params.cadastro === "ok" && <p role="status" className="mx-auto mb-4 max-w-md rounded-lg bg-green-900 p-3 text-green-100">Cadastro realizado com sucesso. Faça login.</p>}<AuthForm mode="login" /></>;
}

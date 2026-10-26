"use client";
import { useRouter } from "next/navigation";
export default function LogoutButton() {
  const router = useRouter();
  return <button type="button" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm font-semibold text-neutral-400 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white">Sair</button>;
}

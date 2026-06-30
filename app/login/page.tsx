"use client"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-xl flex flex-col items-center gap-6">
        <h1 className="text-white text-3xl font-bold">🎲 LudoGrupo</h1>
        <p className="text-gray-400 text-sm">Acesso restrito ao grupo</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition"
        >
          Entrar com Google
        </button>
      </div>
    </div>
  )
}
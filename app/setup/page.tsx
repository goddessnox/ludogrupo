"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [userEmail, setUserEmail] = useState("")
  const [form, setForm] = useState({
    nome: "",
    username_ludopedia: "",
    ludo_cookies: "",
    senha: "",
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const router = useRouter()

  useEffect(() => {
    buscarEmail()
  }, [])

  async function buscarEmail() {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    if (!data?.user?.email) {
      router.push("/login")
      return
    }
    setUserEmail(data.user.email)

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("email")
      .eq("email", data.user.email)
      .single()

    if (usuario) {
      router.push("/")
    }
  }

  async function salvar() {
    if (!form.nome || !form.senha) return
    setErro("")
    setSalvando(true)

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, ...form }),
    })

    const data = await res.json()

    if (!res.ok) {
      setErro(data.erro)
      setSalvando(false)
      return
    }

    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold">⛤ Bem-vindo ao Pentagono</h1>
          <p className="text-gray-400 text-sm mt-1">Complete seu cadastro pra entrar no grupo.</p>
          <p className="text-gray-500 text-xs mt-1">{userEmail}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Senha do grupo</label>
            <input
              type="password"
              className="bg-gray-700 rounded-xl px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Peca pro Gus"
              value={form.senha}
              onChange={e => setForm({ ...form, senha: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Seu nome</label>
            <input
              className="bg-gray-700 rounded-xl px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Como quer ser chamado"
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Username na Ludopedia (opcional)</label>
            <input
              className="bg-gray-700 rounded-xl px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="ex: GustavoMoura"
              value={form.username_ludopedia}
              onChange={e => setForm({ ...form, username_ludopedia: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Cookie da Ludopedia (opcional)</label>
            <p className="text-xs text-gray-500 mb-2">
              Entre na Ludopedia, abra o DevTools (F12), va em Network, recarregue a pagina, clique em qualquer requisicao e copie o valor do campo Cookie em Request Headers. Voce pode fazer isso depois no seu Perfil.
            </p>
            <textarea
              className="bg-gray-700 rounded-xl px-4 py-2 text-white w-full h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              placeholder="Cole o cookie aqui..."
              value={form.ludo_cookies}
              onChange={e => setForm({ ...form, ludo_cookies: e.target.value })}
            />
          </div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl transition disabled:opacity-50 w-full"
          >
            {salvando ? "Entrando..." : "Entrar no grupo"}
          </button>
        </div>
      </div>
    </div>
  )
}
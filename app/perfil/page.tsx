"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function PerfilPage() {
  const [userEmail, setUserEmail] = useState("")
  const [cookies, setCookies] = useState("")
  const [username, setUsername] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    buscarDados()
  }, [])

  async function buscarDados() {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    const email = data?.user?.email ?? ""
    setUserEmail(email)

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("username_ludopedia, ludo_cookies")
      .eq("email", email)
      .single()

    if (usuario) {
      setUsername(usuario.username_ludopedia ?? "")
      setCookies(usuario.ludo_cookies ?? "")
    }
  }

  async function salvar() {
    setSalvando(true)
    await supabase
      .from("usuarios")
      .update({ username_ludopedia: username, ludo_cookies: cookies })
      .eq("email", userEmail)
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">⛤ Pentagono da Maldade ⛤</h1>
        <span className="text-gray-400 text-sm">{userEmail}</span>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex gap-6">
        <a href="/" className="text-gray-400 hover:text-white transition">Dashboard</a>
        <a href="/colecao" className="text-gray-400 hover:text-white transition">Colecao</a>
        <a href="/partidas" className="text-gray-400 hover:text-white transition">Partidas</a>
        <a href="/rankings" className="text-gray-400 hover:text-white transition">Rankings</a>
        <a href="/leiloes" className="text-gray-400 hover:text-white transition">Leiloes</a>
        <a href="/perfil" className="text-white font-semibold border-b-2 border-indigo-500 pb-1">Perfil</a>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-6">Meu Perfil</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Username na Ludopedia</label>
              <input
                className="bg-gray-700 rounded-xl px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ex: GustavoMoura"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Cookie da Ludopedia</label>
              <p className="text-xs text-gray-500 mb-2">
                Entre na Ludopedia, abra o DevTools (F12), va em Network, recarregue a pagina, clique em qualquer requisicao e copie o valor completo do campo Cookie em Request Headers.
              </p>
              <textarea
                className="bg-gray-700 rounded-xl px-4 py-2 text-white w-full h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                placeholder="Cole o cookie aqui..."
                value={cookies}
                onChange={e => setCookies(e.target.value)}
              />
            </div>

            <button
              onClick={salvar}
              disabled={salvando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl transition disabled:opacity-50"
            >
              {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
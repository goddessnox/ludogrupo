"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Partida = {
  id: string
  jogo_nome: string
  jogo_imagem: string
  data: string
  duracao_minutos: number | null
  vencedor_email: string | null
  jogadores: string[]
}

type Usuario = {
  email: string
  nome: string
}

export default function PartidasPage() {
  const [partidas, setPartidas] = useState<Partida[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [userEmail, setUserEmail] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [buscaJogo, setBuscaJogo] = useState("")
  const [resultados, setResultados] = useState<any[]>([])
  const [jogoSelecionado, setJogoSelecionado] = useState<any>(null)
  const [form, setForm] = useState({
    data: "",
    duracao_minutos: "",
    vencedor_email: "",
    jogadores: [] as string[],
  })

  useEffect(() => {
    buscarEmail()
    buscarUsuarios()
    buscarPartidas()
  }, [])

  async function buscarEmail() {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    setUserEmail(data?.user?.email ?? "")
  }

  async function buscarUsuarios() {
    const { data } = await supabase.from("usuarios").select("email, nome")
    setUsuarios(data ?? [])
  }

  async function buscarPartidas() {
    const { data } = await supabase
      .from("partidas")
      .select("*")
      .order("data", { ascending: false })
    setPartidas(data ?? [])
  }

  async function buscarJogo(nome: string) {
    if (nome.length < 2) { setResultados([]); return }
    const res = await fetch(`/api/ludopedia/buscar?q=${encodeURIComponent(nome)}`)
    const data = await res.json()
    setResultados(data.jogos ?? [])
  }

  async function salvarPartida() {
    if (!jogoSelecionado || !form.data || form.jogadores.length === 0) return
    setSalvando(true)
    await supabase.from("partidas").insert({
      jogo_id: String(jogoSelecionado.id_jogo),
      jogo_nome: jogoSelecionado.nm_jogo,
      jogo_imagem: jogoSelecionado.img_jogo,
      data: form.data,
      duracao_minutos: form.duracao_minutos ? parseInt(form.duracao_minutos) : null,
      vencedor_email: form.vencedor_email || null,
      jogadores: form.jogadores,
    })
    setJogoSelecionado(null)
    setBuscaJogo("")
    setForm({ data: "", duracao_minutos: "", vencedor_email: "", jogadores: [] })
    await buscarPartidas()
    setSalvando(false)
  }

  function toggleJogador(email: string) {
    setForm(prev => ({
      ...prev,
      jogadores: prev.jogadores.includes(email)
        ? prev.jogadores.filter(e => e !== email)
        : [...prev.jogadores, email]
    }))
  }

  function nomeDoEmail(email: string) {
    return usuarios.find(u => u.email === email)?.nome ?? email
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
        <a href="/desejos" className="text-gray-400 hover:text-white transition">Desejos</a>
        <a href="/partidas" className="text-white font-semibold border-b-2 border-indigo-500 pb-1">Partidas</a>
        <a href="/rankings" className="text-gray-400 hover:text-white transition">Rankings</a>
        <a href="/leiloes" className="text-gray-400 hover:text-white transition">Leiloes</a>
        <a href="/perfil" className="text-gray-400 hover:text-white transition">Perfil</a>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4">Registrar Partida</h2>
          <div className="space-y-4">
            <div className="relative">
              <input
                className="bg-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                placeholder="Buscar jogo..."
                value={buscaJogo}
                onChange={e => { setBuscaJogo(e.target.value); buscarJogo(e.target.value) }}
              />
              {resultados.length > 0 && (
                <div className="absolute z-10 w-full bg-gray-700 rounded-xl mt-1 max-h-48 overflow-y-auto">
                  {resultados.map((j: any) => (
                    <div
                      key={j.id_jogo}
                      className="px-4 py-2 hover:bg-gray-600 cursor-pointer flex items-center gap-3"
                      onClick={() => { setJogoSelecionado(j); setBuscaJogo(j.nm_jogo); setResultados([]) }}
                    >
                      {j.img_jogo && <img src={j.img_jogo} className="w-8 h-8 object-cover rounded" />}
                      <span className="text-sm">{j.nm_jogo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Data</label>
                <input
                  type="date"
                  className="bg-gray-700 rounded-xl px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Duracao (minutos)</label>
                <input
                  type="number"
                  className="bg-gray-700 rounded-xl px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ex: 90"
                  value={form.duracao_minutos}
                  onChange={e => setForm({ ...form, duracao_minutos: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Quem jogou</label>
              <div className="flex flex-wrap gap-2">
                {usuarios.map(u => (
                  <button
                    key={u.email}
                    onClick={() => toggleJogador(u.email)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      form.jogadores.includes(u.email)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {u.nome}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Vencedor</label>
              <select
                className="bg-gray-700 rounded-xl px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.vencedor_email}
                onChange={e => setForm({ ...form, vencedor_email: e.target.value })}
              >
                <option value="">Sem vencedor / Cooperativo</option>
                {form.jogadores.map(email => (
                  <option key={email} value={email}>{nomeDoEmail(email)}</option>
                ))}
              </select>
            </div>

            <button
              onClick={salvarPartida}
              disabled={salvando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl transition disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Registrar"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">Ultimas Partidas</h2>
          {partidas.length === 0 && <p className="text-gray-400">Nenhuma partida registrada ainda.</p>}
          {partidas.map(p => (
            <div key={p.id} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 flex gap-4 items-start">
              {p.jogo_imagem && (
                <img src={p.jogo_imagem} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-bold text-lg">{p.jogo_nome}</p>
                <p className="text-gray-400 text-sm">{new Date(p.data).toLocaleDateString("pt-BR")}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(p.jogadores ?? []).map(email => (
                    <span
                      key={email}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        email === p.vencedor_email
                          ? "bg-yellow-600 text-yellow-100"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {email === p.vencedor_email ? "🏆 " : ""}{nomeDoEmail(email)}
                    </span>
                  ))}
                </div>
                {p.duracao_minutos && (
                  <p className="text-gray-500 text-xs mt-1">{p.duracao_minutos} minutos</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
"use client"
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"

type Jogo = {
  id_jogo: number
  nm_jogo: string
  img_jogo: string
  nota: number | null
}

type MembroColecao = {
  nome: string
  email: string
  username: string
  jogos: Jogo[]
  carregando: boolean
  erro: boolean
}

export default function ColecaoPage() {
  const [membros, setMembros] = useState<MembroColecao[]>([])
  const [busca, setBusca] = useState("")
  const [filtroMembro, setFiltroMembro] = useState("todos")

  useEffect(() => {
    carregarMembros()
  }, [])

  async function carregarMembros() {
    const { data: usuarios } = await supabase
      .from("usuarios")
      .select("nome, email, username_ludopedia")
      .not("username_ludopedia", "is", null)

    if (!usuarios) return

    const inicial = usuarios.map(u => ({
      nome: u.nome,
      email: u.email,
      username: u.username_ludopedia,
      jogos: [],
      carregando: true,
      erro: false,
    }))
    setMembros(inicial)

    for (const usuario of usuarios) {
      try {
        const res = await fetch(`/api/ludopedia/colecao?username=${usuario.username_ludopedia}`)
        const data = await res.json()
        setMembros(prev => prev.map(m =>
          m.username === usuario.username_ludopedia
            ? { ...m, jogos: data.jogos ?? [], carregando: false }
            : m
        ))
      } catch {
        setMembros(prev => prev.map(m =>
          m.username === usuario.username_ludopedia
            ? { ...m, carregando: false, erro: true }
            : m
        ))
      }
    }
  }

  const jogosFiltrados = useMemo(() => {
    const todosJogos = membros.flatMap(m => m.jogos.map(j => ({ ...j, dono: m.nome, donoEmail: m.email })))
    const jogosUnicos = [...new Map(todosJogos.map(j => [j.id_jogo, j])).values()]

    return jogosUnicos.filter(j => {
      const matchBusca = j.nm_jogo.toLowerCase().includes(busca.toLowerCase())
      const matchMembro = filtroMembro === "todos" || todosJogos.some(tj => tj.id_jogo === j.id_jogo && tj.donoEmail === filtroMembro)
      return matchBusca && matchMembro
    })
  }, [membros, busca, filtroMembro])

  function donosDojogo(id_jogo: number) {
    return membros.filter(m => m.jogos.some(j => j.id_jogo === id_jogo)).map(m => m.nome)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">⛤ Pentagono da Maldade ⛤</h1>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex gap-6">
        <a href="/" className="text-gray-400 hover:text-white transition">Dashboard</a>
        <a href="/colecao" className="text-white font-semibold border-b-2 border-indigo-500 pb-1">Colecao</a>
        <a href="/partidas" className="text-gray-400 hover:text-white transition">Partidas</a>
        <a href="/rankings" className="text-gray-400 hover:text-white transition">Rankings</a>
        <a href="/leiloes" className="text-gray-400 hover:text-white transition">Leiloes</a>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex flex-wrap gap-4 mb-8">
          <input
            className="bg-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-48"
            placeholder="Buscar jogo..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <select
            className="bg-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filtroMembro}
            onChange={e => setFiltroMembro(e.target.value)}
          >
            <option value="todos">Todos os membros</option>
            {membros.map(m => (
              <option key={m.email} value={m.email}>{m.nome}</option>
            ))}
          </select>
        </div>

        <div className="mb-4 text-gray-400 text-sm">{jogosFiltrados.length} jogos encontrados</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {jogosFiltrados.map(jogo => {
            const donos = donosDojogo(jogo.id_jogo)
            return (
              <div key={jogo.id_jogo} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-indigo-500 transition group">
                {jogo.img_jogo && (
                  <img
                    src={jogo.img_jogo}
                    alt={jogo.nm_jogo}
                    className="w-full aspect-square object-cover"
                  />
                )}
                <div className="p-3">
                  <p className="font-semibold text-sm leading-tight mb-2">{jogo.nm_jogo}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {donos.map(d => (
                      <span key={d} className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">{d}</span>
                    ))}
                  </div>
                  <a
                    href={`https://comparajogos.com.br/item/${jogo.nm_jogo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Ver preco
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {membros.some(m => m.carregando) && (
          <div className="text-center text-gray-400 mt-8">Carregando colecoes...</div>
        )}

        {membros.some(m => m.erro) && (
          <div className="text-center text-red-400 mt-4">Erro ao carregar alguns membros.</div>
        )}

      </main>
    </div>
  )
}
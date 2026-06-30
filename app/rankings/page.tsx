"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Usuario = {
  email: string
  nome: string
}

type RankingItem = {
  nome: string
  email: string
  vitorias: number
  partidas: number
  taxaVitoria: number
}

type JogoRanking = {
  jogo_nome: string
  jogo_imagem: string
  partidas: number
  vencedor: string | null
}

export default function RankingsPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [partidas, setPartidas] = useState<any[]>([])
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [jogosFrequentes, setJogosFrequentes] = useState<JogoRanking[]>([])

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const { data: users } = await supabase.from("usuarios").select("email, nome")
    const { data: parts } = await supabase.from("partidas").select("*")

    setUsuarios(users ?? [])
    setPartidas(parts ?? [])

    calcularRanking(users ?? [], parts ?? [])
    calcularJogos(parts ?? [])
  }

  function calcularRanking(users: Usuario[], parts: any[]) {
    const stats = users.map(u => {
      const minhasPartidas = parts.filter(p => p.jogadores?.includes(u.email))
      const minhasVitorias = parts.filter(p => p.vencedor_email === u.email)
      return {
        nome: u.nome,
        email: u.email,
        vitorias: minhasVitorias.length,
        partidas: minhasPartidas.length,
        taxaVitoria: minhasPartidas.length > 0
          ? Math.round((minhasVitorias.length / minhasPartidas.length) * 100)
          : 0,
      }
    })
    setRanking(stats.sort((a, b) => b.vitorias - a.vitorias))
  }

  function calcularJogos(parts: any[]) {
    const mapa: Record<string, any> = {}
    parts.forEach(p => {
      if (!mapa[p.jogo_nome]) {
        mapa[p.jogo_nome] = {
          jogo_nome: p.jogo_nome,
          jogo_imagem: p.jogo_imagem,
          partidas: 0,
          vitorias: {} as Record<string, number>,
        }
      }
      mapa[p.jogo_nome].partidas++
      if (p.vencedor_email) {
        mapa[p.jogo_nome].vitorias[p.vencedor_email] = (mapa[p.jogo_nome].vitorias[p.vencedor_email] ?? 0) + 1
      }
    })

    const lista = Object.values(mapa).map((j: any) => {
      const vencedorEmail = Object.entries(j.vitorias).sort((a: any, b: any) => b[1] - a[1])[0]?.[0]
      const vencedorNome = usuarios.find(u => u.email === vencedorEmail)?.nome ?? null
      return {
        jogo_nome: j.jogo_nome,
        jogo_imagem: j.jogo_imagem,
        partidas: j.partidas,
        vencedor: vencedorNome,
      }
    })

    setJogosFrequentes(lista.sort((a, b) => b.partidas - a.partidas))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">⛤ Pentagono da Maldade ⛤</h1>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex gap-6">
        <a href="/" className="text-gray-400 hover:text-white transition">Dashboard</a>
        <a href="/colecao" className="text-gray-400 hover:text-white transition">Colecao</a>
        <a href="/desejos" className="text-gray-400 hover:text-white transition">Desejos</a>
        <a href="/partidas" className="text-gray-400 hover:text-white transition">Partidas</a>
        <a href="/rankings" className="text-white font-semibold border-b-2 border-indigo-500 pb-1">Rankings</a>
        <a href="/leiloes" className="text-gray-400 hover:text-white transition">Leiloes</a>
        <a href="/perfil" className="text-gray-400 hover:text-white transition">Perfil</a>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4">🏆 Ranking Geral</h2>
          <div className="space-y-3">
            {ranking.map((r, i) => (
              <div key={r.email} className="flex items-center gap-4 bg-gray-700 rounded-xl p-4">
                <span className="text-2xl font-bold text-gray-400 w-8">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{r.nome}</p>
                  <p className="text-gray-400 text-sm">{r.partidas} partidas jogadas</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-400">{r.vitorias} vitorias</p>
                  <p className="text-gray-400 text-sm">{r.taxaVitoria}% de aproveitamento</p>
                </div>
              </div>
            ))}
            {ranking.length === 0 && <p className="text-gray-400">Nenhuma partida registrada ainda.</p>}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4">🎲 Jogos mais jogados</h2>
          <div className="space-y-3">
            {jogosFrequentes.map(j => (
              <div key={j.jogo_nome} className="flex items-center gap-4 bg-gray-700 rounded-xl p-4">
                {j.jogo_imagem && (
                  <img src={j.jogo_imagem} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{j.jogo_nome}</p>
                  <p className="text-gray-400 text-sm">{j.partidas} {j.partidas === 1 ? "partida" : "partidas"}</p>
                </div>
                {j.vencedor && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Quem mais ganha</p>
                    <p className="text-yellow-400 font-semibold text-sm">{j.vencedor}</p>
                  </div>
                )}
              </div>
            ))}
            {jogosFrequentes.length === 0 && <p className="text-gray-400">Nenhuma partida registrada ainda.</p>}
          </div>
        </div>

      </main>
    </div>
  )
}
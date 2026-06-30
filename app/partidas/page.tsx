"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "../components/header"

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
  const [userEmail, setUserEmail] = useState("")
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [jogosFrequentes, setJogosFrequentes] = useState<JogoRanking[]>([])

  useEffect(() => {
    buscarEmail()
    carregarDados()
  }, [])

  async function buscarEmail() {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    setUserEmail(data?.user?.email ?? "")
  }

  async function carregarDados() {
    const { data: users } = await supabase.from("usuarios").select("email, nome")
    const { data: parts } = await supabase.from("partidas").select("*")
    setUsuarios(users ?? [])
    calcularRanking(users ?? [], parts ?? [])
    calcularJogos(users ?? [], parts ?? [])
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
        taxaVitoria: minhasPartidas.length > 0 ? Math.round((minhasVitorias.length / minhasPartidas.length) * 100) : 0,
      }
    })
    setRanking(stats.sort((a, b) => b.vitorias - a.vitorias))
  }

  function calcularJogos(users: Usuario[], parts: any[]) {
    const mapa: Record<string, any> = {}
    parts.forEach(p => {
      if (!mapa[p.jogo_nome]) {
        mapa[p.jogo_nome] = { jogo_nome: p.jogo_nome, jogo_imagem: p.jogo_imagem, partidas: 0, vitorias: {} as Record<string, number> }
      }
      mapa[p.jogo_nome].partidas++
      if (p.vencedor_email) {
        mapa[p.jogo_nome].vitorias[p.vencedor_email] = (mapa[p.jogo_nome].vitorias[p.vencedor_email] ?? 0) + 1
      }
    })
    const lista = Object.values(mapa).map((j: any) => {
      const vencedorEmail = Object.entries(j.vitorias).sort((a: any, b: any) => b[1] - a[1])[0]?.[0]
      const vencedorNome = users.find(u => u.email === vencedorEmail)?.nome ?? null
      return { jogo_nome: j.jogo_nome, jogo_imagem: j.jogo_imagem, partidas: j.partidas, vencedor: vencedorNome }
    })
    setJogosFrequentes(lista.sort((a, b) => b.partidas - a.partidas))
  }

  const medalhas = ["ti-medal", "ti-medal", "ti-medal"]
  const medalhasCores = ["#c9a227", "#9e9e9e", "#a0522d"]

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header email={userEmail} />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

        <div className="pg-card" style={{ marginBottom: 24 }}>
          <div className="pg-card-accent"></div>
          <div className="pg-section-title">
            <i className="ti ti-trophy" aria-hidden="true"></i> Ranking Geral
          </div>

          {ranking.length === 0 && (
            <p style={{ color: "#6b6655", fontSize: 13, fontFamily: "'Cinzel', serif" }}>Nenhuma partida registrada ainda.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ranking.map((r, i) => (
              <div key={r.email} style={{ display: "flex", alignItems: "center", gap: 16, background: "#0d0f0c", border: "1px solid #1e1a0f", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ width: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i < 3
                    ? <i className={`ti ${medalhas[i]}`} style={{ fontSize: 20, color: medalhasCores[i] }} aria-hidden="true"></i>
                    : <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 14, color: "#6b6655" }}>{i + 1}</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 600, color: "#e8e3d0", marginBottom: 2 }}>{r.nome}</p>
                  <p style={{ fontSize: 11, color: "#6b6655" }}>{r.partidas} partidas jogadas</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, color: "#8b1a1a", lineHeight: 1 }}>{r.vitorias}</p>
                  <p style={{ fontSize: 10, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em" }}>{r.taxaVitoria}% aproveitamento</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pg-section-title">
          <i className="ti ti-books" aria-hidden="true"></i> Jogos mais jogados
        </div>

        {jogosFrequentes.length === 0 && (
          <p style={{ color: "#6b6655", fontSize: 13, fontFamily: "'Cinzel', serif" }}>Nenhuma partida registrada ainda.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {jogosFrequentes.map(j => (
            <div key={j.jogo_nome} className="pg-card">
              <div className="pg-card-accent"></div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {j.jogo_imagem && (
                  <img src={j.jogo_imagem} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #2a1f1f", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 600, color: "#e8e3d0", marginBottom: 2 }}>{j.jogo_nome}</p>
                  <p style={{ fontSize: 11, color: "#6b6655" }}>{j.partidas} {j.partidas === 1 ? "partida" : "partidas"}</p>
                </div>
                {j.vencedor && (
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: "#6b6655", fontFamily: "'Cinzel', serif", marginBottom: 2 }}>Quem mais ganha</p>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: "#c9a227", fontWeight: 600 }}>
                      <i className="ti ti-crown" style={{ marginRight: 4 }} aria-hidden="true"></i>{j.vencedor}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
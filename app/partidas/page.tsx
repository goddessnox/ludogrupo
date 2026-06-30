"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "../components/header"

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
    const { data } = await supabase.from("partidas").select("*").order("data", { ascending: false })
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
    <div style={{ minHeight: "100vh" }}>
      <Header email={userEmail} />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

        <div className="pg-card" style={{ marginBottom: 24 }}>
          <div className="pg-card-accent"></div>
          <div className="pg-section-title">
            <i className="ti ti-sword" aria-hidden="true"></i> Registrar Partida
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <input
                className="pg-input"
                placeholder="Buscar jogo..."
                value={buscaJogo}
                onChange={e => { setBuscaJogo(e.target.value); buscarJogo(e.target.value) }}
              />
              {resultados.length > 0 && (
                <div style={{ position: "absolute", zIndex: 10, width: "100%", background: "#111410", border: "1px solid #2a1f1f", borderRadius: 10, marginTop: 4, maxHeight: 200, overflowY: "auto" }}>
                  {resultados.map((j: any) => (
                    <div
                      key={j.id_jogo}
                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1e1a0f" }}
                      onClick={() => { setJogoSelecionado(j); setBuscaJogo(j.nm_jogo); setResultados([]) }}
                    >
                      {j.img_jogo && <img src={j.img_jogo} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 6 }} />}
                      <span style={{ fontSize: 12, color: "#e8e3d0", fontFamily: "'Cinzel', serif" }}>{j.nm_jogo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", marginBottom: 6, letterSpacing: "0.04em" }}>Data</p>
                <input type="date" className="pg-input" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", marginBottom: 6, letterSpacing: "0.04em" }}>Duracao (minutos)</p>
                <input type="number" className="pg-input" placeholder="ex: 90" value={form.duracao_minutos} onChange={e => setForm({ ...form, duracao_minutos: e.target.value })} />
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", marginBottom: 10, letterSpacing: "0.04em" }}>Quem jogou</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {usuarios.map(u => (
                  <button
                    key={u.email}
                    onClick={() => toggleJogador(u.email)}
                    className={form.jogadores.includes(u.email) ? "pg-btn" : "pg-btn-ghost"}
                    style={{ fontSize: 11, padding: "8px 16px" }}
                  >
                    {u.nome}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", marginBottom: 6, letterSpacing: "0.04em" }}>Vencedor</p>
              <select className="pg-input" value={form.vencedor_email} onChange={e => setForm({ ...form, vencedor_email: e.target.value })}>
                <option value="">Sem vencedor / Cooperativo</option>
                {form.jogadores.map(email => (
                  <option key={email} value={email}>{nomeDoEmail(email)}</option>
                ))}
              </select>
            </div>

            <button className="pg-btn" onClick={salvarPartida} disabled={salvando}>
              {salvando ? "Salvando..." : "Registrar Partida"}
            </button>
          </div>
        </div>

        <div className="pg-section-title">
          <i className="ti ti-history" aria-hidden="true"></i> Ultimas Partidas
        </div>

        {partidas.length === 0 && (
          <p style={{ color: "#6b6655", fontSize: 13, fontFamily: "'Cinzel', serif" }}>Nenhuma partida registrada ainda.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {partidas.map(p => (
            <div key={p.id} className="pg-card">
              <div className="pg-card-accent"></div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {p.jogo_imagem && (
                  <img src={p.jogo_imagem} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: "1px solid #2a1f1f" }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 600, color: "#e8e3d0", marginBottom: 4 }}>{p.jogo_nome}</p>
                  <p style={{ fontSize: 11, color: "#6b6655", marginBottom: 8 }}>{new Date(p.data).toLocaleDateString("pt-BR")}{p.duracao_minutos ? ` — ${p.duracao_minutos} min` : ""}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(p.jogadores ?? []).map(email => (
                      <span
                        key={email}
                        style={{
                          fontSize: 11,
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontFamily: "'Cinzel', serif",
                          background: email === p.vencedor_email ? "#3d1010" : "#111410",
                          border: `1px solid ${email === p.vencedor_email ? "#8b1a1a" : "#1e1a0f"}`,
                          color: email === p.vencedor_email ? "#e8e3d0" : "#6b6655",
                        }}
                      >
                        {email === p.vencedor_email && <i className="ti ti-crown" style={{ marginRight: 4 }} aria-hidden="true"></i>}
                        {nomeDoEmail(email)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
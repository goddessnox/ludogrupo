"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "../components/header"

type Leilao = {
  id: string
  usuario_email: string
  jogo_nome: string
  link_leilao: string
  encerra_em: string
  status: string
  resultado: string | null
}

function Countdown({ encerra_em }: { encerra_em: string }) {
  const [tempo, setTempo] = useState("")
  const [urgente, setUrgente] = useState(false)

  useEffect(() => {
    const calcular = () => {
      const diff = new Date(encerra_em).getTime() - Date.now()
      if (diff <= 0) { setTempo("Encerrado"); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setUrgente(diff < 3600000)
      setTempo(`${h}h ${m}m ${s}s`)
    }
    calcular()
    const interval = setInterval(calcular, 1000)
    return () => clearInterval(interval)
  }, [encerra_em])

  return (
    <span style={{ color: urgente ? "#c94444" : "#4a7c59", fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 600 }}>
      {tempo}
    </span>
  )
}

function DateTimePicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [dia, setDia] = useState("")
  const [mes, setMes] = useState("")
  const [ano, setAno] = useState("")
  const [hora, setHora] = useState("")
  const [minuto, setMinuto] = useState("")

  useEffect(() => {
    if (dia && mes && ano && hora && minuto) {
      const iso = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T${hora.padStart(2, "0")}:${minuto.padStart(2, "0")}`
      onChange(iso)
    }
  }, [dia, mes, ano, hora, minuto])

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
      <input className="pg-input" placeholder="Dia" maxLength={2} value={dia} onChange={e => setDia(e.target.value)} />
      <input className="pg-input" placeholder="Mes" maxLength={2} value={mes} onChange={e => setMes(e.target.value)} />
      <input className="pg-input" placeholder="Ano" maxLength={4} value={ano} onChange={e => setAno(e.target.value)} />
      <input className="pg-input" placeholder="Hora" maxLength={2} value={hora} onChange={e => setHora(e.target.value)} />
      <input className="pg-input" placeholder="Min" maxLength={2} value={minuto} onChange={e => setMinuto(e.target.value)} />
    </div>
  )
}

export default function LeiloesPage() {
  const [leiloes, setLeiloes] = useState<Leilao[]>([])
  const [userEmail, setUserEmail] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ jogo_nome: "", link_leilao: "", encerra_em: "" })

  useEffect(() => {
    buscarEmail()
    buscarLeiloes()
  }, [])

  async function buscarEmail() {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    setUserEmail(data?.user?.email ?? "")
  }

  async function buscarLeiloes() {
    const { data } = await supabase.from("leiloes").select("*").eq("status", "ativo").order("encerra_em", { ascending: true })
    setLeiloes(data ?? [])
  }

  async function salvarLeilao() {
    if (!form.jogo_nome || !form.link_leilao || !form.encerra_em) return
    setSalvando(true)
    await supabase.from("leiloes").insert({
      usuario_email: userEmail,
      jogo_nome: form.jogo_nome,
      link_leilao: form.link_leilao,
      encerra_em: new Date(form.encerra_em).toISOString(),
      status: "ativo",
    })
    setForm({ jogo_nome: "", link_leilao: "", encerra_em: "" })
    await buscarLeiloes()
    setSalvando(false)
  }

  async function encerrarLeilao(id: string, resultado: string) {
    await supabase.from("leiloes").update({ status: "encerrado", resultado }).eq("id", id)
    await buscarLeiloes()
  }

  const jogosComConflito = leiloes.map(l => l.jogo_nome.toLowerCase()).filter((nome, i, arr) => arr.indexOf(nome) !== i)

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header email={userEmail} />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

        <div className="pg-card" style={{ marginBottom: 24 }}>
          <div className="pg-card-accent"></div>
          <div className="pg-section-title">
            <i className="ti ti-gavel" aria-hidden="true"></i> Adicionar Leilao
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input className="pg-input" placeholder="Nome do jogo" value={form.jogo_nome} onChange={e => setForm({ ...form, jogo_nome: e.target.value })} />
            <input className="pg-input" placeholder="Link do leilao" value={form.link_leilao} onChange={e => setForm({ ...form, link_leilao: e.target.value })} />
          </div>
          <p style={{ fontSize: 11, color: "#6b6655", marginBottom: 8, fontFamily: "'Cinzel', serif", letterSpacing: "0.04em" }}>
            Data e hora de encerramento — Dia / Mes / Ano / Hora / Min
          </p>
          <DateTimePicker value={form.encerra_em} onChange={v => setForm({ ...form, encerra_em: v })} />
          <button className="pg-btn" style={{ marginTop: 16 }} onClick={salvarLeilao} disabled={salvando}>
            {salvando ? "Salvando..." : "Adicionar"}
          </button>
        </div>

        <div className="pg-section-title">
          <i className="ti ti-list" aria-hidden="true"></i> Leiloes Ativos
        </div>

        {leiloes.length === 0 && (
          <p style={{ color: "#6b6655", fontSize: 13, fontFamily: "'Cinzel', serif" }}>Nenhum leilao ativo no momento.</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {leiloes.map(leilao => {
            const conflito = jogosComConflito.includes(leilao.jogo_nome.toLowerCase())
            const meu = leilao.usuario_email === userEmail
            return (
              <div key={leilao.id} className="pg-card" style={{ borderColor: conflito ? "#6b2020" : undefined }}>
                <div className="pg-card-accent"></div>
                {conflito && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#c94444", fontSize: 11, fontFamily: "'Cinzel', serif", marginBottom: 10, letterSpacing: "0.04em" }}>
                    <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                    Mais de uma pessoa do grupo esta neste leilao
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 600, color: "#e8e3d0", marginBottom: 4 }}>{leilao.jogo_nome}</p>
                    <p style={{ fontSize: 11, color: "#6b6655" }}>{leilao.usuario_email}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: "#6b6655", fontFamily: "'Cinzel', serif", marginBottom: 4 }}>Encerra em</p>
                    <Countdown encerra_em={leilao.encerra_em} />
                  </div>
                  <a href={leilao.link_leilao} target="_blank" rel="noopener noreferrer" className="pg-btn-ghost" style={{ textDecoration: "none", fontSize: 11 }}>
                    Ver leilao <i className="ti ti-external-link" aria-hidden="true"></i>
                  </a>
                  {meu && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => encerrarLeilao(leilao.id, "ganhou")} className="pg-btn" style={{ fontSize: 11, padding: "8px 14px" }}>
                        <i className="ti ti-check" aria-hidden="true"></i> Ganhei
                      </button>
                      <button onClick={() => encerrarLeilao(leilao.id, "perdeu")} className="pg-btn-ghost" style={{ fontSize: 11, padding: "8px 14px" }}>
                        <i className="ti ti-x" aria-hidden="true"></i> Perdi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
"use client"
import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import Header from "../components/header"

type Jogo = {
  id_jogo: number
  nm_jogo: string
  img_jogo: string
  nota: number | null
}

type MembroDesejos = {
  nome: string
  email: string
  username: string
  jogos: Jogo[]
  carregando: boolean
  erro: boolean
}

export default function DesejosPage() {
  const [membros, setMembros] = useState<MembroDesejos[]>([])
  const [userEmail, setUserEmail] = useState("")
  const [busca, setBusca] = useState("")
  const [filtroMembro, setFiltroMembro] = useState("todos")

  useEffect(() => {
    buscarEmail()
    carregarMembros()
  }, [])

  async function buscarEmail() {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    setUserEmail(data?.user?.email ?? "")
  }

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
        const res = await fetch(`/api/ludopedia/desejos?username=${usuario.username_ludopedia}`)
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
    <div style={{ minHeight: "100vh" }}>
      <Header email={userEmail} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <input
            className="pg-input"
            placeholder="Buscar jogo..."
            style={{ flex: 1, minWidth: 200 }}
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <select
            className="pg-input"
            style={{ width: 200 }}
            value={filtroMembro}
            onChange={e => setFiltroMembro(e.target.value)}
          >
            <option value="todos">Todos os membros</option>
            {membros.map(m => (
              <option key={m.email} value={m.email}>{m.nome}</option>
            ))}
          </select>
        </div>

        <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em", marginBottom: 20 }}>
          {jogosFiltrados.length} jogos encontrados
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          {jogosFiltrados.map(jogo => {
            const donos = donosDojogo(jogo.id_jogo)
            return (
              <div key={jogo.id_jogo} className="pg-card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="pg-card-accent"></div>
                {jogo.img_jogo && (
                  <img src={jogo.img_jogo} alt={jogo.nm_jogo} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
                )}
                <div style={{ padding: 12 }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, color: "#e8e3d0", marginBottom: 8, lineHeight: 1.4 }}>{jogo.nm_jogo}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {donos.map(d => (
                      <span key={d} className="pg-badge" style={{ fontSize: 9, borderColor: "#3d1a3a", color: "#a05080", background: "#1e0c1a" }}>{d}</span>
                    ))}
                  </div>
                  
                  <a
                    href={`https://comparajogos.com.br/item/${jogo.nm_jogo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 10, color: "#8b1a1a", fontFamily: "'Cinzel', serif", textDecoration: "none", letterSpacing: "0.04em" }}
                  >
                    Ver preco <i className="ti ti-external-link" style={{ fontSize: 10 }} aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {membros.some(m => m.carregando) && (
          <p style={{ textAlign: "center", color: "#6b6655", marginTop: 32, fontFamily: "'Cinzel', serif", fontSize: 12 }}>
            <i className="ti ti-loader" aria-hidden="true"></i> Carregando listas...
          </p>
        )}
      </main>
    </div>
  )
}
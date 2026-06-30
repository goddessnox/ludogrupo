"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "../components/header"

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
    <div style={{ minHeight: "100vh" }}>
      <Header email={userEmail} />

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "28px 24px" }}>

        <div className="pg-card">
          <div className="pg-card-accent"></div>
          <div className="pg-section-title">
            <i className="ti ti-user" aria-hidden="true"></i> Meu Perfil
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div>
              <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em", marginBottom: 8 }}>
                Email
              </p>
              <p style={{ fontSize: 13, color: "#e8e3d0", fontFamily: "'Cinzel', serif" }}>{userEmail}</p>
            </div>

            <div>
              <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em", marginBottom: 8 }}>
                Username na Ludopedia
              </p>
              <input
                className="pg-input"
                placeholder="ex: GustavoMoura"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div>
              <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em", marginBottom: 4 }}>
                Cookie da Ludopedia
              </p>
              <p style={{ fontSize: 10, color: "#6b6655", marginBottom: 8, lineHeight: 1.5 }}>
                Entre na Ludopedia, abra o DevTools (F12), va em Network, recarregue a pagina, clique em qualquer requisicao e copie o valor do campo Cookie em Request Headers.
              </p>
              <textarea
                className="pg-input"
                style={{ height: 100, fontFamily: "monospace", fontSize: 11, resize: "vertical" }}
                placeholder="Cole o cookie aqui..."
                value={cookies}
                onChange={e => setCookies(e.target.value)}
              />
            </div>

            <button
              className="pg-btn"
              onClick={salvar}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : salvo ? "Salvo!" : "Salvar"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
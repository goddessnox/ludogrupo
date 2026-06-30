"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const PentagonIcon = () => (
  <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
    <polygon points="14,2 26,10 21,24 7,24 2,10" fill="none" stroke="#8b1a1a" strokeWidth="1.5"/>
    <polygon points="14,7 21,12 18,20 10,20 7,12" fill="#8b1a1a" opacity="0.15"/>
    <line x1="14" y1="2" x2="14" y2="7" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
    <line x1="26" y1="10" x2="21" y2="12" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
    <line x1="21" y1="24" x2="18" y2="20" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
    <line x1="7" y1="24" x2="10" y2="20" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
    <line x1="2" y1="10" x2="7" y2="12" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
  </svg>
)

export default function SetupPage() {
  const [userEmail, setUserEmail] = useState("")
  const [form, setForm] = useState({ nome: "", username_ludopedia: "", ludo_cookies: "", senha: "" })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const router = useRouter()

  useEffect(() => {
    buscarEmail()
  }, [])

  async function buscarEmail() {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    if (!data?.user?.email) { router.push("/login"); return }
    setUserEmail(data.user.email)

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("email")
      .eq("email", data.user.email)
      .single()

    if (usuario) router.push("/")
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="pg-card" style={{ width: "100%", maxWidth: 480 }}>
        <div className="pg-card-accent"></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, textAlign: "center" }}>
          <PentagonIcon />
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, fontWeight: 700, color: "#e8e3d0", marginTop: 16, marginBottom: 4 }}>
            Pentagono <span style={{ color: "#8b1a1a" }}>da Maldade</span>
          </h1>
          <p style={{ fontSize: 12, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em" }}>Complete seu cadastro para entrar</p>
          <p style={{ fontSize: 11, color: "#6b6655", marginTop: 4 }}>{userEmail}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em", marginBottom: 8 }}>Senha do grupo</p>
            <input
              type="password"
              className="pg-input"
              placeholder="Peca pro Gus"
              value={form.senha}
              onChange={e => setForm({ ...form, senha: e.target.value })}
            />
          </div>

          <div>
            <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em", marginBottom: 8 }}>Seu nome</p>
            <input
              className="pg-input"
              placeholder="Como quer ser chamado"
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div>
            <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em", marginBottom: 8 }}>Username na Ludopedia <span style={{ color: "#6b6655", fontSize: 10 }}>(opcional)</span></p>
            <input
              className="pg-input"
              placeholder="ex: GustavoMoura"
              value={form.username_ludopedia}
              onChange={e => setForm({ ...form, username_ludopedia: e.target.value })}
            />
          </div>

          <div>
            <p style={{ fontSize: 11, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em", marginBottom: 4 }}>Cookie da Ludopedia <span style={{ color: "#6b6655", fontSize: 10 }}>(opcional)</span></p>
            <p style={{ fontSize: 10, color: "#6b6655", marginBottom: 8, lineHeight: 1.5 }}>
              Voce pode configurar isso depois no seu Perfil.
            </p>
            <textarea
              className="pg-input"
              style={{ height: 80, fontFamily: "monospace", fontSize: 11, resize: "vertical" }}
              placeholder="Cole o cookie aqui..."
              value={form.ludo_cookies}
              onChange={e => setForm({ ...form, ludo_cookies: e.target.value })}
            />
          </div>

          {erro && (
            <p style={{ color: "#c94444", fontSize: 12, fontFamily: "'Cinzel', serif", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-alert-triangle" aria-hidden="true"></i> {erro}
            </p>
          )}

          <button className="pg-btn" onClick={salvar} disabled={salvando} style={{ width: "100%", padding: "12px" }}>
            {salvando ? "Entrando..." : "Entrar no grupo"}
          </button>
        </div>
      </div>
    </div>
  )
}
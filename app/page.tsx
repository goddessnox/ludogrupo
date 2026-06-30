import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Header from "./components/header"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header email={session.user?.email ?? ""} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 600, color: "#e8e3d0", marginBottom: 4, letterSpacing: "0.02em" }}>
            Bem-vindo, {session.user?.name?.split(" ")[0] ?? "aventureiro"}.
          </h2>
          <p style={{ fontSize: 12, color: "#6b6655", fontFamily: "'Cinzel', serif", letterSpacing: "0.04em" }}>
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>

          <a href="/leiloes" className="pg-card featured" style={{ textDecoration: "none", gridColumn: "span 2" }}>
            <div className="pg-card-accent"></div>
            <div className="pg-badge" style={{ marginBottom: 10 }}>
              <div className="pg-badge-dot"></div> Leiloes ativos
            </div>
            <div className="pg-card-icon"><i className="ti ti-gavel" aria-hidden="true"></i></div>
            <div className="pg-card-title">Leiloes Ativos</div>
            <div className="pg-card-desc">Acompanhe e evite disputar com o grupo.</div>
          </a>

          <a href="/colecao" className="pg-card" style={{ textDecoration: "none" }}>
            <div className="pg-card-accent"></div>
            <div className="pg-card-icon"><i className="ti ti-books" aria-hidden="true"></i></div>
            <div className="pg-card-title">Colecao</div>
            <div className="pg-card-desc">Todos os jogos do grupo com filtros por dono.</div>
          </a>

          <a href="/desejos" className="pg-card" style={{ textDecoration: "none" }}>
            <div className="pg-card-accent"></div>
            <div className="pg-card-icon"><i className="ti ti-heart" aria-hidden="true"></i></div>
            <div className="pg-card-title">Desejos</div>
            <div className="pg-card-desc">Lista de desejos de cada membro do grupo.</div>
          </a>

          <a href="/partidas" className="pg-card" style={{ textDecoration: "none" }}>
            <div className="pg-card-accent"></div>
            <div className="pg-card-icon"><i className="ti ti-sword" aria-hidden="true"></i></div>
            <div className="pg-card-title">Partidas</div>
            <div className="pg-card-desc">Registre quem jogou e quem ganhou.</div>
          </a>

          <a href="/rankings" className="pg-card" style={{ textDecoration: "none" }}>
            <div className="pg-card-accent"></div>
            <div className="pg-card-icon"><i className="ti ti-trophy" aria-hidden="true"></i></div>
            <div className="pg-card-title">Rankings</div>
            <div className="pg-card-desc">Quem ganha mais e os jogos favoritos.</div>
          </a>

          <a href="/jogar" className="pg-card" style={{ textDecoration: "none" }}>
            <div className="pg-card-accent"></div>
            <div className="pg-card-icon"><i className="ti ti-dice" aria-hidden="true"></i></div>
            <div className="pg-card-title">O que jogar hoje?</div>
            <div className="pg-card-desc">Selecione quem vai jogar e descubra o melhor jogo.</div>
          </a>

        </div>
      </main>
    </div>
  )
}
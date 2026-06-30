"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const PentagonIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <polygon points="14,2 26,10 21,24 7,24 2,10" fill="none" stroke="#8b1a1a" strokeWidth="1.5"/>
    <polygon points="14,7 21,12 18,20 10,20 7,12" fill="#8b1a1a" opacity="0.15"/>
    <line x1="14" y1="2" x2="14" y2="7" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
    <line x1="26" y1="10" x2="21" y2="12" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
    <line x1="21" y1="24" x2="18" y2="20" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
    <line x1="7" y1="24" x2="10" y2="20" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
    <line x1="2" y1="10" x2="7" y2="12" stroke="#8b1a1a" strokeWidth="1" opacity="0.5"/>
  </svg>
)

const links = [
  { href: "/", label: "Dashboard", icon: "ti-layout-dashboard" },
  { href: "/colecao", label: "Colecao", icon: "ti-books" },
  { href: "/desejos", label: "Desejos", icon: "ti-heart" },
  { href: "/partidas", label: "Partidas", icon: "ti-sword" },
  { href: "/rankings", label: "Rankings", icon: "ti-trophy" },
  { href: "/leiloes", label: "Leiloes", icon: "ti-gavel" },
  { href: "/perfil", label: "Perfil", icon: "ti-user" },
]

export default function Header({ email }: { email?: string }) {
  const pathname = usePathname()
  const inicial = email?.[0]?.toUpperCase() ?? "?"

  return (
    <>
      <header className="pg-header">
        <div className="pg-logo">
          <PentagonIcon />
          <span className="pg-title">Pentagono <span>da Maldade</span></span>
        </div>
        {email && (
          <div className="pg-user-info">
            <span>{email}</span>
            <div className="pg-avatar">{inicial}</div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6655", fontSize: 16, display: "flex", alignItems: "center" }}
              title="Sair"
            >
              <i className="ti ti-logout" aria-hidden="true"></i>
            </button>
          </div>
        )}
      </header>

      <nav className="pg-nav">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "active" : ""}
          >
            <i className={`ti ${l.icon}`} aria-hidden="true"></i>
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
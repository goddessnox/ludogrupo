"use client"
export default function Nav({ ativa }: { ativa: string }) {
  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/colecao", label: "Colecao" },
    { href: "/desejos", label: "Desejos" },
    { href: "/partidas", label: "Partidas" },
    { href: "/rankings", label: "Rankings" },
    { href: "/leiloes", label: "Leiloes" },
    { href: "/perfil", label: "Perfil" },
  ]

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex gap-6">
      {links.map(l => (
        <a
          key={l.href}
          href={l.href}
          className={l.href === ativa
            ? "text-white font-semibold border-b-2 border-indigo-500 pb-1"
            : "text-gray-400 hover:text-white transition"
          }
        >
          {l.label}
        </a>
      ))}
    </nav>
  )
}
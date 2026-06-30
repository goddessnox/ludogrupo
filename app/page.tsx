import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">⛤ Pentagono da Maldade ⛤</h1>
        <span className="text-gray-400 text-sm">{session.user?.email}</span>
      </header>

      {/* Menu */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex gap-6">
        <a href="/" className="text-white font-semibold border-b-2 border-indigo-500 pb-1">Dashboard</a>
        <a href="/colecao" className="text-gray-400 hover:text-white transition">Coleção</a>
        <a href="/partidas" className="text-gray-400 hover:text-white transition">Partidas</a>
        <a href="/rankings" className="text-gray-400 hover:text-white transition">Rankings</a>
        <a href="/leiloes" className="text-gray-400 hover:text-white transition">Leilões</a>
      </nav>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card: Coleção */}
        <a href="/colecao" className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition border border-gray-700 hover:border-indigo-500">
          <div className="text-4xl mb-4">🎮</div>
          <h2 className="text-lg font-bold mb-1">Coleção do Grupo</h2>
          <p className="text-gray-400 text-sm">Veja todos os jogos que o grupo tem e filtre por dono.</p>
        </a>

        {/* Card: Partidas */}
        <a href="/partidas" className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition border border-gray-700 hover:border-indigo-500">
          <div className="text-4xl mb-4">🏆</div>
          <h2 className="text-lg font-bold mb-1">Registrar Partida</h2>
          <p className="text-gray-400 text-sm">Registre quem jogou, quem ganhou e quanto tempo durou.</p>
        </a>

        {/* Card: Rankings */}
        <a href="/rankings" className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition border border-gray-700 hover:border-indigo-500">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-lg font-bold mb-1">Rankings</h2>
          <p className="text-gray-400 text-sm">Veja quem ganha mais, quem joga mais e os jogos favoritos.</p>
        </a>

        {/* Card: Leilões */}
        <a href="/leiloes" className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition border border-gray-700 hover:border-indigo-500">
          <div className="text-4xl mb-4">🔨</div>
          <h2 className="text-lg font-bold mb-1">Leilões Ativos</h2>
          <p className="text-gray-400 text-sm">Acompanhe leilões em andamento e evite disputar com o grupo.</p>
        </a>

        {/* Card: O que jogar hoje */}
        <a href="/jogar" className="bg-indigo-600 rounded-2xl p-6 hover:bg-indigo-700 transition border border-indigo-500 md:col-span-2">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-lg font-bold mb-1">O que jogar hoje?</h2>
          <p className="text-indigo-200 text-sm">Selecione quem vai jogar e descubra os melhores jogos disponíveis pro grupo.</p>
        </a>

      </main>
    </div>
  )
}
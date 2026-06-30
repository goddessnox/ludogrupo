"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

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
      if (diff <= 0) {
        setTempo("Encerrado")
        return
      }
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
    <span className={urgente ? "text-red-400 font-bold" : "text-green-400"}>
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
      const iso = `${ano}-${mes.padStart(2,"0")}-${dia.padStart(2,"0")}T${hora.padStart(2,"0")}:${minuto.padStart(2,"0")}`
      onChange(iso)
    }
  }, [dia, mes, ano, hora, minuto])

  const inputClass = "bg-gray-700 rounded-xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"

  return (
    <div className="grid grid-cols-5 gap-2">
      <input className={inputClass} placeholder="Dia" maxLength={2} value={dia} onChange={e => setDia(e.target.value)} />
      <input className={inputClass} placeholder="Mes" maxLength={2} value={mes} onChange={e => setMes(e.target.value)} />
      <input className={inputClass} placeholder="Ano" maxLength={4} value={ano} onChange={e => setAno(e.target.value)} />
      <input className={inputClass} placeholder="Hora" maxLength={2} value={hora} onChange={e => setHora(e.target.value)} />
      <input className={inputClass} placeholder="Min" maxLength={2} value={minuto} onChange={e => setMinuto(e.target.value)} />
    </div>
  )
}

export default function LeiloesPage() {
  const [leiloes, setLeiloes] = useState<Leilao[]>([])
  const [form, setForm] = useState({
    jogo_nome: "",
    link_leilao: "",
    encerra_em: "",
  })
  const [userEmail, setUserEmail] = useState("")
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    buscarLeiloes()
    buscarEmail()
  }, [])

  async function buscarEmail() {
    const res = await fetch("/api/auth/session")
    const data = await res.json()
    setUserEmail(data?.user?.email ?? "")
  }

  async function buscarLeiloes() {
    const { data } = await supabase
      .from("leiloes")
      .select("*")
      .eq("status", "ativo")
      .order("encerra_em", { ascending: true })
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

  const jogosComConflito = leiloes
    .map(l => l.jogo_nome.toLowerCase())
    .filter((nome, i, arr) => arr.indexOf(nome) !== i)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">⛤ Pentagono da Maldade ⛤</h1>
        <span className="text-gray-400 text-sm">{userEmail}</span>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex gap-6">
        <a href="/" className="text-gray-400 hover:text-white transition">Dashboard</a>
        <a href="/colecao" className="text-gray-400 hover:text-white transition">Colecao</a>
        <a href="/partidas" className="text-gray-400 hover:text-white transition">Partidas</a>
        <a href="/rankings" className="text-gray-400 hover:text-white transition">Rankings</a>
        <a href="/leiloes" className="text-white font-semibold border-b-2 border-indigo-500 pb-1">Leiloes</a>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4">🔨 Adicionar Leilao</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              className="bg-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nome do jogo"
              value={form.jogo_nome}
              onChange={e => setForm({ ...form, jogo_nome: e.target.value })}
            />
            <input
              className="bg-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Link do leilao"
              value={form.link_leilao}
              onChange={e => setForm({ ...form, link_leilao: e.target.value })}
            />
          </div>
          <p className="text-gray-400 text-sm mb-2">Data e hora de encerramento (Dia / Mes / Ano / Hora / Min)</p>
          <DateTimePicker
            value={form.encerra_em}
            onChange={v => setForm({ ...form, encerra_em: v })}
          />
          <button
            onClick={salvarLeilao}
            disabled={salvando}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-xl transition disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Adicionar"}
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold">Leiloes Ativos</h2>

          {leiloes.length === 0 && (
            <p className="text-gray-400">Nenhum leilao ativo no momento.</p>
          )}

          {leiloes.map(leilao => {
            const conflito = jogosComConflito.includes(leilao.jogo_nome.toLowerCase())
            const meu = leilao.usuario_email === userEmail

            return (
              <div
                key={leilao.id}
                className={`bg-gray-800 rounded-2xl p-5 border ${conflito ? "border-yellow-500" : "border-gray-700"}`}
              >
                {conflito && (
                  <div className="text-yellow-400 text-sm font-semibold mb-2">
                    Atencao: mais de uma pessoa do grupo esta neste leilao!
                  </div>
                )}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-bold text-lg">{leilao.jogo_nome}</p>
                    <p className="text-gray-400 text-sm">{leilao.usuario_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Encerra em</p>
                    <Countdown encerra_em={leilao.encerra_em} />
                  </div>
                  <a
                    href={leilao.link_leilao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-xl transition"
                  >
                    Ver leilao
                  </a>
                  {meu && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => encerrarLeilao(leilao.id, "ganhou")}
                        className="bg-green-700 hover:bg-green-600 text-white text-sm px-3 py-2 rounded-xl transition"
                      >
                        Ganhei
                      </button>
                      <button
                        onClick={() => encerrarLeilao(leilao.id, "perdeu")}
                        className="bg-red-800 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-xl transition"
                      >
                        Perdi
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
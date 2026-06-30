import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")
  if (!username) return NextResponse.json({ jogos: [] })

  try {
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("ludo_cookies, ludo_id")
      .eq("username_ludopedia", username)
      .single()

    if (!usuario?.ludo_cookies) return NextResponse.json({ jogos: [] })

    const headers = {
      "Cookie": usuario.ludo_cookies,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    }

    let page = 1
    let todosJogos: any[] = []
    let total = 0

    do {
      const res = await fetch(
        `https://ludopedia.com.br/api/v1/colecao?username=${username}&lista=lista_desejos&rows=48&page=${page}`,
        { cache: "no-store", headers }
      )
      const data = await res.json()
      total = data.total ?? 0
      todosJogos = todosJogos.concat(data.colecao ?? [])
      page++
    } while (todosJogos.length < total)

    console.log("Total desejos:", total, "Carregados:", todosJogos.length)

    const jogos = todosJogos.map((j: any) => ({
      id_jogo: j.id_jogo,
      nm_jogo: j.nm_jogo,
      img_jogo: j.thumb,
      nota: j.vl_nota,
    }))

    return NextResponse.json({ jogos })
  } catch (err) {
    console.error("Erro:", err)
    return NextResponse.json({ jogos: [] })
  }
}
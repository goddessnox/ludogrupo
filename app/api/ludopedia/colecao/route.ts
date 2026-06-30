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
      .select("ludo_cookies")
      .eq("username_ludopedia", username)
      .single()

    if (!usuario?.ludo_cookies) return NextResponse.json({ jogos: [] })

    const res = await fetch(
      `https://ludopedia.com.br/api/v1/colecao?username=${username}`,
      {
        cache: "no-store",
        headers: {
          "Cookie": usuario.ludo_cookies,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        }
      }
    )

    const data = await res.json()
    console.log("Status:", res.status, "Total:", data.total)

    const jogos = (data.colecao ?? []).map((j: any) => ({
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
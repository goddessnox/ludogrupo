import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const { email, nome, username_ludopedia, ludo_cookies, senha } = await request.json()

  if (senha !== process.env.GRUPO_SECRET) {
    return NextResponse.json({ erro: "Senha incorreta. Peca a senha pro Gus." }, { status: 401 })
  }

  if (!email || !nome) {
    return NextResponse.json({ erro: "Nome obrigatorio." }, { status: 400 })
  }

  const { error } = await supabase.from("usuarios").insert({
    email,
    nome,
    username_ludopedia: username_ludopedia || null,
    ludo_cookies: ludo_cookies || null,
  })

  if (error) {
    return NextResponse.json({ erro: "Erro ao criar conta." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
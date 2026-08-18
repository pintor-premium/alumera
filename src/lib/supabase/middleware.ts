import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  // Rotas restritas
  const isPortalRoute = url.pathname.startsWith('/portal')
  const isAdminRoute = url.pathname.startsWith('/admin')
  const isAuthRoute = url.pathname === '/login' || url.pathname === '/cadastro'

  if (!user) {
    // Se não estiver logado e tentar acessar portal ou admin, vai para login
    if (isPortalRoute || isAdminRoute) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } else {
    // Buscar perfil do banco de dados
    const { data: profile } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('id', user.id)
      .single()

    const userProfile = user.email === 'alumera@gmail.com' ? 'administrador' : (profile?.perfil || 'arquiteto')

    // Se já estiver logado e acessar login/cadastro, redireciona conforme o perfil
    if (isAuthRoute) {
      if (userProfile === 'administrador' || userProfile === 'operacional' || userProfile === 'financeiro') {
        url.pathname = '/admin'
      } else {
        url.pathname = '/portal'
      }
      return NextResponse.redirect(url)
    }

    // Proteção de rotas admin
    if (isAdminRoute) {
      if (userProfile !== 'administrador' && userProfile !== 'operacional' && userProfile !== 'financeiro') {
        url.pathname = '/portal' // Se não for admin/op/fin, manda pro portal do profissional
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

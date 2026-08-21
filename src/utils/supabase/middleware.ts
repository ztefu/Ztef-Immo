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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  const isAuthPath = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup') || request.nextUrl.pathname === '/portal'
  
  if (
    !user &&
    !isAuthPath &&
    !request.nextUrl.pathname.startsWith('/api') &&
    request.nextUrl.pathname !== '/'
  ) {
    // If not authenticated and trying to access a protected route (e.g. /dashboard)
    if (request.nextUrl.pathname.startsWith('/portal')) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal'
      return NextResponse.redirect(url)
    }
    
    // Default redirect to admin login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Cloisonnement basique (Basic Role Checking)
  // On suppose que l'agence se connecte via /login avec un email (et non pas une adresse factice @locataire.ztefu.com)
  // Les locataires se connectent via /portal (qui utilise @locataire.ztefu.com)
  if (user) {
    const isTenantUser = user.email?.endsWith('@locataire.ztefu.com');
    
    // Si c'est un locataire qui essaie d'aller sur l'interface agence
    if (isTenantUser && !request.nextUrl.pathname.startsWith('/portal') && !request.nextUrl.pathname.startsWith('/api')) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/dashboard'
      return NextResponse.redirect(url)
    }
    
    // Si c'est un admin qui essaie d'aller sur le portail locataire protégé (on le redirige sur le dashboard agence)
    if (!isTenantUser && request.nextUrl.pathname.startsWith('/portal/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    
    // Si l'utilisateur est connecté et essaie d'accéder à la page de login, on le redirige
    if (isAuthPath) {
      const url = request.nextUrl.clone()
      url.pathname = isTenantUser ? '/portal/dashboard' : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

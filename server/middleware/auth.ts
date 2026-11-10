import { auth } from '~~/server/utils/auth'

// API paths that must stay reachable without a session. Better Auth's own
// endpoints (sign-in, email OTP, get-session, etc.) live under /api/auth.
const PUBLIC_PREFIXES = ['/api/auth', '/api/health']

// Students join games without a teacher account, so this one registration
// endpoint is public. Keep the exception narrow: POST only, and only the
// player-registration path. Room creation and all other room operations stay
// behind authentication.
const PLAYER_REGISTRATION_PATH = /^\/api\/rooms\/[^/]+\/players\/?$/

// Make the resolved session available to every downstream handler so routes
// can read event.context.user / event.context.session instead of calling
// auth.api.getSession() themselves.
declare module 'h3' {
  interface H3EventContext {
    user?: typeof auth.$Infer.Session.user
    session?: typeof auth.$Infer.Session.session
  }
}

export default defineEventHandler(async (event) => {
  // Only guard server API routes. Page navigation and assets are handled by
  // the client route middleware (app/middleware/auth.global.ts).
  if (!event.path.startsWith('/api/')) {
    return
  }

  const pathname = event.path.split('?')[0] ?? event.path

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return
  }

  if (event.method === 'POST' && PLAYER_REGISTRATION_PATH.test(pathname)) {
    return
  }

  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  event.context.user = session.user
  event.context.session = session.session
})

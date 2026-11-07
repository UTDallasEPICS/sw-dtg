import { authClient } from '../utils/auth-client'

// Student-facing routes that must be reachable without a teacher session.
// Students join a game with a PIN and wait in the student lobby or play;
// these flows do not require a login account.
const PUBLIC_STUDENT_PATHS = ['/player/join', '/lobby/student', '/gamepage', '/homepage']

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  if (session.value) {
    if (to.path === '/auth') {
      return navigateTo('/')
    }
  } else {
    // If not authenticated and not accessing a public/student page, redirect to auth
    if (to.path !== '/auth' && !PUBLIC_STUDENT_PATHS.includes(to.path)) {
      return navigateTo('/auth')
    }
  }
})

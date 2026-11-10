import { authClient } from '../utils/auth-client'

// Student-facing routes that must be reachable without a teacher session.
// Students join a game with a PIN and wait in the student lobby; neither flow
// requires an account.
const PUBLIC_STUDENT_PATHS = ['/player/join', '/lobby/student']

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  if (session.value) {
    if (to.path === '/auth') {
      return navigateTo('/')
    }
  } else {
    if (to.path !== '/auth' && !PUBLIC_STUDENT_PATHS.includes(to.path)) {
      return navigateTo('/auth')
    }
  }
})

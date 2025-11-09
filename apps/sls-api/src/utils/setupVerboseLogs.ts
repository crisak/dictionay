/* eslint-disable turbo/no-undeclared-env-vars */
const originalDebug = console.debug

function getDate(date: string): Date | null {
  try {
    return new Date(date)
  } catch (error) {
    console.error('An error occurred to try format date', error)
    return null
  }
}

function shouldLogVerbose(): boolean {
  const verbose = process.env.VERBOSE

  if (!verbose) return false

  const now = new Date()

  if (verbose.toLowerCase() === 'true') return true

  const verboseDate = getDate(verbose)

  if (!verboseDate) return false

  if (!isNaN(verboseDate.getTime()) && verboseDate > now) {
    return true
  }

  return false
}

// Subscription or wrapper console.debug function native
console.debug = function (...args: any[]) {
  if (!shouldLogVerbose()) return

  const prefix = `🐛 `

  // Llamamos a la función original con prefijo
  originalDebug(prefix, ...args)
}

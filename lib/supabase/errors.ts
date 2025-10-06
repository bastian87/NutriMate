export class RetryableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RetryableError'
  }
}

export function isRetryableError(error: any): boolean {
  // Check for rate limit error (429)
  if (error?.status === 429) {
    return true
  }

  // Check for network errors
  if (error?.message?.includes('network') || error?.message?.includes('failed to fetch')) {
    return true
  }

  // Check for timeout errors
  if (error?.message?.includes('timeout')) {
    return true
  }

  // Check for specific Supabase error codes that should be retried
  const retryableErrorCodes = ['23505', '40001', '40P01']
  if (error?.code && retryableErrorCodes.includes(error.code)) {
    return true
  }

  return false
}

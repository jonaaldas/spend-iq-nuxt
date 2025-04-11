type Success<T> = {
  data: T
  error: null
}

type Failure = {
  data: null
  error: {
    message: string
    name?: string
  }
}

type Result<T> = Success<T> | Failure

export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    // Don't include request/response objects that might have circular references
    const safeError =
      error instanceof Error
        ? { message: error.message, name: error.name }
        : { message: String(error) }

    // Log detailed error for debugging but return safe version
    console.error('API Error:', safeError)
    return { data: null, error: safeError }
  }
}

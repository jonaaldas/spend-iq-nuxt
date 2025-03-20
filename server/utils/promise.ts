// /**
//  * Handles a promise and returns an object indicating the success or failure of the promise.
//  *
//  * This function is inspired by the ECMAScript Safe Assignment Operator Proposal and the ECMAScript Try Operator.
//  *
//  * @template T - The type of the value that the promise resolves to.
//  * @param {Promise<T>} promise - The promise to handle.
//  * @returns {Promise<{ ok: boolean; value: T | null; error: Error | null }>}
//  * An object containing:
//  * - `ok`: A boolean indicating whether the promise was resolved successfully.
//  * - `value`: The resolved value of the promise if successful, otherwise `null`.
//  * - `error`: The error object if the promise was rejected, otherwise `null`.
//  * @see {@link https://jsdev.space/ts-error-handling|TypeScript Error Handling: The Shift to Result Types}
//  * @see {@link https://github.com/arthurfiorette/proposal-try-operator/tree/proposal-safe-assignment-operator|ECMAScript Safe Assignment Operator Proposal}
//  * @see {@link https://github.com/arthurfiorette/proposal-try-operator|ECMAScript Try Operator}
//  */
// async function handleAsync<T>(promise: Promise<T>): Promise<{
//   ok: boolean
//   value: T | null
//   error: Error | null
// }> {
//   try {
//     const data = await promise

//     return {
//       ok: true,
//       value: data,
//       error: null,
//     }
//   } catch (error) {
//     return {
//       ok: false,
//       value: null,
//       error: error instanceof Error ? error : new Error(String(error)),
//     }
//   }
// }

// export { handleAsync }

/**
 * Handles a promise and returns an object indicating the success or failure of the promise.
 *
 * This function is inspired by the ECMAScript Safe Assignment Operator Proposal and the ECMAScript Try Operator.
 *
 * @template T - The type of the value that the promise resolves to.
 * @param {Promise<T>} promise - The promise to handle.
 * @returns {Promise<{ data: T | null; error: Error | null }>}
 * An object containing:
 * - `data`: The resolved value of the promise if successful, otherwise `null`.
 * - `error`: The error object if the promise was rejected, otherwise `null`.
 * @see {@link https://jsdev.space/ts-error-handling|TypeScript Error Handling: The Shift to Result Types}
 * @see {@link https://github.com/arthurfiorette/proposal-try-operator/tree/proposal-safe-assignment-operator|ECMAScript Safe Assignment Operator Proposal}
 * @see {@link https://github.com/arthurfiorette/proposal-try-operator|ECMAScript Try Operator}
 */
type Success<T> = {
  data: T
  error: null
}

type Failure<E> = {
  data: null
  error: E
}

type Result<T, E = Error> = Success<T> | Failure<E>

// Main wrapper function
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}

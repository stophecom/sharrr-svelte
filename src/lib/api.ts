export async function api<T>(
  url: RequestInfo,
  options?: RequestInit,
  data?: Record<string, unknown> | null
): Promise<T> {
  try {
    // Default options are marked with *
    const response = await fetch(`/api/v1${url}`, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
        ...options?.headers
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *client
      ...options,
      ...(data ? { body: JSON.stringify(data) } : {}) // body data type must match "Content-Type" header
    })

    if (!response.ok) {
      const errorResponse = (await response.json()) as CustomError
      throw new Error(errorResponse.message ?? response.statusText)
    }

    return response.json() as Promise<T>
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Unexpected error')
  }
}

export const asyncPool = async (concurrency, iterable, iteratorFn) => {
  const ret = [] // Store all asynchronous tasks
  const executing = new Set() // Stores executing asynchronous tasks
  for (const item of iterable) {
    // Call the iteratorFn function to create an asynchronous task
    const p = Promise.resolve().then(() => iteratorFn(item, iterable))

    ret.push(p) // save new async task
    executing.add(p) // Save an executing asynchronous task

    const clean = () => executing.delete(p)
    p.then(clean).catch(clean)
    if (executing.size >= concurrency) {
      // Wait for faster task execution to complete
      await Promise.race(executing)
    }
  }
  return Promise.all(ret)
}

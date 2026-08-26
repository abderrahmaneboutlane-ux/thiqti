export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit & { maxRetries?: number; timeoutMs?: number; delayMs?: number },
): Promise<Response> {
  const { maxRetries = 3, timeoutMs = 30000, delayMs = 2000, ...fetchOptions } = options ?? {};

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[Scraper] Attempt ${attempt}/${maxRetries} for ${url}`);
      const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const backoff = delayMs * 2 ** (attempt - 1);
        await sleep(backoff);
      }
    }
  }

  console.error(`[Scraper] Failed ${url} after ${maxRetries} attempts: ${lastError!.message}`);
  throw lastError!;
}

let lastFetchTime = 0;

export async function rateLimitedFetch(
  url: string,
  options?: RequestInit & { maxRetries?: number; timeoutMs?: number; delayMs?: number },
  minDelayMs = 1000,
): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastFetchTime;

  if (elapsed < minDelayMs) {
    await sleep(minDelayMs - elapsed);
  }

  const response = await fetchWithRetry(url, options);
  lastFetchTime = Date.now();
  return response;
}

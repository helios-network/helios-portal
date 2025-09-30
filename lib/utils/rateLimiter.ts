/**
 * Rate limiter utility to prevent API rate limit violations
 * Implements a token bucket algorithm with request queuing
 */

interface QueuedRequest {
    request: () => Promise<any>
    resolve: (value: any) => void
    reject: (error: any) => void
    timestamp: number
}

class RateLimiter {
    private tokens: number
    private maxTokens: number
    private refillRate: number // tokens per second
    private lastRefill: number
    private queue: QueuedRequest[] = []
    private processing = false

    constructor(maxTokens: number = 5, refillRate: number = 5) {
        this.maxTokens = maxTokens
        this.tokens = maxTokens
        this.refillRate = refillRate
        this.lastRefill = Date.now()
    }

    /**
     * Refill tokens based on elapsed time
     */
    private refillTokens(): void {
        const now = Date.now()
        const elapsed = (now - this.lastRefill) / 1000
        const tokensToAdd = Math.floor(elapsed * this.refillRate)

        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
            this.lastRefill = now
        }
    }

    /**
     * Check if we can make a request immediately
     */
    private canMakeRequest(): boolean {
        this.refillTokens()
        return this.tokens > 0
    }

    /**
     * Consume a token for making a request
     */
    private consumeToken(): boolean {
        if (this.canMakeRequest()) {
            this.tokens--
            return true
        }
        return false
    }

    /**
     * Process the request queue
     */
    private async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return
        }

        this.processing = true

        while (this.queue.length > 0) {
            if (!this.consumeToken()) {
                // Wait for next token refill
                const waitTime = 1000 / this.refillRate
                await new Promise(resolve => setTimeout(resolve, waitTime))
                continue
            }

            const queuedRequest = this.queue.shift()
            if (!queuedRequest) continue

            try {
                const result = await queuedRequest.request()
                queuedRequest.resolve(result)
            } catch (error) {
                queuedRequest.reject(error)
            }
        }

        this.processing = false
    }

    /**
     * Execute a request with rate limiting
     */
    async execute<T>(request: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            // Try to execute immediately if we have tokens
            if (this.consumeToken()) {
                request()
                    .then(resolve)
                    .catch(reject)
                return
            }

            // Queue the request
            this.queue.push({
                request,
                resolve,
                reject,
                timestamp: Date.now(),
            })

            // Start processing queue
            this.processQueue()
        })
    }

    /**
     * Get current status
     */
    getStatus() {
        this.refillTokens()
        return {
            tokens: this.tokens,
            maxTokens: this.maxTokens,
            queueLength: this.queue.length,
            processing: this.processing,
        }
    }

    /**
     * Clear old queued requests (older than 30 seconds)
     */
    clearOldRequests(): void {
        const now = Date.now()
        const maxAge = 30 * 1000 // 30 seconds

        this.queue = this.queue.filter(request => {
            if (now - request.timestamp > maxAge) {
                request.reject(new Error('Request timeout: queued too long'))
                return false
            }
            return true
        })
    }
}

// Global rate limiter instance
const globalRateLimiter = new RateLimiter(5, 5) // 5 requests per second

// Clean up old requests every 30 seconds
if (typeof window !== 'undefined') {
    setInterval(() => {
        globalRateLimiter.clearOldRequests()
    }, 30000)
}

export { globalRateLimiter, RateLimiter }

/**
 * Wrapper function to rate limit any async function
 */
export const withRateLimit = <T extends (...args: any[]) => Promise<any>>(
    fn: T
): T => {
    return ((...args: any[]) => {
        return globalRateLimiter.execute(() => fn(...args))
    }) as T
}

/**
 * Rate limit a fetch request
 */
export const rateLimitedFetch = withRateLimit(fetch)

/**
 * Get rate limiter status for debugging
 */
export const getRateLimiterStatus = () => globalRateLimiter.getStatus()
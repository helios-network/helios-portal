import axios, {
    type AxiosError,
    type AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from "axios"
import { toast } from "react-toastify"
import { globalRateLimiter } from "@/lib/utils/rateLimiter"
import { StorageManager } from "@/utils/storageManager"

// Retry configuration
const MAX_RETRIES = 5
const RETRY_DELAY = 1000 // 1 second

// HTTP status codes that should not be retried
const NON_RETRYABLE_STATUS_CODES = [
    400, // Bad Request
    401, // Unauthorized
    403, // Forbidden
    404, // Not Found
    422, // Unprocessable Entity
]

// Check if error should be retried
const shouldRetry = (error: any): boolean => {
    // If it's an axios error with a response status
    if (error?.response?.status) {
        return !NON_RETRYABLE_STATUS_CODES.includes(error.response.status)
    }

    // For network errors or other errors without status, allow retry
    return true
}

// Global flag to disable refetch intervals when auth fails
let authFailureDetected = false

// Function to check and set auth failure state
const handleAuthFailure = (error: any) => {
    if (error?.response?.status === 401) {
        if (!authFailureDetected) {
            authFailureDetected = true


            // Broadcast auth failure to all components
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("auth-failure", { detail: { status: 401 } }),
                )
            }
        }
    }
}

// Function to check if refetch should be disabled
export const shouldDisableRefetch = () => authFailureDetected

// Function to check if API key is configured for local development
export const isApiKeyConfigured = (): boolean => {
    return !!process.env.NEXT_PUBLIC_API_KEY
}

// Function to get current API configuration info
export const getApiConfig = () => {
    return {
        isLocalDevelopment,
        hasApiKey: !!process.env.NEXT_PUBLIC_API_KEY,
        apiKeyConfigured: isApiKeyConfigured(),
        baseURL: API_URL,
    }
}

// Note: We don't block API calls completely, just disable refetch intervals
// This allows manual retries and user-initiated actions to still work

// Utility function for retry logic
const retryWithLimit = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = MAX_RETRIES,
    delay: number = RETRY_DELAY,
    retryCount: number = 0,
): Promise<T> => {
    try {
        return await fn()
    } catch (error) {
        // Handle auth failures
        handleAuthFailure(error)

        // Check if we should retry this error
        if (!shouldRetry(error)) {

            throw error
        }

        if (retryCount >= maxRetries) {

            throw error
        }



        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay))

        return retryWithLimit(fn, maxRetries, delay, retryCount + 1)
    }
}

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || ""

export interface ApiResponse<T> {
    id: number
    jsonrpc: string
    result?: T
    error?: {
        code: number
        message: string
    }
    mapNameTag?: {
        [address: string]: string
    }
    mapPrivateNameTag?: {
        [address: string]: string
    }
}

// Check if running in local development or ngrok
const isLocalDevelopment = (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') &&
    (typeof window === 'undefined' ? true :
        window.location.hostname === 'localhost' ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('172.') ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('ngrok') ||
        window.location.hostname.includes('ngrok-free.app')
    )

// Prepare headers
const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
}

// Add API key header only for local development
if (process.env.NEXT_PUBLIC_API_KEY) {
    defaultHeaders["x-api-key"] = process.env.NEXT_PUBLIC_API_KEY
}

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 60000,
    headers: defaultHeaders,
})

axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined" && !navigator.onLine) {
            const action = config.headers?.["action"]
            if (action) toast.error(`There was a network error`)
            throw new Error("Network Error")
        }

        // Add Authorization header if token is available
        if (typeof window !== "undefined") {
            const token = StorageManager.getItem("access_token")
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    async (error: AxiosError): Promise<AxiosError> => {
        return Promise.reject(error)
    },
)

const apiClient = {
    post: async <T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<ApiResponse<T> | undefined> => {
        // Apply rate limiting to all POST requests
        return globalRateLimiter.execute(async () => {
            return retryWithLimit(async () => {
                const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.post(
                    url,
                    data,
                    config,
                )
                return response.data
            })
        })
    },

    // Post method without retry (for cases where retry is not needed)
    postWithoutRetry: async <T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<ApiResponse<T> | undefined> => {
        const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.post(
            url,
            data,
            config,
        )
        return response.data
    },

    get: async <T>(
        url: string,
        params?: Record<string, string | number | boolean>,
        config?: AxiosRequestConfig,
    ): Promise<ApiResponse<T> | undefined> => {
        const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.get(
            url,
            { ...config, params },
        )
        return response.data
    },
    put: async <T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig,
    ): Promise<ApiResponse<T> | undefined> => {
        const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.put(
            url,
            data,
            config,
        )
        return response.data
    },
    delete: async <T>(
        url: string,
        config?: AxiosRequestConfig,
    ): Promise<ApiResponse<T> | undefined> => {
        const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.delete(
            url,
            config,
        )
        return response.data
    },
}

export default apiClient
// Storage Manager utility for handling localStorage vs sessionStorage
// Based on user's "Remember me" preference

const REMEMBER_ME_KEY = 'remember_me'
const DEFAULT_REMEMBER_ME = false

export type StorageType = 'localStorage' | 'sessionStorage'

export interface CleanupOptions {
    clearCookies?: boolean
    clearQueryCache?: boolean
    preserveRememberMe?: boolean
    clearSessionTimers?: boolean
    broadcastLogout?: boolean
}

export class StorageManager {
    static getStorageType(): StorageType {
        if (typeof window === "undefined") return 'localStorage'

        const rememberMe = localStorage.getItem(REMEMBER_ME_KEY)
        return rememberMe === 'true' ? 'localStorage' : 'sessionStorage'
    }

    private static getStorage(): Storage {
        if (typeof window === "undefined") {
            return {
                getItem: () => null,
                setItem: () => { },
                removeItem: () => { },
                clear: () => { },
                length: 0,
                key: () => null
            }
        }

        const storageType = this.getStorageType()
        return storageType === 'localStorage' ? localStorage : sessionStorage
    }

    static setRememberMe(remember: boolean): void {
        if (typeof window === "undefined") return

        // Always store the remember preference in localStorage
        // so it persists across sessions
        localStorage.setItem(REMEMBER_ME_KEY, remember.toString())
    }

    static getRememberMe(): boolean {
        if (typeof window === "undefined") return DEFAULT_REMEMBER_ME

        const rememberMe = localStorage.getItem(REMEMBER_ME_KEY)
        return rememberMe === 'true'
    }

    static setItem(key: string, value: string): void {
        const storage = this.getStorage()
        storage.setItem(key, value)
    }

    static getItem(key: string): string | null {
        const storage = this.getStorage()
        return storage.getItem(key)
    }

    static removeItem(key: string): void {
        const storage = this.getStorage()
        storage.removeItem(key)

        // Also remove from the other storage type to ensure cleanup
        if (typeof window !== "undefined") {
            localStorage.removeItem(key)
            sessionStorage.removeItem(key)
        }
    }

    /**
     * Legacy method - use cleanupAuth instead
     * @deprecated Use cleanupAuth with options
     */
    static clear(): void {
        this.cleanupAuth({
            clearCookies: false,
            clearQueryCache: false,
            preserveRememberMe: true,
            clearSessionTimers: false,
            broadcastLogout: false,
        })
    }

    /**
     * Unified authentication data cleanup method
     * Provides flexible cleanup options for different scenarios
     */
    static cleanupAuth(options: CleanupOptions = {}): void {
        if (typeof window === "undefined") return

        const {
            clearCookies = true,
            clearQueryCache = true,
            preserveRememberMe = true,
            clearSessionTimers = true,
            broadcastLogout = false,
        } = options

        // Define auth keys to clear
        const authKeys = [
            'access_token',
            'refresh_token',
            'user',
            'session_expiry',
            'last_activity',
            'auth-sync-temp'
        ]

        // Add remember_me to cleanup if not preserving
        if (!preserveRememberMe) {
            authKeys.push(REMEMBER_ME_KEY)
        }

        // Clear from both localStorage and sessionStorage
        authKeys.forEach(key => {
            localStorage.removeItem(key)
            sessionStorage.removeItem(key)
        })

        // Clear cookies if requested
        if (clearCookies && typeof document !== "undefined") {
            document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
            document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"
        }

        // Clear React Query cache if requested
        if (clearQueryCache) {
            const queryClient = (window as any).__QUERY_CLIENT__
            if (queryClient) {
                queryClient.removeQueries({ queryKey: ['user-profile'] })
            }
        }
    }

    /**
     * Legacy method - use cleanupAuth instead
     * @deprecated Use cleanupAuth with options
     */
    static forceCompleteCleanup(): void {
        this.cleanupAuth({
            clearCookies: true,
            clearQueryCache: true,
            preserveRememberMe: true,
            clearSessionTimers: false,
            broadcastLogout: false,
        })
    }

    static migrateToNewStorage(newRememberMe: boolean): void {
        if (typeof window === "undefined") return

        const currentRememberMe = this.getRememberMe()
        if (currentRememberMe === newRememberMe) return

        // Get current auth data
        const currentStorage = currentRememberMe ? localStorage : sessionStorage
        const newStorage = newRememberMe ? localStorage : sessionStorage

        const authKeys = ['access_token', 'refresh_token', 'user', 'session_expiry', 'last_activity']

        // Migrate data to new storage
        authKeys.forEach(key => {
            const value = currentStorage.getItem(key)
            if (value) {
                newStorage.setItem(key, value)
                currentStorage.removeItem(key)
            }
        })

        // Update preference
        this.setRememberMe(newRememberMe)
    }
}
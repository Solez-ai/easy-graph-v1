/**
 * API Key Storage Utilities
 * Manages storing and retrieving custom Gemini API keys from localStorage
 */

const STORAGE_KEY = 'easygraph_api_key';

/**
 * Save a custom API key to localStorage
 */
export const saveApiKey = (apiKey: string): void => {
    if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('API key cannot be empty');
    }

    try {
        localStorage.setItem(STORAGE_KEY, apiKey.trim());
    } catch (error) {
        console.error('Failed to save API key to localStorage:', error);
        throw new Error('Failed to save API key. Please check your browser settings.');
    }
};

/**
 * Get the stored custom API key from localStorage
 * Returns null if no custom key is stored
 */
export const getStoredApiKey = (): string | null => {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to read API key from localStorage:', error);
        return null;
    }
};

/**
 * Clear the custom API key from localStorage
 */
export const clearApiKey = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear API key from localStorage:', error);
        throw new Error('Failed to clear API key.');
    }
};

/**
 * Check if user is currently using a custom API key
 */
export const isUsingCustomKey = (): boolean => {
    const storedKey = getStoredApiKey();
    return storedKey !== null && storedKey.length > 0;
};

/**
 * Basic validation for API key format
 * Gemini API keys typically start with "AIza" and are 39 characters long
 */
export const validateApiKey = (apiKey: string): { valid: boolean; error?: string } => {
    if (!apiKey || apiKey.trim().length === 0) {
        return { valid: false, error: 'API key cannot be empty' };
    }

    const trimmedKey = apiKey.trim();

    // Basic format check for Google API keys
    if (!trimmedKey.startsWith('AIza')) {
        return { valid: false, error: 'Invalid API key format. Gemini API keys should start with "AIza"' };
    }

    if (trimmedKey.length < 30) {
        return { valid: false, error: 'API key appears too short' };
    }

    return { valid: true };
};

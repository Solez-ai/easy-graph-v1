import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Key, ExternalLink, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { saveApiKey, getStoredApiKey, clearApiKey, isUsingCustomKey, validateApiKey } from '../utils/apiKeyStorage';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [hasCustomKey, setHasCustomKey] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHasCustomKey(isUsingCustomKey());
            setApiKey('');
            setMessage(null);
            setShowApiKey(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        setMessage(null);

        const validation = validateApiKey(apiKey);
        if (!validation.valid) {
            setMessage({ type: 'error', text: validation.error || 'Invalid API key' });
            return;
        }

        setIsLoading(true);
        try {
            saveApiKey(apiKey);
            setMessage({ type: 'success', text: 'API key saved successfully!' });
            setHasCustomKey(true);
            setApiKey('');

            // Close modal after brief delay
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to save API key'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setMessage(null);
        try {
            clearApiKey();
            setHasCustomKey(false);
            setApiKey('');
            setMessage({ type: 'success', text: 'Custom API key cleared. Using default key.' });

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to clear API key'
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-950/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <Key className="text-primary-600 dark:text-primary-400" size={20} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status */}
                    <div className={`p-4 rounded-lg border ${hasCustomKey
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}>
                        <div className="flex items-start gap-3">
                            {hasCustomKey ? (
                                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                            ) : (
                                <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                            )}
                            <div>
                                <p className="font-medium text-sm text-slate-900 dark:text-white">
                                    {hasCustomKey ? 'Using Custom API Key' : 'Using Default API Key'}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {hasCustomKey
                                        ? 'You are using your own Gemini API key with no shared rate limits.'
                                        : 'You are using the shared default API key, which may have rate limits.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Gemini API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIza..."
                                className="w-full px-4 py-2.5 pr-12 bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Don't have an API key?{' '}
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                            >
                                Get one free from Google AI Studio
                                <ExternalLink size={12} />
                            </a>
                        </p>
                    </div>

                    {/* Privacy Notice */}
                    <div className="p-3 bg-slate-50 dark:bg-dark-950 rounded-lg border border-slate-200 dark:border-gray-800">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            🔒 <span className="font-medium">Privacy:</span> Your API key is stored locally in your browser only.
                            It's never sent to our servers and is only used to communicate with Google's Gemini API.
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`p-3 rounded-lg border ${message.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                            }`}>
                            <p className="text-sm font-medium">{message.text}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {hasCustomKey && (
                            <button
                                onClick={handleClear}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                                Clear Custom Key
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!apiKey.trim() || isLoading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            {isLoading ? 'Saving...' : 'Save API Key'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

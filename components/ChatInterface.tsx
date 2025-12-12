import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image as ImageIcon, X, FileText, Loader2, Mic, MicOff } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, files: File[]) => void;
  isProcessing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if ((!inputText.trim() && attachments.length === 0) || isProcessing) return;
    onSendMessage(inputText, attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    // Set to false to capture final results only, preventing 'ghost' interim text issues
    recognition.interimResults = false; 
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInputText(prev => {
           // Add space if there is already text and it doesn't end in a space
           const spacer = prev.trim().length > 0 && !prev.endsWith(' ') ? ' ' : '';
           return prev + spacer + transcript;
        });
      }
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-full mb-4 text-primary-600 dark:text-primary-400">
              <MessageSquarePlaceholder />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Start the conversation</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              "Create a bar chart for sales data..."<br/>
              "Upload a CSV..."<br/>
              "Paste raw data..."
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none shadow-md shadow-primary-500/10'
                  : 'bg-gray-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 rounded-bl-none border border-transparent dark:border-slate-700'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              
              {/* Attachments in Message History */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-black/5 dark:bg-black/20 p-2 rounded-lg text-xs">
                       {att.type === 'image' ? <ImageIcon size={14} /> : <FileText size={14} />}
                       <span className="truncate max-w-[150px]">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Data Extraction Summary (AI messages only) */}
              {msg.extractedData && (
                <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10">
                   <p className="text-[10px] font-bold uppercase opacity-60 mb-2 tracking-wider">Extracted Data</p>
                   <pre className="text-xs overflow-x-auto bg-white dark:bg-slate-900/80 p-3 rounded-md border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                     {JSON.stringify(msg.extractedData, null, 2)}
                   </pre>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-slate-800/50 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 border border-transparent dark:border-slate-700">
              <Loader2 size={16} className="animate-spin text-primary-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Gemini is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-800">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file, idx) => (
              <div key={idx} className="relative group bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 pr-8 pl-3 py-2 rounded-lg flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
                  {file.name}
                </span>
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-xl transition-colors"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            accept=".csv,.txt,.json,.png,.jpg,.jpeg,.webp"
          />

          <div className="flex-1 relative flex items-center gap-2 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 focus-within:border-primary-500 transition-colors">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your chart or data..."
              className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 border-none focus:ring-0 px-2 py-3 resize-none max-h-32 min-h-[48px] focus:outline-none"
              rows={1}
            />
            
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-all ${
                isListening 
                  ? 'bg-red-100 text-red-500 animate-pulse' 
                  : 'text-slate-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && attachments.length === 0) || isProcessing}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              (!inputText.trim() && attachments.length === 0) || isProcessing
                ? 'bg-gray-200 dark:bg-dark-700 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageSquarePlaceholder = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
)

export default ChatInterface;
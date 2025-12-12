import React, { useState } from 'react';
import { Moon, Sun, Plus, Save, Settings } from 'lucide-react';
import { AppView } from '../types';
import SettingsModal from './SettingsModal';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setView: (view: AppView) => void;
  currentView: AppView;
  onSave: () => void;
  onNewProject: () => void;
  hasUnsavedChanges: boolean;
}


const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  toggleTheme,
  setView,
  currentView,
  onSave,
  onNewProject,
  hasUnsavedChanges
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="w-full h-16 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-50 transition-colors duration-200">
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setView(AppView.DASHBOARD)}
      >
        <img
          src="https://i.postimg.cc/sXNpB24x/eg-logo.png"
          alt="EasyGraph Logo"
          className="w-9 h-9 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 object-cover"
        />
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          EasyGraph
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {currentView === AppView.EDITOR && (
          <>
            <button
              onClick={onSave}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${hasUnsavedChanges
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-dark-800'
                }`}
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-md transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Project</span>
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>
          </>
        )}

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-dark-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-dark-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

export default Header;
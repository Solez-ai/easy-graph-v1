import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ChartRenderer from './components/ChartRenderer';
import { AppView, Message, ChartConfiguration, Project } from './types';
import { generateChartFromInput } from './services/geminiService';
import { SaveProjectModal, UnsavedChangesModal, DeleteConfirmationModal } from './components/Modal';

const MAX_PROJECTS = 10;

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // App State
  const [messages, setMessages] = useState<Message[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfiguration | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Persistence State
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modals
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'NEW_PROJECT' | 'DASHBOARD' | null>(null);

  // Initialize theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
    
    // Load saved projects
    const storedProjects = localStorage.getItem('easygraph_projects');
    if (storedProjects) {
      try {
        setSavedProjects(JSON.parse(storedProjects));
      } catch (e) {
        console.error("Failed to parse saved projects", e);
      }
    }
  }, []);

  // Update HTML class for Tailwind dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist projects whenever they change
  useEffect(() => {
    localStorage.setItem('easygraph_projects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  // Auto-save logic: Triggered when messages or chartConfig change IF a project ID exists
  useEffect(() => {
    if (currentProjectId && savedProjects.length > 0) {
      setSavedProjects(prev => prev.map(p => {
        if (p.id === currentProjectId) {
          return {
            ...p,
            messages: messages,
            chartConfig: chartConfig,
            lastModified: Date.now()
          };
        }
        return p;
      }));
      setHasUnsavedChanges(false);
    }
  }, [messages, chartConfig, currentProjectId]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- Project Management Functions ---

  const handleStartNewProject = () => {
    setMessages([]);
    setChartConfig(null);
    setCurrentProjectId(null);
    setHasUnsavedChanges(false);
    setCurrentView(AppView.EDITOR);
  };

  const attemptNewProject = () => {
    if (hasUnsavedChanges && !currentProjectId) {
      setPendingAction('NEW_PROJECT');
      setShowUnsavedModal(true);
    } else {
      handleStartNewProject();
    }
  };

  const attemptGoToDashboard = () => {
    if (currentView === AppView.EDITOR && hasUnsavedChanges && !currentProjectId) {
      setPendingAction('DASHBOARD');
      setShowUnsavedModal(true);
    } else {
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const saveProject = (name: string) => {
    if (savedProjects.length >= MAX_PROJECTS && !currentProjectId) {
      alert(`You can only save up to ${MAX_PROJECTS} projects. Please delete some projects first.`);
      setShowSaveModal(false);
      return;
    }

    const newProject: Project = {
      id: currentProjectId || Date.now().toString(),
      name: name,
      messages: messages,
      chartConfig: chartConfig,
      lastModified: Date.now()
    };

    setSavedProjects(prev => {
      const exists = prev.find(p => p.id === newProject.id);
      if (exists) {
        return prev.map(p => p.id === newProject.id ? newProject : p);
      } else {
        return [newProject, ...prev];
      }
    });

    setCurrentProjectId(newProject.id);
    setHasUnsavedChanges(false);
    setShowSaveModal(false);

    // If we were waiting to go somewhere, go there now
    if (pendingAction === 'NEW_PROJECT') {
      setPendingAction(null);
      handleStartNewProject();
    } else if (pendingAction === 'DASHBOARD') {
      setPendingAction(null);
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const loadProject = (id: string) => {
    const project = savedProjects.find(p => p.id === id);
    if (project) {
      setMessages(project.messages);
      setChartConfig(project.chartConfig);
      setCurrentProjectId(project.id);
      setHasUnsavedChanges(false);
      setCurrentView(AppView.EDITOR);
    }
  };

  const initiateDeleteProject = (id: string) => {
    setProjectToDelete(id);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      setSavedProjects(prev => prev.filter(p => p.id !== projectToDelete));
      if (currentProjectId === projectToDelete) {
        setCurrentProjectId(null); // Detach current view from deleted project
      }
      setProjectToDelete(null);
    }
  };

  const discardChanges = () => {
    setShowUnsavedModal(false);
    if (pendingAction === 'NEW_PROJECT') {
      handleStartNewProject();
    } else if (pendingAction === 'DASHBOARD') {
      setCurrentView(AppView.DASHBOARD);
    }
    setPendingAction(null);
  };

  // --- Chat Logic ---

  const handleSendMessage = async (text: string, files: File[]) => {
    setHasUnsavedChanges(true);

    // Convert files to Base64 for Persistence
    const filePromises = files.map(file => {
      return new Promise<{ mimeType: string; data: string; name: string; type: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
           const base64String = (reader.result as string).split(',')[1];
           resolve({ 
             mimeType: file.type, 
             data: base64String, 
             name: file.name, 
             type: file.type.startsWith('image') ? 'image' : 'file'
           });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    const processedFiles = await Promise.all(filePromises);

    // 1. Add User Message (With Base64 data for persistence)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      attachments: processedFiles.map(f => ({
        name: f.name,
        type: f.type as 'image' | 'file',
        data: f.data, // Persist base64
        // Create a temporary URL for immediate display, but we'll rely on 'data' for restored sessions
        url: `data:${f.mimeType};base64,${f.data}` 
      }))
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // 3. Call Gemini
      // Helper to strip non-API fields if needed, but generateChartFromInput handles it
      const response = await generateChartFromInput(
        text, 
        processedFiles.map(f => ({ mimeType: f.mimeType, data: f.data })), 
        messages
      );

      // 4. Update State with AI Response
      setChartConfig(response.chartConfig);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.summary,
        chartConfig: response.chartConfig,
        extractedData: response.extractedData
      };
      
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Error generating chart:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again with clear data or a different file."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex flex-col font-sans">
      <Header 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        setView={attemptGoToDashboard} // Intercept navigation for unsaved check
        currentView={currentView}
        onSave={() => setShowSaveModal(true)}
        onNewProject={attemptNewProject}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <main className="flex-1 overflow-hidden">
        {currentView === AppView.DASHBOARD ? (
          <Dashboard 
            onStartProject={handleStartNewProject} 
            savedProjects={savedProjects}
            onLoadProject={loadProject}
            onDeleteProject={initiateDeleteProject}
            onRenameProject={(id, name) => { /* Simple rename impl if needed, or re-save */ }}
          />
        ) : (
          <div className="h-[calc(100vh-64px)] p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel: Chat */}
            <div className="lg:col-span-4 h-full flex flex-col min-h-[400px]">
               <ChatInterface 
                 messages={messages} 
                 onSendMessage={handleSendMessage}
                 isProcessing={isProcessing}
               />
            </div>
            
            {/* Right Panel: Chart Renderer */}
            <div className="lg:col-span-8 h-full min-h-[400px]">
              <ChartRenderer 
                config={chartConfig} 
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <SaveProjectModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)}
        onSave={saveProject}
        initialName={savedProjects.find(p => p.id === currentProjectId)?.name}
      />

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => { setShowUnsavedModal(false); setPendingAction(null); }}
        onSave={() => { setShowUnsavedModal(false); setShowSaveModal(true); }}
        onDiscard={discardChanges}
      />
      
      <DeleteConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDeleteProject}
        projectName={savedProjects.find(p => p.id === projectToDelete)?.name || 'Project'}
      />
    </div>
  );
};

export default App;
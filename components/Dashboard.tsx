import React from 'react';
import { PlusCircle, FileSpreadsheet, Image as ImageIcon, MessageSquare, Clock, Trash2, BarChart2, Github, Globe } from 'lucide-react';
import { Project } from '../types';

interface DashboardProps {
  onStartProject: () => void;
  savedProjects: Project[];
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onStartProject, 
  savedProjects, 
  onLoadProject, 
  onDeleteProject,
  onRenameProject 
}) => {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-64px)] p-6 animate-fade-in overflow-y-auto">
      <div className="max-w-5xl w-full text-center space-y-8 mt-8 mb-16">
        {/* Hero Section */}
        <div className="space-y-6 flex flex-col items-center">
          <img 
            src="https://i.postimg.cc/sXNpB24x/eg-logo.png" 
            alt="EasyGraph Logo" 
            className="w-20 h-20 rounded-2xl shadow-lg shadow-primary-500/20 mb-2 hover:scale-105 transition-transform duration-300 object-cover" 
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Visualize your data, <span className="text-primary-500">effortlessly.</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload CSVs, describe your metrics, or attach reference images. 
            EasyGraph uses Gemini AI to craft professional, presentation-ready charts in seconds.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onStartProject}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle size={24} />
            Start New Project
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mt-12">
          <FeatureCard 
            icon={<FileSpreadsheet size={32} className="text-emerald-500" />}
            title="Data Upload"
            description="Import CSV or Excel data directly into the engine."
          />
          <FeatureCard 
            icon={<MessageSquare size={32} className="text-blue-500" />}
            title="Natural Language"
            description="Just say: 'Show me Q1 vs Q2 sales trend' and watch it build."
          />
          <FeatureCard 
            icon={<ImageIcon size={32} className="text-purple-500" />}
            title="Visual Reference"
            description="Upload an image of a style you like, and we'll match it."
          />
        </div>

        {/* Saved Projects Section */}
        {savedProjects.length > 0 && (
          <div className="w-full max-w-5xl mx-auto mt-16 text-left">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Clock size={24} className="text-slate-400" />
                 Saved Projects
               </h2>
               <span className="text-sm text-slate-500 dark:text-slate-400 bg-gray-100 dark:bg-dark-800 px-3 py-1 rounded-full">
                 {savedProjects.length} / 10
               </span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {savedProjects.map((project) => (
                 <div 
                   key={project.id} 
                   className="relative bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
                   onClick={() => onLoadProject(project.id)}
                 >
                   {/* Card Action Header */}
                   <div className="absolute top-3 right-3 z-10">
                     <button 
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         onDeleteProject(project.id); 
                       }}
                       className="p-2 bg-white dark:bg-dark-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors"
                       title="Delete Project"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>

                   <div className="p-6">
                     <div className="flex items-center gap-4 mb-4 pr-8">
                       <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 shrink-0">
                         <BarChart2 size={24} />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h3 className="font-semibold text-slate-900 dark:text-white truncate" title={project.name}>
                           {project.name}
                         </h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                           {new Date(project.lastModified).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between mt-4">
                       <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-dark-900 border border-gray-200 dark:border-gray-700">
                          <MessageSquare size={12} className="text-slate-400" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {project.messages.length} messages
                          </span>
                       </div>
                       
                       <span className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                         Open Project &rarr;
                       </span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* Credits Footer */}
      <div className="mt-auto py-12 w-full flex flex-col items-center justify-center gap-4 border-t border-gray-100 dark:border-white/5 animate-fade-in">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Made By <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500 font-bold hover:from-indigo-500 hover:to-primary-500 transition-all duration-300 cursor-default">Samin Yeasar [Solez-ai]</span>
        </p>
        <div className="flex items-center gap-8">
          <a href="https://x.com/Solez_None" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
             <span className="text-lg font-bold group-hover:scale-110 transition-transform duration-300">𝕏</span>
             <span className="text-[10px] font-medium opacity-0 -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">Twitter</span>
          </a>
          <a href="https://github.com/Solez-ai" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
             <Github size={20} className="group-hover:scale-110 transition-transform duration-300" />
             <span className="text-[10px] font-medium opacity-0 -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">Github</span>
          </a>
           <a href="https://solez.vercel.app" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300">
             <Globe size={20} className="group-hover:scale-110 transition-transform duration-300" />
             <span className="text-[10px] font-medium opacity-0 -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">Portfolio</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-gray-100 dark:border-dark-800 shadow-sm hover:shadow-md transition-shadow text-left">
    <div className="mb-4 bg-gray-50 dark:bg-dark-900 w-12 h-12 rounded-lg flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default Dashboard;
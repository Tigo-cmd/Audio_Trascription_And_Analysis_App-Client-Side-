import React, { useState } from 'react';
import { ChevronDown, Plus, Settings as SettingsIcon, LogOut, User as UserIcon } from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  currentProject: Project;
  projects: Project[];
  currentUser: { username: string; role: string } | null;
  onProjectChange: (project: Project) => void;
  onNewProject: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  currentUser,
  onProjectChange,
  onNewProject,
  onSettingsClick,
  onLogout
}) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">AudioScribe</h1>
        
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">{currentProject.name}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showProjectMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2">
                <button
                  onClick={() => {
                    onNewProject();
                    setShowProjectMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
                <div className="border-t border-gray-100 my-2"></div>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      onProjectChange(project);
                      setShowProjectMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${
                      project.id === currentProject.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Modified {project.lastModified.toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onSettingsClick}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{currentUser?.username}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2">
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md text-sm text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
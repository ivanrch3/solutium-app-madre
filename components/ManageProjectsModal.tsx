import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Icons } from '../constants';

interface ManageProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const ManageProjectsModal: React.FC<ManageProjectsModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { user, currentProject, switchProject, duplicateProject, deleteProject, t } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  if (!isOpen) return null;

  const filteredProjects = user?.projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-scaleIn">
        <header className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">{t.manageProjects}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icons.X className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6">
          <Input 
            type="text"
            label=""
            placeholder={t.searchProject}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          {filteredProjects.map(project => (
            <div key={project.id} className={`p-4 rounded-lg border flex items-center justify-between transition-all ${currentProject?.id === project.id ? 'bg-blue-50 border-solutium-blue' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center overflow-hidden">
                <div className="w-8 h-8 rounded-md bg-solutium-blue text-white flex items-center justify-center font-bold text-sm shrink-0 mr-4">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-bold text-slate-800 truncate">{project.name}</p>
                  <p className="text-xs text-slate-500">{project.industry || 'Sin categoría'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0 ml-4">
                {currentProject?.id !== project.id && (
                  <Button size="sm" variant="secondary" onClick={() => { switchProject(project.id); onClose(); }}>{t.selectProject}</Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => { onNavigate('project-settings'); switchProject(project.id); onClose(); }} title={t.configureProject}>
                  <Icons.Settings className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => { duplicateProject(project.id); onClose(); }} title={t.duplicateProject}>
                  <Icons.Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDeleteClick(project)} title={t.deleteProject}>
                  <Icons.Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <p className="text-center text-slate-500 py-8">{t.noProjectsFound}</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <h3 className="text-xl font-bold">{t.confirmDeleteTitle}</h3>
            <p className="text-slate-600 mt-2">{t.confirmDeleteProject} <strong>{projectToDelete.name}</strong>? {t.actionCannotBeUndone}</p>
            <div className="mt-6 flex justify-center space-x-4">
              <Button variant="secondary" onClick={() => setProjectToDelete(null)}>{t.cancel}</Button>
              <Button variant="danger" onClick={confirmDelete}>{t.yesDelete}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProjectsModal;
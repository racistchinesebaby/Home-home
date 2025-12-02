import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import CloneInterface from './components/CloneInterface';
import ProjectView from './components/ProjectView';
import WalletCalculator from './components/WalletCalculator';
import './App.css';

interface Project {
  id: string;
  name: string;
  framework: string;
  status: 'analyzing' | 'ready' | 'cloning' | 'completed';
  files?: any[];
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [...prev, project]);
    setCurrentProject(project);
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
    if (currentProject?.id === updatedProject.id) {
      setCurrentProject(updatedProject);
    }
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <CloneInterface
                  onProjectCreated={handleProjectCreated}
                  onProjectUpdated={handleProjectUpdated}
                />
              }
            />
            <Route
              path="/project/:id"
              element={
                <ProjectView
                  project={currentProject}
                  onProjectUpdated={handleProjectUpdated}
                />
              }
            />
            <Route
              path="/wallet-calculator"
              element={<WalletCalculator />}
            />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;

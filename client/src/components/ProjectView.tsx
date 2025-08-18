import React from 'react';

interface ProjectViewProps {
  project: any;
  onProjectUpdated: (project: any) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, onProjectUpdated }) => {
  if (!project) {
    return (
      <div className="project-view">
        <div className="no-project">
          <h2>No Project Selected</h2>
          <p>Please select a project to view its details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="project-view">
      <div className="project-header">
        <h2>{project.name}</h2>
        <span className={`status-badge ${project.status}`}>
          {project.status}
        </span>
      </div>

      <div className="project-details">
        <div className="detail-item">
          <strong>Framework:</strong> {project.framework}
        </div>
        <div className="detail-item">
          <strong>Project ID:</strong> {project.id}
        </div>
      </div>

      {project.files && (
        <div className="project-files">
          <h3>Generated Files</h3>
          <div className="file-list">
            {project.files.map((file: any, index: number) => (
              <div key={index} className="file-item">
                <div className="file-name">{file.path}</div>
                <pre className="file-content">{file.content}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;

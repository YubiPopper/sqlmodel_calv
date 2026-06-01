import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, FolderOpen, FolderPlus, Pencil, Trash2, X } from 'lucide-react';
import { useModelStore } from '../../store/useModelStore';
import { ConfirmationDialog } from './ConfirmationDialog';

export type ProjectManagerMode = 'create' | 'open' | 'rename' | 'delete';

interface ProjectManagerDialogProps {
  isOpen: boolean;
  initialMode?: ProjectManagerMode;
  onClose: () => void;
  onComplete?: () => void;
}

export const ProjectManagerDialog: React.FC<ProjectManagerDialogProps> = ({
  isOpen,
  initialMode = 'open',
  onClose,
  onComplete,
}) => {
  const colorMode = useModelStore((state) => state.colorMode);
  const projects = useModelStore((state) => state.projects);
  const currentProjectId = useModelStore((state) => state.currentProjectId);
  const createProject = useModelStore((state) => state.createProject);
  const renameProject = useModelStore((state) => state.renameProject);
  const deleteProject = useModelStore((state) => state.deleteProject);
  const switchDataModel = useModelStore((state) => state.switchDataModel);

  const [mode, setMode] = useState<ProjectManagerMode>(initialMode);
  const [newProjectName, setNewProjectName] = useState('New Project');
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({});
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState<string | null>(null);

  const isDark = colorMode === 'dark';

  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) return;

    const initialDrafts: Record<string, string> = {};
    projects.forEach((project) => {
      initialDrafts[project.id] = project.name;
    });
    setRenameDrafts(initialDrafts);
  }, [isOpen, projects]);

  const projectRows = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      modelCount: project.dataModels.length,
      isActive: project.id === currentProjectId,
      firstModelId: project.dataModels[0]?.id,
    }));
  }, [projects, currentProjectId]);

  if (!isOpen) return null;

  const handleCreate = () => {
    const name = newProjectName.trim();
    if (!name) return;
    createProject(name);
    setNewProjectName('New Project');
    onComplete?.();
    onClose();
  };

  const handleOpen = (projectId: string, dataModelId?: string) => {
    if (!dataModelId) return;
    switchDataModel(projectId, dataModelId);
    onComplete?.();
    onClose();
  };

  const handleRename = (projectId: string) => {
    const nextName = (renameDrafts[projectId] || '').trim();
    if (!nextName) return;
    renameProject(projectId, nextName);
    onComplete?.();
  };

  const handleDeleteProject = (projectId: string) => {
    setPendingDeleteProjectId(projectId);
  };

  const confirmDeleteProject = () => {
    if (!pendingDeleteProjectId) return;
    deleteProject(pendingDeleteProjectId);
    setPendingDeleteProjectId(null);
    onComplete?.();
  };

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 10490,
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '92%',
          maxWidth: '640px',
          maxHeight: '78vh',
          background: isDark ? '#0d1117' : '#ffffff',
          border: `1px solid ${isDark ? '#30363d' : '#e5e7eb'}`,
          borderRadius: '12px',
          boxShadow: isDark
            ? '0 24px 70px rgba(0, 0, 0, 0.7)'
            : '0 24px 70px rgba(0, 0, 0, 0.2)',
          zIndex: 10500,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${isDark ? '#30363d' : '#e5e7eb'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 700,
                color: isDark ? '#e6edf3' : '#111827',
              }}
            >
              Project Manager
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '12px',
                color: isDark ? '#8b949e' : '#6b7280',
              }}
            >
              Create, open, and rename projects.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: isDark ? '#8b949e' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${isDark ? '#30363d' : '#e5e7eb'}`,
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setMode('create')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: '7px',
              border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
              background: mode === 'create' ? (isDark ? '#1f2937' : '#eef2ff') : 'transparent',
              color: isDark ? '#e6edf3' : '#1f2937',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <FolderPlus size={14} />
            Create
          </button>

          <button
            onClick={() => setMode('open')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: '7px',
              border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
              background: mode === 'open' ? (isDark ? '#1f2937' : '#eef2ff') : 'transparent',
              color: isDark ? '#e6edf3' : '#1f2937',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <FolderOpen size={14} />
            Open
          </button>

          <button
            onClick={() => setMode('rename')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: '7px',
              border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
              background: mode === 'rename' ? (isDark ? '#1f2937' : '#eef2ff') : 'transparent',
              color: isDark ? '#e6edf3' : '#1f2937',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Pencil size={14} />
            Rename
          </button>

          <button
            onClick={() => setMode('delete')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: '7px',
              border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
              background: mode === 'delete' ? (isDark ? '#2b1a1a' : '#fef2f2') : 'transparent',
              color: mode === 'delete' ? '#ef4444' : isDark ? '#e6edf3' : '#1f2937',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        <div
          style={{
            padding: '14px 16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {mode === 'create' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <label
                htmlFor="new-project-name"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isDark ? '#e6edf3' : '#1f2937',
                }}
              >
                Project Name
              </label>
              <input
                id="new-project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
                style={{
                  height: '36px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
                  background: isDark ? '#161b22' : '#ffffff',
                  color: isDark ? '#e6edf3' : '#111827',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleCreate}
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FolderPlus size={14} />
                Create Project
              </button>
            </div>
          )}

          {(mode === 'open' || mode === 'rename' || mode === 'delete') &&
            projectRows.map((project) => (
              <div
                key={project.id}
                style={{
                  border: `1px solid ${project.isActive ? '#2563eb' : isDark ? '#30363d' : '#e5e7eb'}`,
                  borderRadius: '10px',
                  padding: '10px',
                  background: project.isActive
                    ? isDark
                      ? 'rgba(37, 99, 235, 0.12)'
                      : 'rgba(37, 99, 235, 0.06)'
                    : isDark
                      ? '#11161d'
                      : '#ffffff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: isDark ? '#e6edf3' : '#111827',
                      }}
                    >
                      {project.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: isDark ? '#8b949e' : '#6b7280',
                        marginTop: '2px',
                      }}
                    >
                      {project.modelCount} data model{project.modelCount === 1 ? '' : 's'}
                      {project.isActive ? ' • Active' : ''}
                    </div>
                  </div>

                  {mode === 'open' && (
                    <button
                      onClick={() => handleOpen(project.id, project.firstModelId)}
                      disabled={!project.firstModelId || project.isActive}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        background: project.isActive ? (isDark ? '#30363d' : '#e5e7eb') : '#2563eb',
                        color: project.isActive ? (isDark ? '#9ca3af' : '#6b7280') : '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: project.isActive ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {project.isActive ? <Check size={13} /> : <FolderOpen size={13} />}
                      {project.isActive ? 'Opened' : 'Open'}
                    </button>
                  )}

                  {mode === 'delete' && (
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={projects.length <= 1}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        background: projects.length <= 1 ? (isDark ? '#30363d' : '#e5e7eb') : '#dc2626',
                        color: projects.length <= 1 ? (isDark ? '#9ca3af' : '#6b7280') : '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: projects.length <= 1 ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  )}
                </div>

                {mode === 'rename' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <input
                      value={renameDrafts[project.id] || ''}
                      onChange={(e) =>
                        setRenameDrafts((prev) => ({
                          ...prev,
                          [project.id]: e.target.value,
                        }))
                      }
                      style={{
                        flex: 1,
                        height: '34px',
                        padding: '0 10px',
                        borderRadius: '8px',
                        border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
                        background: isDark ? '#161b22' : '#ffffff',
                        color: isDark ? '#e6edf3' : '#111827',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleRename(project.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Pencil size={13} />
                      Save
                    </button>
                  </div>
                )}
              </div>
            ))}

          {mode === 'delete' && (
            <div
              style={{
                fontSize: '12px',
                color: isDark ? '#8b949e' : '#6b7280',
              }}
            >
              At least one project must remain. Deleting the active project automatically switches to another project.
            </div>
          )}

          {(mode === 'open' || mode === 'rename' || mode === 'delete') && projectRows.length === 0 && (
            <div
              style={{
                fontSize: '13px',
                color: isDark ? '#8b949e' : '#6b7280',
              }}
            >
              No projects found.
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={pendingDeleteProjectId !== null}
        title="Delete Project?"
        message="This removes the selected project and its data models. This action cannot be undone."
        onConfirm={confirmDeleteProject}
        onCancel={() => setPendingDeleteProjectId(null)}
        confirmLabel="Delete Project"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </>,
    document.body
  );
};

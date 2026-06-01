import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  FileCode2,
  Eye,
  Database,
  Boxes,
  Link,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useModelStore } from '../../../store/useModelStore';

export const ProjectTree: React.FC = () => {
  const colorMode = useModelStore((state) => state.colorMode);
  const projects = useModelStore((state) => state.projects);
  const currentProjectId = useModelStore((state) => state.currentProjectId);
  const currentDataModelId = useModelStore((state) => state.currentDataModelId);
  const createProject = useModelStore((state) => state.createProject);
  const renameProject = useModelStore((state) => state.renameProject);
  const deleteProject = useModelStore((state) => state.deleteProject);
  const createDataModel = useModelStore((state) => state.createDataModel);
  const renameDataModel = useModelStore((state) => state.renameDataModel);
  const deleteDataModel = useModelStore((state) => state.deleteDataModel);
  const switchDataModel = useModelStore((state) => state.switchDataModel);
  const setViewMode = useModelStore((state) => state.setViewMode);

  const entities = useModelStore((state) => state.entities);
  const relationships = useModelStore((state) => state.relationships);
  const tables = useModelStore((state) => state.tables);
  const foreignKeys = useModelStore((state) => state.foreignKeys);

  const isDark = colorMode === 'dark';

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(() => new Set(projects.map((p) => p.id)));
  const [expandedModels, setExpandedModels] = useState<Set<string>>(() => new Set(projects.flatMap((p) => p.dataModels.map((m) => m.id))));

  const activeCounts = useMemo(
    () => ({
      entities: entities.length,
      relationships: relationships.length,
      tables: tables.length,
      foreignKeys: foreignKeys.length,
    }),
    [entities.length, relationships.length, tables.length, foreignKeys.length]
  );

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const toggleModel = (modelId: string) => {
    setExpandedModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) next.delete(modelId);
      else next.add(modelId);
      return next;
    });
  };

  const handleCreateProject = () => {
    const name = window.prompt('Project name', 'New Project');
    if (!name) return;
    const id = createProject(name);
    setExpandedProjects((prev) => new Set(prev).add(id));
  };

  const handleCreateModel = (projectId: string) => {
    const name = window.prompt('Data model name', 'New Data Model');
    if (!name) return;
    const modelId = createDataModel(projectId, name);
    if (!modelId) return;
    setExpandedProjects((prev) => new Set(prev).add(projectId));
    setExpandedModels((prev) => new Set(prev).add(modelId));
  };

  return (
    <div
      style={{
        borderBottom: `1px solid ${isDark ? '#30363d' : '#e5e7eb'}`,
        padding: '8px 10px 10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            color: isDark ? '#8b949e' : '#6b7280',
          }}
        >
          Projects
        </div>
        <button
          onClick={handleCreateProject}
          title="Create Project"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            color: isDark ? '#8b949e' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
        {projects.map((project) => {
          const isProjectExpanded = expandedProjects.has(project.id);
          const isActiveProject = currentProjectId === project.id;

          return (
            <div key={project.id} style={{ marginBottom: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 6px',
                  borderRadius: '8px',
                  background: isActiveProject
                    ? isDark
                      ? 'rgba(88, 166, 255, 0.16)'
                      : 'rgba(59, 130, 246, 0.1)'
                    : 'transparent',
                }}
              >
                <button
                  onClick={() => toggleProject(project.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    color: isDark ? '#8b949e' : '#6b7280',
                  }}
                >
                  {isProjectExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                  {isProjectExpanded ? <FolderOpen size={13} /> : <Folder size={13} />}
                  <span
                    style={{
                      fontSize: '12px',
                      color: isDark ? '#e6edf3' : '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {project.name}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const name = window.prompt('Rename project', project.name);
                    if (name) renameProject(project.id, name);
                  }}
                  title="Rename Project"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    color: isDark ? '#8b949e' : '#6b7280',
                    display: 'flex',
                  }}
                >
                  <Pencil size={12} />
                </button>

                <button
                  onClick={() => handleCreateModel(project.id)}
                  title="Create Data Model"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    color: isDark ? '#8b949e' : '#6b7280',
                    display: 'flex',
                  }}
                >
                  <Plus size={13} />
                </button>

                <button
                  onClick={() => {
                    if (projects.length <= 1) {
                      window.alert('At least one project is required.');
                      return;
                    }
                    const confirmed = window.confirm(`Delete project "${project.name}"?`);
                    if (confirmed) deleteProject(project.id);
                  }}
                  title="Delete Project"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#ef4444',
                    display: 'flex',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {isProjectExpanded && (
                <div style={{ marginLeft: '18px', marginTop: '2px' }}>
                  {project.dataModels.map((model) => {
                    const isModelExpanded = expandedModels.has(model.id);
                    const isActiveModel = currentProjectId === project.id && currentDataModelId === model.id;

                    return (
                      <div key={model.id} style={{ marginBottom: '3px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 6px',
                            borderRadius: '6px',
                            background: isActiveModel
                              ? isDark
                                ? 'rgba(63, 185, 80, 0.18)'
                                : 'rgba(22, 163, 74, 0.12)'
                              : 'transparent',
                          }}
                        >
                          <button
                            onClick={() => toggleModel(model.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              color: isDark ? '#8b949e' : '#6b7280',
                            }}
                          >
                            {isModelExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>

                          <button
                            onClick={() => switchDataModel(project.id, model.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              padding: 0,
                              margin: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              minWidth: 0,
                              flex: 1,
                              color: isDark ? '#e6edf3' : '#111827',
                              textAlign: 'left',
                            }}
                          >
                            <FileCode2 size={12} />
                            <span
                              style={{
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {model.name}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              const name = window.prompt('Rename data model', model.name);
                              if (name) renameDataModel(project.id, model.id, name);
                            }}
                            title="Rename Data Model"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: 0,
                              color: isDark ? '#8b949e' : '#6b7280',
                              display: 'flex',
                            }}
                          >
                            <Pencil size={11} />
                          </button>

                          <button
                            onClick={() => {
                              const isLastModel = project.dataModels.length <= 1;
                              if (isLastModel) {
                                window.alert('Each project must have at least one data model.');
                                return;
                              }
                              const confirmed = window.confirm(`Delete data model "${model.name}"?`);
                              if (confirmed) deleteDataModel(project.id, model.id);
                            }}
                            title="Delete Data Model"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: 0,
                              color: '#ef4444',
                              display: 'flex',
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        {isModelExpanded && (
                          <div style={{ marginLeft: '16px' }}>
                            <button
                              onClick={() => {
                                switchDataModel(project.id, model.id);
                                setViewMode('conceptual');
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                padding: '3px 0',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: isDark ? '#8b949e' : '#6b7280',
                                fontSize: '11px',
                              }}
                            >
                              <Eye size={11} />
                              Conceptual View
                            </button>

                            {isActiveModel && (
                              <div style={{ marginLeft: '17px', color: isDark ? '#6e7681' : '#9ca3af', fontSize: '11px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Boxes size={10} />
                                  Entities ({activeCounts.entities})
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Link size={10} />
                                  Relationships ({activeCounts.relationships})
                                </div>
                                {entities.map((entity) => (
                                  <div key={entity.id} style={{ marginLeft: '16px' }}>- {entity.name}</div>
                                ))}
                              </div>
                            )}

                            <button
                              onClick={() => {
                                switchDataModel(project.id, model.id);
                                setViewMode('physical');
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                padding: '3px 0',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: isDark ? '#8b949e' : '#6b7280',
                                fontSize: '11px',
                              }}
                            >
                              <Database size={11} />
                              Physical View
                            </button>

                            {isActiveModel && (
                              <div style={{ marginLeft: '17px', color: isDark ? '#6e7681' : '#9ca3af', fontSize: '11px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Boxes size={10} />
                                  Tables ({activeCounts.tables})
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Link size={10} />
                                  Foreign Keys ({activeCounts.foreignKeys})
                                </div>
                                {tables.map((table) => (
                                  <div key={table.id} style={{ marginLeft: '16px' }}>- {table.name}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

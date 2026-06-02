import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { useModelStore } from '../../../store/useModelStore';
import { AuthDialog } from '../../ui/AuthDialog';
import { IconButton } from '../../shared/IconButton';
import { Tooltip } from '../../shared/Tooltip';
import { Toast } from '../../ui/Toast';

interface SaveShareButtonsProps {
  isMobile?: boolean;
}

export const SaveShareButtons = ({ isMobile = false }: SaveShareButtonsProps) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  const user = useModelStore((state) => state.user);
  const colorMode = useModelStore((state) => state.colorMode);
  const projects = useModelStore((state) => state.projects);
  const currentProjectId = useModelStore((state) => state.currentProjectId);
  const setProjectShared = useModelStore((state) => state.setProjectShared);
  const inviteProjectCollaborator = useModelStore((state) => state.inviteProjectCollaborator);
  const removeProjectCollaborator = useModelStore((state) => state.removeProjectCollaborator);
  const isDark = colorMode === 'dark';
  const currentProject = projects.find((project) => project.id === currentProjectId) || null;
  const canManageCollaborators = Boolean(user && currentProject && currentProject.ownerId === user.id);

  const handleShare = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!currentProjectId || !currentProject) {
      alert('Select a project before sharing.');
      return;
    }

    setProjectShared(currentProjectId, true);
    await useModelStore.getState().saveProjectsToCloud([currentProjectId]);
    setShareMessage('');
    setShowShareDialog(true);
  };

  const copyShareLink = () => {
    const url = new URL(window.location.href);
    if (currentProjectId) {
      url.searchParams.set('project', currentProjectId);
      url.searchParams.set('shared', currentProjectId);
    }
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setShowShareDialog(false);
    setShowToast(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteCollaborator = async () => {
    if (!currentProjectId || !canManageCollaborators) return;

    setInviting(true);
    try {
      const result = await inviteProjectCollaborator(currentProjectId, collaboratorEmail);
      setShareMessage(result.message);
      if (result.ok) {
        setCollaboratorEmail('');
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!currentProjectId || !canManageCollaborators) return;
    await removeProjectCollaborator(currentProjectId, collaboratorId);
  };

  return (
    <>
      {isMobile ? (
        <button
          onClick={() => {
            void handleShare();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px 14px',
            minHeight: '48px',
            height: '48px',
            boxSizing: 'border-box',
            background: isDark ? '#21262d' : '#f3f4f6',
            border: `1px solid ${isDark ? '#30363d' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDark ? '#e6edf3' : '#374151',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.15s ease',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.background = isDark ? '#30363d' : '#e5e7eb';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.background = isDark ? '#21262d' : '#f3f4f6';
          }}
        >
          <Share2 size={18} style={{ flexShrink: 0 }} />
          <span>Share</span>
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tooltip content={user ? 'Share model' : 'Sign in to share'}>
            <div>
              <IconButton
                icon={<Share2 size={18} />}
                onClick={() => {
                  void handleShare();
                }}
                variant="ghost"
                size="md"
              />
            </div>
          </Tooltip>
        </div>
      )}

      {showToast && (
        <Toast
          message="Project share link copied to clipboard!"
          type="share"
          onClose={() => setShowToast(false)}
        />
      )}

      <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />

      {showShareDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowShareDialog(false)}
        >
          <div
            style={{
              background: isDark ? '#161b22' : '#ffffff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: isDark
                ? '0 20px 60px rgba(0, 0, 0, 0.5)'
                : '0 20px 60px rgba(0, 0, 0, 0.15)',
              border: isDark ? '1px solid #30363d' : '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                height: '4px',
                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
              }}
            />

            <div style={{ padding: '20px' }}>
              <h3
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '19px',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Share Project
              </h3>

              <p
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '13px',
                  color: isDark ? '#8b949e' : '#64748b',
                  lineHeight: 1.5,
                }}
              >
                Share this project link and invite collaborators to edit {currentProject ? `"${currentProject.name}"` : ''}.
              </p>

              {canManageCollaborators && (
                <div
                  style={{
                    marginBottom: '14px',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <input
                    type="email"
                    placeholder="Collaborator email"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void handleInviteCollaborator();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      border: isDark ? '1px solid #30363d' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: isDark ? '#0d1117' : '#f8fafc',
                      color: isDark ? '#e6edf3' : '#1f2937',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {
                      void handleInviteCollaborator();
                    }}
                    disabled={inviting}
                    style={{
                      padding: '9px 14px',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: inviting ? 'default' : 'pointer',
                      opacity: inviting ? 0.75 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inviting ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
              )}

              {shareMessage && (
                <p
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: '12px',
                    color: shareMessage.toLowerCase().includes('unable') || shareMessage.toLowerCase().includes('only')
                      ? '#ef4444'
                      : isDark
                        ? '#58a6ff'
                        : '#2563eb',
                  }}
                >
                  {shareMessage}
                </p>
              )}

              {currentProject && currentProject.collaborators.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '8px',
                      color: isDark ? '#c9d1d9' : '#1f2937',
                    }}
                  >
                    Collaborators
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {currentProject.collaborators.map((collaboratorId) => (
                      <div
                        key={collaboratorId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          background: isDark ? '#0d1117' : '#f8fafc',
                          border: isDark ? '1px solid #30363d' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '7px 10px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            color: isDark ? '#8b949e' : '#475569',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {collaboratorId}
                        </span>
                        {canManageCollaborators && (
                          <button
                            onClick={() => {
                              void handleRemoveCollaborator(collaboratorId);
                            }}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${window.location.pathname}${currentProjectId ? `?project=${currentProjectId}&shared=${currentProjectId}` : ''}`}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    border: isDark ? '1px solid #30363d' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: isDark ? '#0d1117' : '#f8fafc',
                    color: isDark ? '#e6edf3' : '#1f2937',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={copyShareLink}
                  style={{
                    padding: '9px 16px',
                    border: 'none',
                    outline: 'none',
                    borderRadius: '8px',
                    background: copied
                      ? '#22c55e'
                      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <button
                onClick={() => setShowShareDialog(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: isDark
                    ? '1px solid rgba(48, 54, 61, 0.8)'
                    : '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: isDark ? '#8b949e' : '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? '#21262d' : '#f3f4f6';
                  e.currentTarget.style.color = isDark ? '#e6edf3' : '#1f2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = isDark ? '#8b949e' : '#64748b';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

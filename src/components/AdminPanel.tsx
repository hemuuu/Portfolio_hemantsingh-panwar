import React, { useState } from 'react';
import { Edit3, Trash2, Plus, Save, Upload, ExternalLink, LogOut } from 'lucide-react';

interface ProjectData {
  id: number;
  name: string;
  description: string;
  link: string;
  thumbnail: string;
  x: number;
  y: number;
  z: number;
  width?: number;
  height?: number;
}

interface SocialLinks {
  instagram: string;
  linkedin: string;
  youtube: string;
  github: string;
  twitter: string;
}

interface AdminPanelProps {
  projects: ProjectData[];
  onProjectUpdate: (project: ProjectData) => void;
  onProjectAdd: (project: Omit<ProjectData, 'id'>) => void;
  onProjectDelete: (id: number) => void;
  onLogout: () => void;
  socialLinks: SocialLinks;
  onSocialLinksUpdate: (links: SocialLinks) => void;
}

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const AdminPanel: React.FC<AdminPanelProps> = ({
  projects,
  onProjectUpdate,
  onProjectAdd,
  onProjectDelete,
  onLogout,
  socialLinks,
  onSocialLinksUpdate
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProject, setNewProject] = useState<Omit<ProjectData, 'id'>>({
    name: '',
    description: '',
    link: '',
    thumbnail: '',
    x: Math.random() * 4000 - 2000,
    y: Math.random() * 4000 - 2000,
    z: Math.random() * 1000,
    width: 280,
    height: 380
  });

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (project: ProjectData) => {
    setEditingProject({ ...project });
  };

  const handleSave = () => {
    if (editingProject) {
      onProjectUpdate(editingProject);
      setEditingProject(null);
      setSelectedProject(editingProject);
    }
  };

  const handleCancel = () => {
    setEditingProject(null);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedProject(null);
    setEditingProject(null);
  };

  const handleSaveNew = () => {
    onProjectAdd(newProject);
    setNewProject({
      name: '',
      description: '',
      link: '',
      thumbnail: '',
      x: Math.random() * 4000 - 2000,
      y: Math.random() * 4000 - 2000,
      z: Math.random() * 1000,
      width: 280,
      height: 380
    });
    setIsAddingNew(false);
  };

  const handleDelete = (id: number) => {
    onProjectDelete(id);
    if (selectedProject?.id === id) {
      setSelectedProject(null);
      setEditingProject(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portfolio Admin</h1>
              <p className="text-sm text-gray-600">Manage your portfolio projects</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Social Links Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={socialLinks.instagram}
                  onChange={(e) => onSocialLinksUpdate({ ...socialLinks, instagram: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://instagram.com/your-profile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={socialLinks.linkedin}
                  onChange={(e) => onSocialLinksUpdate({ ...socialLinks, linkedin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={socialLinks.youtube}
                  onChange={(e) => onSocialLinksUpdate({ ...socialLinks, youtube: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/@your-channel"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Projects ({projects.length})</h2>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                >
                  <Plus size={14} />
                  Add Project
                </button>
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedProject?.id === project.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{project.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Details/Edit Form */}
          <div className="bg-white rounded-lg shadow-sm border">
            {isAddingNew ? (
              /* Add New Project Form */
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Add New Project</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Link
                    </label>
                    <input
                      type="url"
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail *
                    </label>
                    <div className="space-y-3">
                      {newProject.thumbnail && (
                        <img
                          src={newProject.thumbnail}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      )}
                      <div className="flex gap-2 items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const dataUrl = await readFileAsDataURL(file);
                              setNewProject({ ...newProject, thumbnail: dataUrl });
                            }
                          }}
                          className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <span className="text-xs text-gray-400">or</span>
                        <input
                          type="url"
                          value={newProject.thumbnail}
                          onChange={(e) => setNewProject({ ...newProject, thumbnail: e.target.value })}
                          placeholder="Paste image URL"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveNew}
                      disabled={!newProject.name || !newProject.thumbnail}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Save size={16} />
                      Add Project
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedProject ? (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingProject ? 'Edit Project' : 'Project Details'}
                  </h2>
                  {!editingProject && (
                    <button
                      onClick={() => handleEdit(selectedProject)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                  )}
                </div>

                {editingProject ? (
                  /* Edit Form */
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={editingProject.name}
                        onChange={(e) => setEditingProject({
                          ...editingProject,
                          name: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingProject.description}
                        onChange={(e) => setEditingProject({
                          ...editingProject,
                          description: e.target.value
                        })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Link
                      </label>
                      <input
                        type="url"
                        value={editingProject.link}
                        onChange={(e) => setEditingProject({
                          ...editingProject,
                          link: e.target.value
                        })}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thumbnail
                      </label>
                      <div className="space-y-3">
                        <img
                          src={editingProject.thumbnail}
                          alt={editingProject.name}
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <div className="flex gap-2 items-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const dataUrl = await readFileAsDataURL(file);
                                setEditingProject({ ...editingProject, thumbnail: dataUrl });
                              }
                            }}
                            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <span className="text-xs text-gray-400">or</span>
                          <input
                            type="url"
                            value={editingProject.thumbnail}
                            onChange={(e) => setEditingProject({ ...editingProject, thumbnail: e.target.value })}
                            placeholder="Paste image URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={editingProject.width || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, width: parseInt(e.target.value) || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={editingProject.height || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, height: parseInt(e.target.value) || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">X Position</label>
                        <input
                          type="number"
                          value={editingProject.x}
                          onChange={(e) => setEditingProject({ ...editingProject, x: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Y Position</label>
                        <input
                          type="number"
                          value={editingProject.y}
                          onChange={(e) => setEditingProject({ ...editingProject, y: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Z Position</label>
                        <input
                          type="number"
                          value={editingProject.z}
                          onChange={(e) => setEditingProject({ ...editingProject, z: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-6">
                    <div>
                      <img
                        src={selectedProject.thumbnail}
                        alt={selectedProject.name}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedProject.name}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Link
                      </label>
                      {selectedProject.link && selectedProject.link !== '#' ? (
                        <a
                          href={selectedProject.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink size={16} />
                          {selectedProject.link}
                        </a>
                      ) : (
                        <span className="text-gray-500">No link provided</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Position X
                        </label>
                        <span className="text-sm text-gray-900">{Math.round(selectedProject.x)}</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Position Y
                        </label>
                        <span className="text-sm text-gray-900">{Math.round(selectedProject.y)}</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Position Z
                        </label>
                        <span className="text-sm text-gray-900">{Math.round(selectedProject.z)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Edit3 size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Select a project to view or edit its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
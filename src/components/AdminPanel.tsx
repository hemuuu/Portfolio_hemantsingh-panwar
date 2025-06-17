import React, { useState } from 'react';
import { Edit3, Trash2, Plus, Save, Upload, ExternalLink, LogOut } from 'lucide-react';

interface ProjectData {
  id: string;
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
  onProjectDelete: (id: string) => void;
  onClose: () => void;
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
  onClose,
  onLogout,
  socialLinks,
  onSocialLinksUpdate
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [newProject, setNewProject] = useState<Omit<ProjectData, 'id'> & { id?: string }>({
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
    setSelectedProject(project);
    setEditingProject({ ...project });
  };

  const handleSave = () => {
    if (editingProject) {
      console.log('Saving existing project with thumbnail:', (editingProject.thumbnail || '').substring(0, 100) + '...');
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
  };

  const handleSaveNew = () => {
    console.log('Saving new project with thumbnail:', (newProject.thumbnail || '').substring(0, 100) + '...');
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

  const handleDelete = (id: string) => {
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
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Plus size={16} />
                  Add New
                </button>
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
              <div className="overflow-y-auto h-[400px]">
                {filteredProjects.length === 0 ? (
                  <p className="text-center text-gray-500">No projects found.</p>
                ) : (
                  <ul className="space-y-2">
              {filteredProjects.map((project) => (
                      <li
                  key={project.id}
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${selectedProject?.id === project.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedProject(project)}
                >
                        <span className="font-medium text-gray-800">{project.name}</span>
                        <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                            className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                            className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                      </li>
                    ))}
                  </ul>
                )}
                </div>
            </div>
          </div>

          {/* Project Details / Add New Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isAddingNew ? 'Add New Project' : selectedProject ? 'Edit Project' : 'Select a Project'}
            </h2>
            {(isAddingNew || selectedProject) ? (
              <div className="space-y-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                      type="text"
                    value={isAddingNew ? newProject.name : (editingProject?.name || '')}
                    onChange={(e) => isAddingNew ? setNewProject({ ...newProject, name: e.target.value }) : setEditingProject(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Awesome Project"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                    value={isAddingNew ? newProject.description : (editingProject?.description || '')}
                    onChange={(e) => isAddingNew ? setNewProject({ ...newProject, description: e.target.value }) : setEditingProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="A brief description of the project."
                  ></textarea>
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                    <input
                      type="url"
                    value={isAddingNew ? newProject.link : (editingProject?.link || '')}
                    onChange={(e) => isAddingNew ? setNewProject({ ...newProject, link: e.target.value }) : setEditingProject(prev => prev ? { ...prev, link: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://my-project-url.com"
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-3 py-1 text-sm rounded-md ${uploadMode === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-3 py-1 text-sm rounded-md ${uploadMode === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Upload
                    </button>
                </div>

                  {uploadMode === 'file' ? (
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const dataURL = await readFileAsDataURL(file);
                            console.log('File converted to dataURL:', dataURL.substring(0, 100) + '...');
                            if (isAddingNew) {
                              setNewProject({ ...newProject, thumbnail: dataURL });
                              console.log('New project thumbnail set:', (dataURL || '').substring(0, 100) + '...');
                            } else if (editingProject) {
                              setEditingProject({ ...editingProject, thumbnail: dataURL });
                              console.log('Editing project thumbnail set:', (dataURL || '').substring(0, 100) + '...');
                            }
                          }
                        }}
                        className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  ) : (
                    <div className="mb-4">
                      <input
                        type="url"
                        id="thumbnail"
                        value={isAddingNew ? newProject.thumbnail || '' : (editingProject?.thumbnail || '')}
                        onChange={(e) => {
                          if (isAddingNew) {
                            setNewProject({ ...newProject, thumbnail: e.target.value });
                          } else if (editingProject) {
                            setEditingProject({ ...editingProject, thumbnail: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    </div>
                  )}
                  
                  {(isAddingNew && newProject.thumbnail) || (!isAddingNew && editingProject?.thumbnail) ? (
                    <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                      {console.log('Rendering thumbnail with src:', isAddingNew ? (newProject.thumbnail || '').substring(0, 100) + '...' : (editingProject?.thumbnail || '').substring(0, 100) + '...')}
                      <img
                        src={isAddingNew ? newProject.thumbnail : (editingProject?.thumbnail || '')}
                        alt="Thumbnail Preview"
                        className="max-w-full h-auto max-h-40 object-contain"
                        onLoad={() => console.log('Thumbnail loaded:', isAddingNew ? newProject.thumbnail : (editingProject?.thumbnail || ''))}
                        onError={(e) => {
                          console.error('Thumbnail failed to load:', e.currentTarget.src);
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=Invalid+Image';
                        }}
                      />
                    </div>
                  ) : null}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">X Position</label>
                        <input
                          type="number"
                    value={isAddingNew ? newProject.x : (editingProject?.x || 0)}
                    onChange={(e) => isAddingNew ? setNewProject({ ...newProject, x: parseFloat(e.target.value) }) : setEditingProject(prev => prev ? { ...prev, x: parseFloat(e.target.value) } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Y Position</label>
                        <input
                          type="number"
                    value={isAddingNew ? newProject.y : (editingProject?.y || 0)}
                    onChange={(e) => isAddingNew ? setNewProject({ ...newProject, y: parseFloat(e.target.value) }) : setEditingProject(prev => prev ? { ...prev, y: parseFloat(e.target.value) } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Z Position</label>
                        <input
                          type="number"
                    value={isAddingNew ? newProject.z : (editingProject?.z || 0)}
                    onChange={(e) => isAddingNew ? setNewProject({ ...newProject, z: parseFloat(e.target.value) }) : setEditingProject(prev => prev ? { ...prev, z: parseFloat(e.target.value) } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width (Optional)</label>
                  <input
                    type="number"
                    value={isAddingNew ? newProject.width || '' : (editingProject?.width || '')}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      isAddingNew ? setNewProject({ ...newProject, width: value }) : setEditingProject(prev => prev ? { ...prev, width: value } : null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 280"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (Optional)</label>
                  <input
                    type="number"
                    value={isAddingNew ? newProject.height || '' : (editingProject?.height || '')}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      isAddingNew ? setNewProject({ ...newProject, height: value }) : setEditingProject(prev => prev ? { ...prev, height: value } : null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 380"
                  />
                    </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={isAddingNew ? handleSaveNew : handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    {isAddingNew ? 'Create Project' : 'Save Changes'}
                  </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                  </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">Please select a project to edit or click "Add New" to create a new one.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
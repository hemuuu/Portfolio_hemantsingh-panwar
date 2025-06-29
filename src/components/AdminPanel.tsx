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
  status?: string;
  category?: string;
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
  const [isUploading, setIsUploading] = useState(false);
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

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'portfolio_preset');

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dmi8dtrcc/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Image upload failed, no secure_url received.');
      }
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return null;
    } finally {
      setIsUploading(false);
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

          {/* Project Details / Edit Form */}
          <div className="bg-white rounded-lg shadow-sm border">
            {editingProject && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Project</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={editingProject.name}
                      onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editingProject.description}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                    <input
                      type="url"
                      value={editingProject.link}
                      onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mb-4">
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
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0] && editingProject) {
                            const secureUrl = await handleImageUpload(e.target.files[0]);
                            if (secureUrl) {
                              setEditingProject({ ...editingProject, thumbnail: secureUrl });
                            }
                          }
                        }}
                        className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    ) : (
                      <input
                        type="url"
                        value={editingProject.thumbnail || ''}
                        onChange={(e) => {
                          if (editingProject) {
                            setEditingProject({ ...editingProject, thumbnail: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    )}
                    
                    {editingProject.thumbnail && (
                      <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                        <img
                          src={editingProject.thumbnail}
                          alt="Thumbnail Preview"
                          className="max-w-full h-auto max-h-40 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                    <input
                      type="number"
                      value={editingProject.width || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, width: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                    <input
                      type="number"
                      value={editingProject.height || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, height: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editingProject.status || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Planning">Planning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editingProject.category || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="Web">Web</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Design">Design</option>
                      <option value="Game">Game</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
            {isAddingNew && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Project</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="My Awesome Project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="A brief description of the project."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                    <input
                      type="url"
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://my-project-url.com"
                    />
                  </div>
                  <div className="mb-4">
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
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const secureUrl = await handleImageUpload(e.target.files[0]);
                            if (secureUrl) {
                              setNewProject({ ...newProject, thumbnail: secureUrl });
                            }
                          }
                        }}
                        className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    ) : (
                      <input
                        type="url"
                        value={newProject.thumbnail || ''}
                        onChange={(e) => {
                          if (newProject) {
                            setNewProject({ ...newProject, thumbnail: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/thumbnail.jpg"
                      />
                    )}
                    
                    {newProject.thumbnail && (
                      <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                        <img
                          src={newProject.thumbnail}
                          alt="Thumbnail Preview"
                          className="max-w-full h-auto max-h-40 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">X Position</label>
                    <input
                      type="number"
                      value={newProject.x}
                      onChange={(e) => setNewProject({ ...newProject, x: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Y Position</label>
                    <input
                      type="number"
                      value={newProject.y}
                      onChange={(e) => setNewProject({ ...newProject, y: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Z Position</label>
                    <input
                      type="number"
                      value={newProject.z}
                      onChange={(e) => setNewProject({ ...newProject, z: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (Optional)</label>
                    <input
                      type="number"
                      value={newProject.width || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        setNewProject({ ...newProject, width: value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. 280"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (Optional)</label>
                    <input
                      type="number"
                      value={newProject.height || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        setNewProject({ ...newProject, height: value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. 380"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newProject.status || ''}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Planning">Planning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newProject.category || ''}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="Web">Web</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Design">Design</option>
                      <option value="Game">Game</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                  <button onClick={handleSaveNew} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
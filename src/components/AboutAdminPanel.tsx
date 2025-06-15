import React, { useState } from 'react';
import { Save, X, Plus, LogOut } from 'lucide-react';

interface LogEntry {
  id: number;
  text: string;
}

interface WorkExperience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
}

interface AboutAdminPanelProps {
  initialAboutText: string;
  initialDescriptionText: string;
  initialLogEntries: LogEntry[];
  initialSkills: string[];
  initialWorkExperience: WorkExperience[];
  onSave: (
    aboutText: string,
    descriptionText: string,
    logEntries: LogEntry[],
    skills: string[],
    workExperience: WorkExperience[]
  ) => void;
  onCancel: () => void;
  onLogout: () => void;
}

const AboutAdminPanel: React.FC<AboutAdminPanelProps> = ({
  initialAboutText,
  initialDescriptionText,
  initialLogEntries,
  initialSkills,
  initialWorkExperience,
  onSave,
  onCancel,
  onLogout
}) => {
  const [aboutText, setAboutText] = useState(initialAboutText);
  const [descriptionText, setDescriptionText] = useState(initialDescriptionText);
  const [logEntries, setLogEntries] = useState<LogEntry[]>(initialLogEntries);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(initialWorkExperience);
  const [newSkill, setNewSkill] = useState('');

  const handleLogEntryChange = (id: number, newText: string) => {
    setLogEntries(logEntries.map(entry =>
      entry.id === id ? { ...entry, text: newText } : entry
    ));
  };

  const handleAddLogEntry = () => {
    setLogEntries([...logEntries, { id: Date.now(), text: '' }]);
  };

  const handleRemoveLogEntry = (id: number) => {
    setLogEntries(logEntries.filter(entry => entry.id !== id));
  };

  const handleWorkExperienceChange = (id: number, field: keyof WorkExperience, value: string) => {
    setWorkExperience(workExperience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleAddWorkExperience = () => {
    setWorkExperience([...workExperience, {
      id: Date.now(),
      title: '',
      company: '',
      period: '',
      description: ''
    }]);
  };

  const handleRemoveWorkExperience = (id: number) => {
    setWorkExperience(workExperience.filter(exp => exp.id !== id));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(aboutText, descriptionText, logEntries, skills, workExperience);
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Edit About Page</h2>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#00ff00] text-black font-bold rounded hover:bg-[#00cc00] transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-[#ff0000] text-white font-bold rounded hover:bg-[#cc0000] transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* About Section */}
        <div className="bg-[#222] p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">About Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">About Text</label>
              <input
                type="text"
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none"
                placeholder="Enter about text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none min-h-[100px]"
                placeholder="Enter description"
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-[#222] p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => {
                    const newSkills = [...skills];
                    newSkills[index] = e.target.value;
                    setSkills(newSkills);
                  }}
                  className="flex-1 px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none"
                  placeholder="Enter skill"
                />
                <button
                  onClick={() => {
                    const newSkills = skills.filter((_, i) => i !== index);
                    setSkills(newSkills);
                  }}
                  className="p-2 text-red-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => setSkills([...skills, ''])}
              className="w-full px-4 py-2 bg-[#333] text-white rounded border border-gray-600 hover:bg-[#444] transition-colors"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Log Entries Section */}
        <div className="bg-[#222] p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Log Entries</h3>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
            {logEntries.map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={entry.text}
                  onChange={(e) => {
                    const newEntries = [...logEntries];
                    newEntries[index] = { ...entry, text: e.target.value };
                    setLogEntries(newEntries);
                  }}
                  className="flex-1 px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none"
                  placeholder="Enter log entry"
                />
                <button
                  onClick={() => {
                    const newEntries = logEntries.filter((_, i) => i !== index);
                    setLogEntries(newEntries);
                  }}
                  className="p-2 text-red-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setLogEntries([...logEntries, { id: Date.now(), text: '' }])}
            className="w-full mt-3 px-4 py-2 bg-[#333] text-white rounded border border-gray-600 hover:bg-[#444] transition-colors"
          >
            Add Log Entry
          </button>
        </div>

        {/* Work Experience Section */}
        <div className="bg-[#222] p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Work Experience</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {workExperience.map((exp, index) => (
              <div key={exp.id} className="bg-[#333] p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-white font-medium">Experience {index + 1}</h4>
                  <button
                    onClick={() => {
                      const newExp = workExperience.filter((_, i) => i !== index);
                      setWorkExperience(newExp);
                    }}
                    className="p-1 text-red-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...workExperience];
                        newExp[index] = { ...exp, title: e.target.value };
                        setWorkExperience(newExp);
                      }}
                      className="w-full px-3 py-2 bg-[#444] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none"
                      placeholder="Job Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...workExperience];
                        newExp[index] = { ...exp, company: e.target.value };
                        setWorkExperience(newExp);
                      }}
                      className="w-full px-3 py-2 bg-[#444] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Period</label>
                  <input
                    type="text"
                    value={exp.period}
                    onChange={(e) => {
                      const newExp = [...workExperience];
                      newExp[index] = { ...exp, period: e.target.value };
                      setWorkExperience(newExp);
                    }}
                    className="w-full px-3 py-2 bg-[#444] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none"
                    placeholder="e.g., 2020 - 2023"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...workExperience];
                      newExp[index] = { ...exp, description: e.target.value };
                      setWorkExperience(newExp);
                    }}
                    className="w-full px-3 py-2 bg-[#444] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none min-h-[80px]"
                    placeholder="Job Description"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setWorkExperience([...workExperience, {
              id: Date.now(),
              title: '',
              company: '',
              period: '',
              description: ''
            }])}
            className="w-full mt-3 px-4 py-2 bg-[#333] text-white rounded border border-gray-600 hover:bg-[#444] transition-colors"
          >
            Add Work Experience
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutAdminPanel; 
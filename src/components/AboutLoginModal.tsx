import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AboutLoginModalProps {
  onLogin: () => void;
  onClose: () => void;
}

const AboutLoginModal: React.FC<AboutLoginModalProps> = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === 'hemuuuuu11@gmail.com' && password === '9623742747') {
      onLogin();
      setError('');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]">
      <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-2xl w-96 max-w-md mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">About Page Admin</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#00ff00] focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#00ff00] text-black font-bold rounded hover:bg-[#00cc00] transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AboutLoginModal; 
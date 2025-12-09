import React, { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccess, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Joaof' && password === 'Joaofff') {
      onSuccess();
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
            <Lock className="text-emerald-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Acesso Admin</h2>
          <p className="text-zinc-400 text-sm">Área restrita para editores.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Login</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
              placeholder="Usuário"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Senha</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-900/50">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-lg transition-all mt-2"
          >
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
};
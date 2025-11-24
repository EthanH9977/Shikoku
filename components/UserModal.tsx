import React, { useState } from 'react';
import { User, ArrowRight, Loader2 } from 'lucide-react';

interface UserModalProps {
  onConfirm: (username: string) => void;
  isLoading: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ onConfirm, isLoading }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onConfirm(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-shikoku-paper/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-100">
        <div className="bg-shikoku-indigo p-6 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <User className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">使用者登入</h2>
          <p className="text-indigo-200 text-xs mt-2">建立或存取您的 TravelBook</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-wider">
              您的名字 / 代號
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="例如：Ethan"
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-lg font-bold text-shikoku-indigo focus:ring-2 focus:ring-shikoku-indigo focus:border-transparent outline-none transition-all placeholder:font-normal"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full py-4 bg-shikoku-red text-white font-bold rounded-xl shadow-lg shadow-red-100 hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>連接雲端中...</span>
              </>
            ) : (
              <>
                <span>進入旅程</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
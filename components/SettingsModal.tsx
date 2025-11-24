import React from 'react';
import { X, User, Calendar, Save, FileJson, Cloud } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  currentUser: string | null;
  currentFileName: string | null;
  onSwitchUser: () => void;
  onSwitchFile: () => void;
  onSync: () => void;
  onExport: () => void;
  onImport: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  currentUser,
  currentFileName,
  onSwitchUser,
  onSwitchFile,
  onSync,
  onExport,
  onImport
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-shikoku-indigo p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg font-serif">設定與管理</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-2">
            {/* User & File Info Card */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-shikoku-indigo">
                        <User size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">目前使用者</p>
                        <p className="font-bold text-stone-800">{currentUser || "尚未登入"}</p>
                    </div>
                    <button onClick={onSwitchUser} className="ml-auto text-xs text-blue-600 font-bold hover:underline">
                        切換
                    </button>
                </div>
                <div className="w-full h-[1px] bg-stone-200 mb-3"></div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                        <Calendar size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">目前行程表</p>
                        <p className="font-bold text-stone-800 truncate max-w-[140px]">{currentFileName || "未選擇"}</p>
                    </div>
                     <button onClick={onSwitchFile} className="ml-auto text-xs text-blue-600 font-bold hover:underline">
                        切換
                    </button>
                </div>
            </div>

            <p className="text-xs font-bold text-stone-400 px-2 mt-4 mb-2 uppercase">雲端同步</p>
            <button 
                onClick={onSync}
                className="w-full flex items-center gap-3 p-3 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors group"
            >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Cloud size={20} />
                </div>
                <div className="text-left">
                    <span className="block font-bold">手動同步</span>
                    <span className="text-[10px] text-stone-400">立即上傳至 Google Drive</span>
                </div>
            </button>

            <p className="text-xs font-bold text-stone-400 px-2 mt-4 mb-2 uppercase">本地備份</p>
            <button 
                onClick={onExport}
                className="w-full flex items-center gap-3 p-3 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors group"
            >
                <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                    <Save size={20} />
                </div>
                <div className="text-left">
                    <span className="block font-bold">匯出 JSON</span>
                    <span className="text-[10px] text-stone-400">下載到手機/電腦</span>
                </div>
            </button>
            <button 
                onClick={onImport}
                className="w-full flex items-center gap-3 p-3 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors group"
            >
                <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                    <FileJson size={20} />
                </div>
                <div className="text-left">
                    <span className="block font-bold">匯入 JSON</span>
                    <span className="text-[10px] text-stone-400">讀取備份檔案</span>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
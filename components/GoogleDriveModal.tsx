import React, { useState, useEffect } from 'react';
import { X, Cloud, Lock, Loader2, AlertCircle, Globe, Copy } from 'lucide-react';
import { initGoogleDrive, signInToGoogle } from '../services/googleDriveService';

interface GoogleDriveModalProps {
  onClose: () => void;
  currentData: any;
  onDataLoaded: (data: any) => void;
}

const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ onClose, currentData, onDataLoaded }) => {
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | 'info', msg: string} | null>(null);
  
  // Get current origin for display
  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const savedClientId = localStorage.getItem('gdrive_client_id');
    const savedApiKey = localStorage.getItem('gdrive_api_key');
    if (savedClientId && savedApiKey) {
      setClientId(savedClientId);
      setApiKey(savedApiKey);
    }
  }, []);

  const handleInit = async () => {
    if (!clientId || !apiKey) {
      setStatus({ type: 'error', msg: '請輸入 Client ID 和 API Key' });
      return;
    }
    
    setLoading(true);
    try {
      localStorage.setItem('gdrive_client_id', clientId);
      localStorage.setItem('gdrive_api_key', apiKey);
      
      await initGoogleDrive({ clientId, apiKey });
      await signInToGoogle();
      
      setStatus({ type: 'success', msg: '連接成功！' });
      // Proceed to next step in App
      setTimeout(() => {
        onDataLoaded(true);
      }, 800);
    } catch (error: any) {
      console.error(error);
      let errMsg = '登入失敗，請檢查 API 設定或網域授權';
      
      if (error?.message === 'origin_mismatch') {
          errMsg = '網域未授權：請檢查上方的網址是否已加入 Google Console';
      }

      setStatus({ type: 'error', msg: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const copyOrigin = () => {
    navigator.clipboard.writeText(originUrl);
    setStatus({ type: 'info', msg: '網址已複製！' });
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Cloud size={20} />
            <h3 className="font-bold">Google Drive 設定</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors opacity-50 cursor-not-allowed">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Origin URL Display - CRITICAL FOR USER */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <Globe size={14} />
                  <span>重要：授權網域設定</span>
              </div>
              <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                  請將下方網址複製，並貼入 Google Cloud Console 的 <br/>
                  <strong>"Authorized JavaScript origins"</strong> 欄位中，否則會出現 API Error。
              </p>
              <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-amber-200 p-2 rounded text-[10px] sm:text-xs font-mono text-stone-600 break-all select-all">
                      {originUrl}
                  </code>
                  <button 
                      onClick={copyOrigin}
                      className="p-2 bg-white border border-amber-200 rounded hover:bg-amber-100 text-amber-700 transition-colors flex-shrink-0"
                      title="複製網址"
                  >
                      <Copy size={16} />
                  </button>
              </div>
          </div>

          <div className="space-y-4">
            {status && (
                <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                {status.type === 'error' ? <AlertCircle size={16} className="mt-0.5" /> : 
                <Loader2 size={16} className="mt-0.5 animate-spin" />}
                <span>{status.msg}</span>
                </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">Client ID</label>
              <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3 text-stone-400" />
                  <input 
                  type="text" 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full pl-9 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="xxx.apps.googleusercontent.com"
                  />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">API Key</label>
              <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3 text-stone-400" />
                  <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-9 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="AIzaSy..."
                  />
              </div>
            </div>

            <button 
              onClick={handleInit}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : '連接並驗證'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveModal;
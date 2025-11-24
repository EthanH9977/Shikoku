import React from 'react';
import { X, Copy } from 'lucide-react';
import { ItineraryItem } from '../types';

interface InfoModalProps {
  item: ItineraryItem | null;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-shikoku-indigo p-4 flex justify-between items-center text-white">
          <h3 className="font-bold truncate pr-4">{item.title} - 詳細資訊</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {item.details?.map((detail, idx) => (
            <div key={idx} className="border-b border-stone-100 last:border-0 pb-4 last:pb-0">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
                {detail.title}
              </h4>
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 flex justify-between items-start group">
                 <p className="text-stone-800 font-mono text-sm whitespace-pre-wrap break-all">
                   {detail.content}
                 </p>
                 <button 
                  onClick={() => navigator.clipboard.writeText(detail.content)}
                  className="text-stone-400 hover:text-shikoku-wood ml-2"
                 >
                   <Copy size={16} />
                 </button>
              </div>
              {detail.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border border-stone-200">
                  <img src={detail.imageUrl} alt={detail.title} className="w-full h-auto object-cover" />
                </div>
              )}
            </div>
          ))}

          {(!item.details || item.details.length === 0) && (
            <p className="text-stone-500 text-center py-4">沒有更多詳細資訊。</p>
          )}
        </div>
        
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-stone-300 text-stone-700 font-medium rounded-lg hover:bg-stone-100 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
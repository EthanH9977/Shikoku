import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { ItineraryItem, EventType } from '../types';

interface EditModalProps {
  item: ItineraryItem | null;
  isNew?: boolean;
  onClose: () => void;
  onSave: (updatedItem: ItineraryItem) => void;
  onDelete: (itemId: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({ item, isNew = false, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<ItineraryItem | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!item || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      // Basic validation
      if (!formData.title.trim()) {
        alert("請輸入標題");
        return;
      }
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full sm:max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border-b border-stone-100 p-4 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-lg text-stone-800">
            {isNew ? '新增行程' : '編輯行程'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">開始時間 <span className="text-red-500">*</span></label>
              <input
                type="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-shikoku-indigo focus:border-shikoku-indigo focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">結束時間 (選填)</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime || ''}
                onChange={handleChange}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-shikoku-indigo focus:border-shikoku-indigo focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">標題 <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              required
              placeholder="例如：參觀栗林公園"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-shikoku-indigo focus:border-shikoku-indigo focus:outline-none transition-all font-bold text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">類型</label>
            <div className="relative">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-shikoku-indigo focus:border-shikoku-indigo focus:outline-none transition-all appearance-none"
              >
                {Object.values(EventType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">地點名稱</label>
            <input
              type="text"
              name="locationName"
              placeholder="例如：高松市區"
              value={formData.locationName}
              onChange={handleChange}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-shikoku-indigo focus:border-shikoku-indigo focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">描述與備註</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="輸入詳細的行程說明..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-shikoku-indigo focus:border-shikoku-indigo focus:outline-none transition-all resize-none"
            />
          </div>

        </form>

        <div className="p-4 border-t border-stone-100 bg-stone-50 flex gap-3">
          {!isNew && (
            <button
              type="button"
              onClick={() => onDelete(formData.id)}
              className="px-4 py-3 bg-white border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center"
            >
              <Trash2 size={20} />
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-shikoku-indigo text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-800 transition-all flex items-center justify-center"
          >
            <Save size={18} className="mr-2" />
            {isNew ? '新增行程' : '儲存變更'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
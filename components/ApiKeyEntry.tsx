
import React, { useState } from 'react';

interface ApiKeyEntryProps {
  initialKeys: string[];
  onApiKeysSubmit: (apiKeys: string[]) => void;
  onCancel?: () => void;
}

const ApiKeyEntry: React.FC<ApiKeyEntryProps> = ({ initialKeys, onApiKeysSubmit, onCancel }) => {
  const [keys, setKeys] = useState(initialKeys.join('\n'));
  const canCancel = !!onCancel;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyArray = keys.split('\n').map(k => k.trim()).filter(k => k);
    if (keyArray.length > 0) {
      onApiKeysSubmit(keyArray);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          {canCancel ? 'Quản Lý Khóa API' : 'Yêu Cầu Khóa API'}
        </h1>
        <p className="text-slate-400 text-center mb-6">
          Dán một hoặc nhiều khóa API của Google Gemini vào ô bên dưới, mỗi khóa trên một dòng. Ứng dụng sẽ tự động xoay vòng giữa các khóa.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="api-keys" className="block text-lg font-medium text-slate-300 mb-2">
              Danh Sách Khóa API Gemini
            </label>
            <textarea
              id="api-keys"
              value={keys}
              onChange={(e) => setKeys(e.target.value)}
              placeholder="Dán các khóa API của bạn vào đây, mỗi khóa một dòng..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 resize-y"
              required
              rows={4}
            />
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-blue-400 hover:text-blue-300 hover:underline"
          >
            Làm thế nào để lấy khóa API?
          </a>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-1/3 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              disabled={!keys.trim()}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg text-xl"
            >
              {canCancel ? 'Cập Nhật' : 'Lưu và Bắt Đầu'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes animate-fade-in {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: animate-fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ApiKeyEntry;

import React from 'react';
import { Icons } from '../../constants';

interface KitTableProps {
  kits: { category: string; appName: string; devUrl: string }[];
  onCopy: (url: string) => void;
  onDelete: (index: number) => void;
  t: any;
}

export const KitTable: React.FC<KitTableProps> = ({ kits, onCopy, onDelete, t }) => {
  if (kits.length === 0) return null;

  return (
    <div className="mt-6 overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.labelCategory}</th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.labelName}</th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL Dev</th>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {kits.map((kit, index) => (
            <tr key={index} className="hover:bg-slate-50 transition-colors group">
              <td className="px-4 py-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {kit.category}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-slate-700">{kit.appName}</td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <code className="text-[10px] font-mono text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                    {kit.devUrl}
                  </code>
                  <button 
                    onClick={() => onCopy(kit.devUrl)}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    title={t.copy}
                  >
                    <Icons.Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <button 
                  onClick={() => onDelete(index)}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title={t.delete}
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

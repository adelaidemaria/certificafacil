
import React, { useState } from 'react';
import { Theme } from '../types';
import { Palette, Plus, Trash2, Edit2, CheckCircle2, Save } from 'lucide-react';

interface Props {
  themes: Theme[];
  onUpdateThemes: (themes: Theme[]) => void;
}

const DesignSettings: React.FC<Props> = ({ themes, onUpdateThemes }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState<Theme>({
    id: '',
    name: '',
    primary: '#0f172a',
    accent: '#e67e00',
    ribbon: '#f59e0b'
  });

  const resetForm = () => {
    setForm({ id: '', name: '', primary: '#0f172a', accent: '#e67e00', ribbon: '#f59e0b' });
    setEditingId(null);
  };

  const handleEdit = (theme: Theme) => {
    setForm(theme);
    setEditingId(theme.id);
  };

  const handleDelete = (id: string) => {
    if (themes.length <= 1) {
      alert("Você deve ter pelo menos um tema cadastrado.");
      return;
    }
    if (confirm("Deseja excluir este tema? Cursos que o utilizam voltarão para o tema padrão.")) {
      onUpdateThemes(themes.filter(t => t.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newThemes: Theme[];
    if (editingId) {
      newThemes = themes.map(t => t.id === editingId ? form : t);
    } else {
      const newTheme = { ...form, id: Math.random().toString(36).substr(2, 9) };
      newThemes = [...themes, newTheme];
    }
    onUpdateThemes(newThemes);
    resetForm();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showSuccess && (
        <div className="fixed top-10 right-10 z-[100] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 duration-300">
          <CheckCircle2 size={24} />
          <span className="font-black uppercase tracking-widest text-sm">Design salvo com sucesso!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Palette className="text-blue-600" size={24} />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {editingId ? 'Editar Tema' : 'Novo Design'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Tema</label>
              <input 
                type="text" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold"
                placeholder="Ex: Tema Black & Gold"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cor Primária (Bordas)</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={form.primary}
                    onChange={e => setForm({...form, primary: e.target.value})}
                    className="h-12 w-20 rounded-xl cursor-pointer bg-white border border-slate-200 p-1"
                  />
                  <input 
                    type="text" 
                    value={form.primary}
                    onChange={e => setForm({...form, primary: e.target.value})}
                    className="flex-1 px-4 rounded-xl border border-slate-200 font-mono text-sm uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cor de Destaque (Título)</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={form.accent}
                    onChange={e => setForm({...form, accent: e.target.value})}
                    className="h-12 w-20 rounded-xl cursor-pointer bg-white border border-slate-200 p-1"
                  />
                  <input 
                    type="text" 
                    value={form.accent}
                    onChange={e => setForm({...form, accent: e.target.value})}
                    className="flex-1 px-4 rounded-xl border border-slate-200 font-mono text-sm uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cor do Selo / Fita</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={form.ribbon}
                    onChange={e => setForm({...form, ribbon: e.target.value})}
                    className="h-12 w-20 rounded-xl cursor-pointer bg-white border border-slate-200 p-1"
                  />
                  <input 
                    type="text" 
                    value={form.ribbon}
                    onChange={e => setForm({...form, ribbon: e.target.value})}
                    className="flex-1 px-4 rounded-xl border border-slate-200 font-mono text-sm uppercase font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="submit" 
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition"
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? 'Atualizar' : 'Criar Tema'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-6 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Listagem */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight px-4">Temas Disponíveis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map(theme => (
              <div key={theme.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 group hover:border-blue-200 transition-all flex flex-col justify-between h-48">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-slate-800 uppercase tracking-tighter truncate">{theme.name}</h4>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(theme)} className="p-2 text-slate-400 hover:text-blue-600 transition"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(theme.id)} className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-xl shadow-inner border border-slate-100" style={{ backgroundColor: theme.primary }} title="Primária"></div>
                      <span className="text-[8px] font-black text-slate-300 uppercase">Primária</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-xl shadow-inner border border-slate-100" style={{ backgroundColor: theme.accent }} title="Destaque"></div>
                      <span className="text-[8px] font-black text-slate-300 uppercase">Destaque</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-12 h-12 rounded-xl shadow-inner border border-slate-100" style={{ backgroundColor: theme.ribbon }} title="Selo/Fita"></div>
                      <span className="text-[8px] font-black text-slate-300 uppercase">Selo/Fita</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner">
                    <div className="h-full" style={{ width: '40%', backgroundColor: theme.primary }}></div>
                    <div className="h-full" style={{ width: '40%', backgroundColor: theme.accent }}></div>
                    <div className="h-full" style={{ width: '20%', backgroundColor: theme.ribbon }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSettings;

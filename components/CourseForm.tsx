
import React, { useState, useEffect } from 'react';
import { Course, Theme } from '../types';
import { X } from 'lucide-react';

interface Props {
  themes: Theme[];
  onAddCourse: (course: Course) => void;
  editingCourse?: Course | null;
  onCancel?: () => void;
  instructorName: string;
}

const CourseForm: React.FC<Props> = ({ themes, onAddCourse, editingCourse, onCancel, instructorName }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [themeId, setThemeId] = useState('');
  const [syllabusText, setSyllabusText] = useState('');

  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name);
      setDescription(editingCourse.description);
      setDuration(editingCourse.duration);
      setThemeId(editingCourse.themeId || (themes.length > 0 ? themes[0].id : ''));
      setSyllabusText(editingCourse.syllabus.join('\n'));
    } else {
      setName('');
      setDescription('');
      setDuration('');
      setThemeId(themes.length > 0 ? themes[0].id : '');
      setSyllabusText('');
    }
  }, [editingCourse, themes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !duration) return;

    const syllabus = syllabusText.split('\n').filter(line => line.trim() !== '');

    onAddCourse({
      id: editingCourse ? editingCourse.id : Math.random().toString(36).substr(2, 9),
      name: name.toUpperCase(),
      description,
      duration: duration.toUpperCase(),
      instructor: instructorName, 
      themeId: themeId || (themes.length > 0 ? themes[0].id : ''),
      syllabus
    });

    if (!editingCourse) {
      setName('');
      setDescription('');
      setDuration('');
      setSyllabusText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4 relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
          {editingCourse ? 'Editar Curso' : 'Cadastrar Curso'}
        </h3>
        {editingCourse && onCancel && (
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        )}
      </div>
      
      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Curso</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold"
          placeholder="Ex: INFORMÁTICA BÁSICA"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição Curta / Carga</label>
        <textarea 
          value={duration} 
          onChange={(e) => setDuration(e.target.value)}
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold h-24 text-sm leading-relaxed"
          placeholder="Ex: 80 HORAS, DO BÁSICO AO AVANÇADO..."
          required
        />
        <p className="text-[10px] text-slate-400 mt-1 font-bold italic">Texto que aparecerá no certificado.</p>
      </div>

      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Layout Visual</label>
        <select 
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold bg-white"
          required
        >
          {themes.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Conteúdo Programático</label>
        <textarea 
          value={syllabusText}
          onChange={(e) => setSyllabusText(e.target.value)}
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 h-32 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold"
          placeholder="Uma linha por item..."
          required
        />
      </div>

      <button 
        type="submit" 
        className={`w-full ${editingCourse ? 'bg-indigo-600' : 'bg-blue-600'} text-white font-black py-4 rounded-2xl transition shadow-lg shadow-blue-100 uppercase tracking-widest`}
      >
        {editingCourse ? 'Salvar Alterações' : 'Cadastrar Curso'}
      </button>
    </form>
  );
};

export default CourseForm;

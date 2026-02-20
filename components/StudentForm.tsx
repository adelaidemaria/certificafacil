
import React, { useState, useEffect } from 'react';
import { Student, Course } from '../types';
import { X, Edit2, PlusCircle, Calendar } from 'lucide-react';

interface Props {
  courses: Course[];
  onAddStudent: (student: Partial<Student>) => void;
  editingStudent?: Student | null;
  onCancel?: () => void;
}

const StudentForm: React.FC<Props> = ({ courses, onAddStudent, editingStudent, onCancel }) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [courseId, setCourseId] = useState('');
  const [completionDate, setCompletionDate] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setCpf(editingStudent.cpf);
      setCourseId(editingStudent.courseId);
      // Convert DD/MM/YYYY back to YYYY-MM-DD for the input if needed, 
      // but if we store as ISO it's easier. Let's assume storage is YYYY-MM-DD for internal consistency.
      setCompletionDate(editingStudent.completionDate || '');
    } else {
      setName('');
      setCpf('');
      setCourseId('');
      // Set default date to today in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      setCompletionDate(today);
    }
  }, [editingStudent]);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cpf || !courseId || !completionDate) return;

    onAddStudent({
      id: editingStudent ? editingStudent.id : Math.random().toString(36).substr(2, 9),
      name: name.toUpperCase(),
      cpf,
      courseId,
      completionDate,
    });

    if (!editingStudent) {
      setName('');
      setCpf('');
      setCourseId('');
      const today = new Date().toISOString().split('T')[0];
      setCompletionDate(today);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5 relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-black text-slate-800">
          {editingStudent ? 'Editar Cadastro' : 'Cadastrar Aluno'}
        </h3>
        {editingStudent && onCancel && (
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        )}
      </div>
      
      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold"
          placeholder="Nome do Aluno"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CPF</label>
        <input 
          type="text" 
          value={cpf} 
          onChange={handleCpfChange}
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold"
          placeholder="000.000.000-00"
          maxLength={14}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Curso Concluído</label>
        <select 
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold bg-white"
          required
        >
          <option value="">Selecione o curso...</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data de Conclusão</label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="date" 
            value={completionDate} 
            onChange={(e) => setCompletionDate(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold"
            required
          />
        </div>
      </div>

      <button 
        type="submit" 
        className={`w-full ${editingStudent ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black py-4 rounded-2xl transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2`}
      >
        {editingStudent ? <Edit2 size={18} /> : <PlusCircle size={18} />}
        {editingStudent ? 'Atualizar Aluno' : 'Cadastrar Aluno'}
      </button>
    </form>
  );
};

export default StudentForm;

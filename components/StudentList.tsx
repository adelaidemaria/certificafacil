
import React, { useState, useMemo } from 'react';
import { Trash2, Edit2, Search, CheckCircle, Clock } from 'lucide-react';
import { Student, Course } from '../types';

interface Props {
  students: Student[];
  courses: Course[];
  onDelete: (id: string) => void;
  onEdit: (student: Student) => void;
}

const StudentList: React.FC<Props> = ({ students, courses, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || 'CURSO REMOVIDO';

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.cpf.includes(searchTerm) ||
      getCourseName(s.courseId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm, courses]);

  if (students.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="text-slate-300" size={32} />
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sem alunos cadastrados.</p>
        <p className="text-xs text-slate-400 mt-2">Cadastre o primeiro aluno ao lado para gerenciar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Pesquisar por aluno, CPF ou curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm font-medium transition-all"
        />
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden min-w-0">
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno / CPF</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Curso</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 min-w-0">
                      <div className="font-black text-slate-800 text-base uppercase truncate max-w-[200px]" title={student.name}>{student.name}</div>
                      <div className="text-xs font-bold text-slate-400 tracking-tight">{student.cpf}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-600 uppercase truncate max-w-[150px]" title={getCourseName(student.courseId)}>
                        {getCourseName(student.courseId)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {student.status === 'EMITIDO' ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle size={14} />
                          <span className="text-[9px] font-black uppercase tracking-tight">{student.issuedAt}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <Clock size={14} />
                          <span className="text-[9px] font-black uppercase tracking-tight">Pendente</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onEdit(student)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition shadow-sm border border-slate-100"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(student.id)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition shadow-sm border border-slate-100"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                      Nenhum aluno encontrado para "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;

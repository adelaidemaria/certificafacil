
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle, Users, GraduationCap, LayoutDashboard, Download, Trash2, Printer, Search, Edit2, FileCheck, CheckCircle, Award, Menu, X as CloseIcon, ShieldCheck, QrCode, SearchCheck, ExternalLink, Settings as SettingsIcon, Palette, Loader2, WifiOff, Lock } from 'lucide-react';
import { Course, Student, SchoolSettings, Theme } from './types';
import CourseForm from './components/CourseForm';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import CertificateView from './components/CertificateView';
import SettingsForm from './components/SettingsForm';
import DesignSettings from './components/DesignSettings';
import Login from './components/Login';
import {
  fetchCourses, createCourse, updateCourse, deleteCourse,
  fetchStudents, createStudent, updateStudent, deleteStudent, findStudentByVerificationCode,
  fetchSettings, saveSettings, upsertThemes, deleteTheme,
} from './lib/db';

const DEFAULT_THEMES: Theme[] = [
  {
    id: 'blue-gold',
    name: 'Azul & Dourado (Padrão)',
    primary: '#0f172a',
    accent: '#e67e00',
    ribbon: '#f59e0b'
  },
  {
    id: 'green-gold',
    name: 'Verde & Dourado (Excel)',
    primary: '#064e3b',
    accent: '#c49a00',
    ribbon: '#84cc16'
  },
  {
    id: 'office-blue',
    name: 'Azul Marinho (Office)',
    primary: '#1e3a8a',
    accent: '#3b82f6',
    ribbon: '#2563eb'
  }
];

const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'MELO & MELO CURSOS E TREINAMENTOS',
  cnpj: '21.658.460/0001-81',
  showCnpj: true,
  instructorName: 'LOURIVAL G. MELO',
  instructorCpf: '000.000.000-00',
  showInstructorCpf: false,
  instructorTitle: 'Diretor & Instrutor Chefe',
  themes: DEFAULT_THEMES
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'students' | 'emit' | 'verify' | 'settings' | 'design'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SETTINGS);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [selectedStudentForCert, setSelectedStudentForCert] = useState<{ student: Student, course: Course } | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Verification states
  const [verifyInput, setVerifyInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ student: Student, course: Course } | null>(null);
  const [verificationError, setVerificationError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // ========================
  // Carregar dados do Supabase
  // ========================
  const loadData = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    try {
      const [loadedCourses, loadedStudents, loadedSettings] = await Promise.all([
        fetchCourses(),
        fetchStudents(),
        fetchSettings(),
      ]);
      setCourses(loadedCourses);
      setStudents(loadedStudents);
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setDbError('Não foi possível conectar ao banco de dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle URL verification automatically on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('verify');
    if (code) {
      setVerifyInput(code);
      handleCheckVerification(code);
      setActiveTab('verify');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ========================
  // Cursos
  // ========================
  const handleAddOrUpdateCourse = async (course: Course) => {
    setSaving(true);
    try {
      if (editingCourse) {
        const updated = await updateCourse(course);
        setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
        setEditingCourse(null);
      } else {
        const { id, ...rest } = course;
        const created = await createCourse(rest);
        setCourses(prev => [...prev, created]);
      }
    } catch (err: any) {
      console.error('Erro ao salvar curso:', err);
      alert('Erro ao salvar o curso. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Deseja excluir este curso? Alunos vinculados serão removidos.')) return;
    setSaving(true);
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      setStudents(prev => prev.filter(s => s.courseId !== id));
    } catch (err: any) {
      console.error('Erro ao excluir curso:', err);
      alert('Erro ao excluir o curso. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // ========================
  // Alunos
  // ========================
  const handleAddOrUpdateStudent = async (studentData: any) => {
    setSaving(true);
    try {
      if (editingStudent) {
        const updated = await updateStudent({ ...editingStudent, ...studentData });
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        setEditingStudent(null);
      } else {
        const newStudentData: Omit<Student, 'id'> = {
          ...studentData,
          status: 'PENDENTE',
          registrationDate: new Date().toLocaleDateString('pt-BR')
        };
        const created = await createStudent(newStudentData);
        setStudents(prev => [...prev, created]);
      }
    } catch (err: any) {
      console.error('Erro ao salvar aluno:', err);
      alert('Erro ao salvar o aluno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Deseja excluir este aluno?')) return;
    setSaving(true);
    try {
      await deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      console.error('Erro ao excluir aluno:', err);
      alert('Erro ao excluir o aluno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // ========================
  // Certificados
  // ========================
  const generateVerificationCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateCertificate = async (student: Student) => {
    const course = courses.find(c => c.id === student.courseId);
    if (!course) return;

    const now = new Date().toLocaleDateString('pt-BR');
    const verificationCode = student.verificationCode || generateVerificationCode();

    const updatedStudent: Student = {
      ...student,
      status: 'EMITIDO',
      issuedAt: now,
      verificationCode,
    };

    setSaving(true);
    try {
      const saved = await updateStudent(updatedStudent);
      setStudents(prev => prev.map(s => s.id === saved.id ? saved : s));
      setSelectedStudentForCert({ student: saved, course });
    } catch (err: any) {
      console.error('Erro ao emitir certificado:', err);
      alert('Erro ao emitir o certificado. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckVerification = async (code?: string) => {
    const codeToSearch = (code || verifyInput).trim().toUpperCase();
    if (!codeToSearch) return;

    setVerifying(true);
    setVerificationResult(null);
    setVerificationError(false);

    try {
      const student = await findStudentByVerificationCode(codeToSearch);
      if (student) {
        const course = courses.find(c => c.id === student.courseId);
        // Se cursos ainda não carregaram, buscar novamente
        if (course) {
          setVerificationResult({ student, course });
        } else {
          // Tentar buscar o curso da lista atualizada
          const allCourses = await fetchCourses();
          const foundCourse = allCourses.find(c => c.id === student.courseId);
          if (foundCourse) {
            setCourses(allCourses);
            setVerificationResult({ student, course: foundCourse });
          } else {
            setVerificationError(true);
          }
        }
      } else {
        setVerificationError(true);
      }
    } catch (err: any) {
      console.error('Erro ao verificar certificado:', err);
      setVerificationError(true);
    } finally {
      setVerifying(false);
    }
  };

  // ========================
  // Configurações
  // ========================
  const handleSaveSettings = async (newSettings: SchoolSettings) => {
    setSaving(true);
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      alert('Erro ao salvar as configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateThemes = async (themes: Theme[]) => {
    setSaving(true);
    try {
      // Detectar temas removidos
      const currentThemeIds = new Set(themes.map(t => t.id));
      const removedIds = settings.themes
        .filter(t => !currentThemeIds.has(t.id))
        .map(t => t.id);

      await upsertThemes(themes);
      for (const id of removedIds) {
        await deleteTheme(id);
      }
      setSettings(prev => ({ ...prev, themes }));
    } catch (err: any) {
      console.error('Erro ao atualizar temas:', err);
      alert('Erro ao salvar os temas. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // ========================
  // Computed
  // ========================
  const filteredStudentsForEmit = useMemo(() => {
    return students.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cpf.includes(searchTerm) ||
      courses.find(c => c.id === s.courseId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm, courses]);

  const courseStats = useMemo(() => {
    return courses.map(course => {
      const count = students.filter(s => s.courseId === course.id && s.status === 'EMITIDO').length;
      return {
        id: course.id,
        name: course.name,
        count
      };
    }).sort((a, b) => b.count - a.count);
  }, [courses, students]);

  const navTo = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    if (tab !== 'verify') {
      setVerificationResult(null);
      setVerificationError(false);
      setVerifyInput('');
    }
  };

  // ========================
  // Loading / Error states
  // ========================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/50">
          <GraduationCap className="text-white" size={48} />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">CertificaFacil</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Conectando ao banco de dados...</p>
        </div>
        <Loader2 className="text-blue-500 animate-spin" size={32} />
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6 p-8">
        <div className="p-4 bg-red-900/50 rounded-2xl border border-red-700">
          <WifiOff className="text-red-400" size={48} />
        </div>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-black text-white">Erro de Conexão</h1>
          <p className="text-slate-400 mt-2 text-sm">{dbError}</p>
        </div>
        <button
          onClick={loadData}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!isAuthenticated && activeTab !== 'verify') {
    return (
      <Login
        onLoginSuccess={() => setIsAuthenticated(true)}
        onAccessVerify={() => navTo('verify')}
      />
    );
  }

  if (selectedStudentForCert) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <nav className="bg-white shadow p-4 mb-4 no-print flex justify-between items-center sticky top-0 z-50">
          <button
            onClick={() => setSelectedStudentForCert(null)}
            className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
          >
            ← Voltar para o Sistema
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-bold text-sm md:text-base shadow-lg shadow-blue-100"
            >
              <Printer size={18} /> Imprimir / PDF
            </button>
          </div>
        </nav>
        <div className="flex flex-col items-center gap-8 p-4">
          <CertificateView
            student={selectedStudentForCert.student}
            course={selectedStudentForCert.course}
            settings={settings}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative overflow-x-hidden">

      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-4 right-4 z-[100] bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <Loader2 size={16} className="animate-spin" />
          Salvando...
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span className="font-black tracking-tighter text-lg">CertificaFacil</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-white transition">
          {sidebarOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen bg-slate-900 text-white p-6 shrink-0 z-50 shadow-2xl transition-transform duration-300 md:translate-x-0 w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="hidden md:flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40">
            <GraduationCap className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter">CertificaFacil</h1>
        </div>

        {/* DB Status indicator */}
        <div className="hidden md:flex items-center gap-2 mb-6 px-3 py-2 bg-emerald-900/30 border border-emerald-700/40 rounded-xl">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Banco Conectado</span>
        </div>

        <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
          <button
            onClick={() => navTo('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> <span className="font-semibold">Painel Inicial</span>
          </button>
          <button
            onClick={() => navTo('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'courses' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <PlusCircle size={20} /> <span className="font-semibold">Cursos</span>
          </button>
          <button
            onClick={() => navTo('students')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Users size={20} /> <span className="font-semibold">Alunos</span>
          </button>

          <div className="pt-6 mt-6 border-t border-slate-800 space-y-1.5">
            <button
              onClick={() => navTo('emit')}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${activeTab === 'emit' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30' : 'text-amber-500/70 hover:bg-slate-800 hover:text-amber-500'}`}
            >
              <FileCheck size={22} /> <span className="font-bold uppercase tracking-wider text-sm">Gerar Certificado</span>
            </button>
            <a
              href="/verificar"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <ShieldCheck size={20} /> <span className="font-semibold">Validar Público</span>
            </a>
            <button
              onClick={() => navTo('design')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'design' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Palette size={20} /> <span className="font-semibold">Design do Certificado</span>
            </button>
            <button
              onClick={() => navTo('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-slate-100/10 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <SettingsIcon size={20} /> <span className="font-semibold">Configurações</span>
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-red-500/80 hover:bg-red-500/10 hover:text-red-400 mt-2"
            >
              <Lock size={20} /> <span className="font-semibold">Sair do Sistema</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto w-full">

          {activeTab === 'dashboard' && (
            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Painel Administrativo</h2>
                <p className="text-slate-500 mt-2 text-lg">Gerencie sua escola e emita certificados em segundos.</p>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition group">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <GraduationCap size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cursos Ativos</p>
                    <p className="text-3xl font-black text-slate-800">{courses.length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition group">
                  <div className="p-4 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <Users size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alunos Registrados</p>
                    <p className="text-3xl font-black text-slate-800">{students.length}</p>
                  </div>
                </div>
                <div
                  className="bg-amber-600 p-6 md:p-8 rounded-[32px] shadow-lg shadow-amber-100 flex items-center gap-5 cursor-pointer hover:bg-amber-700 transition transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
                  onClick={() => setActiveTab('emit')}
                >
                  <div className="p-4 bg-white/20 rounded-2xl text-white">
                    <FileCheck size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Acesso Rápido</p>
                    <p className="text-xl font-black text-white leading-tight">Emitir Agora</p>
                  </div>
                </div>
              </div>

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="text-amber-500" size={24} />
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Estatísticas de Emissão</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {courseStats.map(stat => (
                    <div key={stat.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 transition-colors flex justify-between items-center group min-w-0">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="text-sm font-black text-slate-800 uppercase truncate leading-tight group-hover:text-blue-600 transition-colors">
                          {stat.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Total Certificados Emitidos</p>
                      </div>
                      <div className="flex shrink-0 items-center justify-center bg-amber-50 text-amber-700 w-12 h-12 rounded-full font-black text-xl shadow-inner border border-amber-100">
                        {stat.count}
                      </div>
                    </div>
                  ))}
                  {courseStats.length === 0 && (
                    <div className="col-span-full py-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold uppercase text-xs tracking-widest">
                      Sem dados de cursos para exibir.
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                <div className="w-full lg:w-[380px] shrink-0">
                  <CourseForm
                    themes={settings.themes}
                    onAddCourse={handleAddOrUpdateCourse}
                    editingCourse={editingCourse}
                    onCancel={() => setEditingCourse(null)}
                    instructorName={settings.instructorName}
                  />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="text-2xl font-black mb-6 text-slate-800">Cursos Registrados</h3>
                  <div className="space-y-4">
                    {courses.map(course => (
                      <div key={course.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-blue-200 transition-all">
                        <div className="min-w-0 flex-1 w-full">
                          <h4 className="font-black text-lg text-slate-800 uppercase truncate mb-1 group-hover:text-blue-600 transition-colors" title={course.name}>{course.name}</h4>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-tight line-clamp-2 overflow-hidden" title={course.duration}>
                              {course.duration}
                            </p>
                            <p className="text-[11px] font-bold text-slate-300 uppercase">Prof: {course.instructor}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => setEditingCourse(course)}
                            className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition shadow-sm border border-slate-100"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition shadow-sm border border-slate-100"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <div className="py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold uppercase text-xs tracking-widest">
                        Nenhum curso cadastrado ainda.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                <div className="w-full lg:w-[380px] shrink-0">
                  <StudentForm
                    courses={courses}
                    onAddStudent={handleAddOrUpdateStudent}
                    editingStudent={editingStudent}
                    onCancel={() => setEditingStudent(null)}
                  />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <StudentList
                    students={students}
                    courses={courses}
                    onDelete={handleDeleteStudent}
                    onEdit={(s) => setEditingStudent(s)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-8">
              <header>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Design do Certificado</h2>
                <p className="text-slate-500 mt-2 text-lg">Crie e personalize as paletas de cores que serão usadas nos seus cursos.</p>
              </header>
              <DesignSettings
                themes={settings.themes}
                onUpdateThemes={handleUpdateThemes}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <header>
                <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Configurações</h2>
                <p className="text-slate-500 mt-2 text-lg">Configure os dados que serão impressos em todos os seus certificados.</p>
              </header>
              <SettingsForm settings={settings} onSave={handleSaveSettings} />
            </div>
          )}

          {activeTab === 'emit' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
                <div className="min-w-0">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Gerar Certificado</h2>
                  <p className="text-slate-500 mt-2 text-lg">Busque o aluno para emitir o documento.</p>
                </div>

                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                  <input
                    type="text"
                    placeholder="Nome, CPF ou curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 shadow-sm text-lg font-medium"
                  />
                </div>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredStudentsForEmit.map(student => {
                  const course = courses.find(c => c.id === student.courseId);
                  const isIssued = student.status === 'EMITIDO';
                  return (
                    <div key={student.id} className="bg-white p-7 rounded-[40px] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group min-w-0">
                      <div className="min-w-0">
                        <div className="flex justify-between items-start mb-6">
                          <div className={`p-3 rounded-2xl shrink-0 ${isIssued ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            {isIssued ? <CheckCircle size={24} /> : <FileCheck size={24} />}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap ml-2 ${isIssued ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                            {isIssued ? `EMITIDO` : 'PENDENTE'}
                          </span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase truncate" title={student.name}>{student.name}</h3>
                        <p className="text-slate-400 font-bold text-sm mb-6">CPF: {student.cpf}</p>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2 min-w-0">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Conclusão</p>
                          <p className="text-base font-black text-slate-700 uppercase truncate" title={course?.name}>{course?.name || 'CURSO REMOVIDO'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleGenerateCertificate(student)}
                        disabled={!course || saving}
                        className={`mt-6 w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-lg ${!course ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : isIssued ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200' : 'bg-[#e67e00] text-white hover:bg-[#cf7100] shadow-amber-200'}`}
                      >
                        {saving ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                        {isIssued ? 'REEMITIR' : 'GERAR'}
                      </button>
                    </div>
                  );
                })}
                {filteredStudentsForEmit.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold uppercase text-xs tracking-widest">
                    {students.length === 0 ? 'Nenhum aluno cadastrado.' : 'Nenhum aluno encontrado com este filtro.'}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
export default App;

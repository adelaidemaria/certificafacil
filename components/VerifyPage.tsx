import React, { useState, useEffect } from 'react';
import { ShieldCheck, SearchCheck, CheckCircle, X as CloseIcon, Loader2 } from 'lucide-react';
import { findStudentByVerificationCode, fetchCourses } from '../lib/db';
import { Student, Course } from '../types';

const VerifyPage: React.FC = () => {
    const [verifyInput, setVerifyInput] = useState('');
    const [verificationResult, setVerificationResult] = useState<{ student: Student, course: Course } | null>(null);
    const [verificationError, setVerificationError] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // Auto-verify se houver query param na URL (?verify=CODE)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('verify');
        if (code) {
            setVerifyInput(code);
            handleCheckVerification(code);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleCheckVerification = async (code?: string) => {
        const codeToSearch = (code || verifyInput).trim().toUpperCase();
        if (!codeToSearch) return;

        setVerifying(true);
        setVerificationResult(null);
        setVerificationError(false);

        try {
            const student = await findStudentByVerificationCode(codeToSearch);
            if (student) {
                const allCourses = await fetchCourses();
                const course = allCourses.find(c => c.id === student.courseId);

                if (course) {
                    setVerificationResult({ student, course });
                } else {
                    setVerificationError(true);
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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="text-center">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl w-fit mx-auto mb-6 shadow-sm border border-emerald-100">
                        <ShieldCheck size={48} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Portal de Veracidade</h1>
                    <p className="text-slate-500 mt-3 text-lg">Confirme a autenticidade de um certificado emitido por nossa instituição.</p>
                </header>

                <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Código de Controle (8 dígitos)</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <SearchCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                    <input
                                        type="text"
                                        value={verifyInput}
                                        onChange={(e) => setVerifyInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCheckVerification()}
                                        placeholder="Ex: AB12CD34"
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-black text-xl tracking-widest uppercase text-slate-700 placeholder:text-slate-200 transition-all"
                                        maxLength={8}
                                    />
                                </div>
                                <button
                                    onClick={() => handleCheckVerification()}
                                    disabled={verifying}
                                    className="bg-emerald-600 text-white w-full sm:w-auto px-10 py-4 sm:py-0 rounded-2xl font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 shrink-0 disabled:opacity-60 flex justify-center items-center"
                                >
                                    {verifying ? <Loader2 size={24} className="animate-spin" /> : 'CONFIRMAR'}
                                </button>
                            </div>
                        </div>

                        {verificationError && (
                            <div className="p-6 bg-red-50 text-red-600 rounded-[32px] border border-red-100 animate-in fade-in zoom-in duration-300 text-center">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CloseIcon size={24} />
                                </div>
                                <p className="font-black uppercase tracking-tight text-lg">Certificado Inválido</p>
                                <p className="text-sm font-bold mt-1 text-red-400">O código informado não corresponde a nenhum documento emitido pelo nosso sistema.</p>
                            </div>
                        )}

                        {verificationResult && (
                            <div className="mt-8 p-8 bg-emerald-50 rounded-[40px] border border-emerald-200 space-y-6 animate-in zoom-in duration-300 shadow-inner">
                                <div className="flex items-center gap-4 border-b border-emerald-100 pb-5">
                                    <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-200">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Status: Verificado</p>
                                        <h4 className="text-xl font-black text-emerald-800">DOCUMENTO AUTÊNTICO</h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                    <div>
                                        <label className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Aluno(a)</label>
                                        <p className="font-black text-lg text-slate-800 uppercase mt-1">{verificationResult.student.name}</p>
                                        <p className="text-sm font-bold text-slate-500 mt-1">CPF: {verificationResult.student.cpf}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Conclusão em</label>
                                        <p className="font-black text-lg text-slate-800 uppercase mt-1">{verificationResult.student.issuedAt}</p>
                                    </div>
                                    <div className="md:col-span-2 bg-white/60 p-4 rounded-2xl border border-emerald-100">
                                        <label className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Curso Relacionado</label>
                                        <p className="font-black text-slate-800 uppercase mt-1">{verificationResult.course.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center pt-8">
                    <a href="/" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                        Voltar para o Início
                    </a>
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;

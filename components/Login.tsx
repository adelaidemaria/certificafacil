import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { authenticateAdmin } from '../lib/db';

interface LoginProps {
    onLoginSuccess: () => void;
    onAccessVerify: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onAccessVerify }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        try {
            const isValid = await authenticateAdmin(username, password);
            if (isValid) {
                onLoginSuccess();
            } else {
                setError(true);
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl shadow-slate-200/50 p-8 md:p-10 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Acesso Restrito</h1>
                    <p className="text-slate-500 mt-2 text-sm font-medium">Informe suas credenciais para gerenciar certificados</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                            Usuário ou senha incorretos.
                        </div>
                    )}

                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Usuário</label>
                        <div className="relative">
                            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-300 transition-all"
                                placeholder="Ex: admin"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Senha</label>
                        <div className="relative">
                            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-300 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : 'Entrar no Sistema'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <button
                        onClick={onAccessVerify}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-2xl font-bold transition-colors border border-emerald-100"
                    >
                        <ShieldCheck size={20} />
                        <span>Portal de Verificação</span>
                        <ArrowRight size={18} className="ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;

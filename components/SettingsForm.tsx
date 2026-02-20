
import React, { useState, useRef, useEffect } from 'react';
import { SchoolSettings } from '../types';
import { Save, Upload, Trash2, Building2, UserCircle, CheckCircle2, LockKeyhole, Loader2 } from 'lucide-react';
import { updateAdminCredentials } from '../lib/db';

interface Props {
  settings: SchoolSettings;
  onSave: (settings: SchoolSettings) => void;
}

const SettingsForm: React.FC<Props> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<SchoolSettings>({
    ...settings,
    showCnpj: settings.showCnpj ?? true,
    showInstructorCpf: settings.showInstructorCpf ?? false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCredSuccess, setShowCredSuccess] = useState(false);
  const [credError, setCredError] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signatureImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = () => {
    setFormData(prev => ({ ...prev, signatureImage: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="relative space-y-8 animate-in fade-in duration-500">
      {showSuccess && (
        <div className="fixed top-10 right-10 z-[100] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 duration-300">
          <CheckCircle2 size={24} />
          <span className="font-black uppercase tracking-widest text-sm">Configurações salvas com sucesso!</span>
        </div>
      )}

      {showCredSuccess && (
        <div className="fixed top-24 right-10 z-[100] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 duration-300">
          <CheckCircle2 size={24} />
          <span className="font-black uppercase tracking-widest text-sm">Credenciais alteradas com sucesso!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Painel de Segurança (Troca de Senha) */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <LockKeyhole className="text-red-500" size={24} />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Segurança: Credenciais de Acesso</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Novo Usuário</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 font-bold"
                placeholder="Ex: novo.admin"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nova Senha</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 font-bold"
                placeholder="Ex: SenhaForte123"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              {credError ? (
                <span className="text-red-500 font-bold text-sm">Erro ao atualizar credenciais. Tente novamente.</span>
              ) : (
                <span className="text-slate-400 text-xs font-bold w-2/3">Preencha ambos os campos apenas se desejar alterar os dados atuais de acesso do painel institucional. As mudanças terão efeito no próximo login.</span>
              )}

              <button
                type="button"
                onClick={async () => {
                  if (!credentials.username || !credentials.password) return;
                  setCredLoading(true);
                  setCredError(false);
                  const success = await updateAdminCredentials(credentials.username, credentials.password);
                  setCredLoading(false);
                  if (success) {
                    setShowCredSuccess(true);
                    setCredentials({ username: '', password: '' });
                    setTimeout(() => setShowCredSuccess(false), 3000);
                  } else {
                    setCredError(true);
                  }
                }}
                disabled={credLoading || !credentials.username || !credentials.password}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition disabled:opacity-50"
              >
                {credLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Alterar Acesso
              </button>
            </div>
          </div>
        </div>

        {/* Dados da Escola */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Building2 className="text-blue-600" size={24} />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dados da Escola</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Razão Social</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold uppercase"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">CNPJ</label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="showCnpj"
                    checked={formData.showCnpj}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-blue-500 transition-colors">Mostrar no certificado</span>
                </label>
              </div>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold"
                placeholder="21.658.460/0001-81"
                required
              />
            </div>
          </div>
        </div>

        {/* Dados do Instrutor */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <UserCircle className="text-amber-600" size={24} />
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dados do Instrutor</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
              <input
                type="text"
                name="instructorName"
                value={formData.instructorName}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 font-bold uppercase"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">CPF</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="showInstructorCpf"
                      checked={formData.showInstructorCpf}
                      onChange={handleChange}
                      className="w-3 h-3 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[9px] font-black text-slate-400 uppercase group-hover:text-amber-500 transition-colors">Exibir</span>
                  </label>
                </div>
                <input
                  type="text"
                  name="instructorCpf"
                  value={formData.instructorCpf}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título/Cargo</label>
                <input
                  type="text"
                  name="instructorTitle"
                  value={formData.instructorTitle}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 font-bold uppercase"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upload de Assinatura */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Assinatura Digital</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aparecerá no rodapé do certificado</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2">
              <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group overflow-hidden">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <p className="mb-2 text-sm text-slate-500 font-bold">Clique para enviar assinatura</p>
                  <p className="text-xs text-slate-400">PNG, JPG ou SVG (Fundo transparente recomendado)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-4">
              <div className="w-full h-48 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center p-4 relative">
                {formData.signatureImage ? (
                  <>
                    <img src={formData.signatureImage} alt="Prévia da Assinatura" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    <button
                      type="button"
                      onClick={removeSignature}
                      className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Nenhuma imagem enviada</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={showSuccess}
          className={`${showSuccess ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-12 py-5 rounded-[24px] font-black text-lg uppercase tracking-widest flex items-center gap-3 transition shadow-xl shadow-blue-100 transform hover:-translate-y-1`}
        >
          {showSuccess ? <CheckCircle2 size={24} /> : <Save size={24} />}
          {showSuccess ? 'Configurações Salvas!' : 'Salvar Configurações'}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;

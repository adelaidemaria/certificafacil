
import React, { useEffect, useState, useRef } from 'react';
import { Student, Course, SchoolSettings, Theme } from '../types';

interface Props {
  student: Student;
  course: Course;
  settings: SchoolSettings;
}

const CertificateView: React.FC<Props> = ({ student, course, settings }) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const availableWidth = window.innerWidth - 80;
        const certificateWidth = 1123;
        if (availableWidth < certificateWidth) {
          setScale(availableWidth / certificateWidth);
        } else {
          setScale(1);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format date for display (DD/MM/YYYY)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
    return dateStr;
  };

  // Theme Color Configurations
  const getAppliedTheme = (): Theme => {
    const theme = settings.themes.find(t => t.id === course.themeId);
    if (theme) return theme;
    return settings.themes[0] || {
      id: 'fallback',
      name: 'Fallback',
      primary: '#0f172a',
      accent: '#e67e00',
      ribbon: '#f59e0b'
    };
  };

  const currentTheme = getAppliedTheme();
  
  // Helpers for derived colors
  const hexToRGB = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const colors = {
    primary: currentTheme.primary,
    accent: currentTheme.accent,
    accentLight: hexToRGB(currentTheme.accent, 0.05),
    ribbon: currentTheme.ribbon
  };

  const leftColumn = course.syllabus.slice(0, 5);
  const rightColumn = course.syllabus.slice(5, 10);

  const verificationUrl = student.verificationCode 
    ? `${window.location.protocol}//${window.location.host}${window.location.pathname}?verify=${student.verificationCode}`
    : '';

  const qrCodeUrl = verificationUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}&bgcolor=ffffff&color=${colors.primary.replace('#', '')}&margin=4`
    : '';

  const displayDate = formatDate(student.completionDate) || student.issuedAt || new Date().toLocaleDateString('pt-BR');

  const SignatureArea = ({ small = false }) => (
    <div className={`text-center flex flex-col items-center pb-2`}>
      {settings.signatureImage ? (
        <img 
          src={settings.signatureImage} 
          alt="Assinatura" 
          className={`${small ? 'h-14' : 'h-16'} mb-[-6px] opacity-90 drop-shadow-sm mix-blend-multiply select-none object-contain`} 
        />
      ) : (
        <p 
          className={`signature-font ${small ? 'text-4xl' : 'text-5xl'} mb-[-6px] opacity-80 drop-shadow-sm select-none`} 
          style={{ color: colors.primary }}
        >
          {settings.instructorName}
        </p>
      )}
      <div className={`${small ? 'w-56' : 'w-64'} pt-1.5`} style={{ borderTop: `2px solid ${colors.primary}` }}>
        <p className={`font-black ${small ? 'text-lg' : 'text-xl'} uppercase tracking-tighter leading-none whitespace-nowrap`} style={{ color: colors.primary }}>
          {settings.instructorName}
        </p>
        <div className="flex flex-col items-center mt-1">
          <p className={`${small ? 'text-[10px]' : 'text-[10px]'} font-black text-slate-400 uppercase tracking-widest leading-none`}>
            {settings.instructorTitle}
          </p>
          {settings.showInstructorCpf && (
            <p className={`${small ? 'text-[9px]' : 'text-[9px]'} font-bold text-slate-300 mt-1`}>CPF: {settings.instructorCpf}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-10 print:gap-0 print:bg-white w-full">
      <div 
        ref={containerRef}
        className="flex flex-col items-center origin-top print:scale-100"
        style={{ 
          transform: `scale(${scale})`, 
          height: `calc(794px * ${scale})`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        {/* FRONT PAGE */}
        <div 
          className="relative w-[1123px] h-[794px] bg-white overflow-hidden shadow-2xl certificate-font print:shadow-none print:m-0 shrink-0"
          style={{ border: `15px solid ${colors.primary}` }}
        >
          
          <div 
            className="absolute top-0 right-0 w-[420px] h-full rounded-l-[50%] -mr-24 z-0 opacity-40"
            style={{ backgroundColor: colors.accentLight }}
          ></div>
          
          <div 
            className="absolute top-6 left-1/2 -translate-x-1/2 text-white px-8 py-2 rounded-lg text-[10px] font-black shadow-sm uppercase tracking-widest z-20"
            style={{ backgroundColor: colors.ribbon }}
          >
            EMITIDO CONFORME AUTORIZAÇÃO DA LEI Nº 9394/96 E DECRETO 5154/04
          </div>

          <div className="relative h-full w-full p-16 flex flex-col items-center justify-between text-center z-10 box-border">
            
            <div className="w-full flex justify-between items-start">
              <div className="text-left">
                <h4 className="font-black text-lg tracking-tight uppercase leading-none" style={{ color: colors.primary }}>{settings.schoolName}</h4>
                {settings.showCnpj && (
                  <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase">CNPJ: {settings.cnpj}</p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                 {qrCodeUrl && (
                    <div className="flex flex-col items-center bg-white p-1 shadow-md border border-slate-100 rounded-lg group">
                       <img src={qrCodeUrl} alt="QR Code Validação" className="w-20 h-20" />
                       <div className="w-full text-white py-0.5 text-center rounded-b-sm" style={{ backgroundColor: colors.primary }}>
                          <span className="text-[7px] font-black uppercase tracking-tighter">VALIDAR ACESSO</span>
                       </div>
                    </div>
                 )}
              </div>
            </div>

            <div className="mt-2">
              <h1 className="text-[84px] font-black leading-none uppercase tracking-[-0.04em]" style={{ color: colors.primary }}>CERTIFICADO</h1>
              <p className="text-xl font-bold tracking-[0.4em] text-slate-500 mt-1 uppercase">De Qualificação Profissional</p>
            </div>

            <div 
              className="mt-4 px-14 py-4 rounded-2xl shadow-lg transform rotate-[-0.5deg] max-w-[800px]"
              style={{ backgroundColor: colors.accent, boxShadow: `0 10px 15px -3px ${colors.accent}44` }}
            >
              <h2 className="text-3xl font-black text-white uppercase tracking-widest leading-tight">{course.name}</h2>
            </div>

            <div className="mt-4 space-y-1">
              <p className="text-lg text-slate-500 font-bold uppercase tracking-widest">Este certificado é orgulhosamente concedido a:</p>
              <h3 className="text-6xl font-black uppercase tracking-tighter py-2 leading-none" style={{ color: colors.primary }}>{student.name}</h3>
              <div className="flex items-center justify-center gap-4 mt-1">
                <div className="h-[2px] w-10 bg-slate-200"></div>
                <p className="text-xl font-black text-slate-800 tracking-tight">CPF: {student.cpf}</p>
                <div className="h-[2px] w-10 bg-slate-200"></div>
              </div>
            </div>

            <div className="max-w-4xl mt-2 px-6">
              <p className="text-lg leading-relaxed text-slate-700 font-medium italic uppercase">
                {course.duration}
              </p>
            </div>

            <div className="w-full mt-4 flex items-end border-t border-slate-50 pt-6">
               <div className="flex-1 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local e Data de Emissão</p>
                  <p className="text-lg font-black" style={{ color: colors.primary }}>Bauru/SP, {displayDate}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código de Verificação:</p>
                    <span className="font-black px-2 py-0.5 rounded border text-xs" style={{ backgroundColor: hexToRGB(colors.accent, 0.1), color: colors.primary, borderColor: colors.primary + '22' }}>{student.verificationCode || '---'}</span>
                  </div>
               </div>
               
               <div className="flex-1 flex justify-center pb-4">
                  <div className="relative">
                    <div 
                      className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-xl relative z-20"
                      style={{ backgroundColor: colors.ribbon }}
                    >
                      <div className="w-26 h-26 border-2 border-dashed border-white/50 rounded-full flex flex-col items-center justify-center p-2 text-center">
                         <span className="text-white font-black text-[8px] uppercase tracking-widest leading-none">Selo de Qualidade</span>
                         <span className="text-white font-black text-2xl uppercase my-0.5">OFICIAL</span>
                         <span className="text-white font-black text-[8px] uppercase tracking-widest leading-none">{settings.schoolName.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                      <div className="w-5 h-16 transform -rotate-12 rounded-b-sm shadow-sm" style={{ backgroundColor: colors.accent }}></div>
                      <div className="w-5 h-16 transform rotate-12 rounded-b-sm shadow-sm" style={{ backgroundColor: colors.accent }}></div>
                    </div>
                  </div>
               </div>

               <div className="flex-1 flex justify-end">
                  <SignatureArea />
               </div>
            </div>
          </div>
        </div>

        {/* BACK PAGE */}
        <div 
          className="relative w-[1123px] h-[794px] bg-white overflow-hidden shadow-2xl p-20 certificate-font print:shadow-none print:m-0 shrink-0 mt-20 print:mt-0"
          style={{ border: `15px solid ${colors.primary}` }}
        >
          <div className="h-full flex flex-col items-center justify-between box-border">
            <header className="text-center w-full">
              <div className="flex items-center justify-center gap-6 mb-2">
                <div className="h-px flex-1 bg-slate-200"></div>
                <h2 className="text-5xl font-black uppercase tracking-tighter" style={{ color: colors.primary }}>Conteúdo do Curso</h2>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              <p className="text-lg font-bold uppercase tracking-widest" style={{ color: colors.accent }}>Cronograma de Aprendizado e Prática</p>
            </header>
            
            <div className="w-full mt-10 grid grid-cols-2 gap-x-12">
              <div className="space-y-4">
                {leftColumn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-slate-200 transition-all duration-300">
                    <div 
                      className="flex items-center justify-center w-8 h-8 rounded text-white font-black text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-lg font-bold text-slate-700 uppercase leading-tight group-hover:text-black truncate">{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {rightColumn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-slate-200 transition-all duration-300">
                    <div 
                      className="flex items-center justify-center w-8 h-8 rounded text-white font-black text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: colors.primary }}
                    >
                      {idx + 6}
                    </div>
                    <span className="text-lg font-bold text-slate-700 uppercase leading-tight group-hover:text-black truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <footer className="mt-8 w-full pt-8 flex flex-col items-center justify-center border-t border-slate-50">
                <div className="flex flex-col items-center">
                  <SignatureArea small />
                </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;

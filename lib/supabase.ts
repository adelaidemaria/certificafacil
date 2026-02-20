import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos do banco de dados
export type DbCourse = {
  id: string;
  name: string;
  description: string;
  duration: string;
  instructor: string;
  theme_id: string;
  syllabus: string[];
  created_at: string;
  updated_at: string;
};

export type DbStudent = {
  id: string;
  name: string;
  cpf: string;
  course_id: string;
  registration_date: string;
  completion_date: string;
  status: 'PENDENTE' | 'EMITIDO';
  issued_at?: string;
  verification_code?: string;
  created_at: string;
  updated_at: string;
};

export type DbTheme = {
  id: string;
  name: string;
  primary_color: string;
  accent_color: string;
  ribbon_color: string;
  created_at: string;
};

export type DbSchoolSettings = {
  id: string;
  school_name: string;
  cnpj: string;
  show_cnpj: boolean;
  instructor_name: string;
  instructor_cpf: string;
  show_instructor_cpf: boolean;
  instructor_title: string;
  signature_image?: string;
  created_at: string;
  updated_at: string;
};

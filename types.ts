
export interface Theme {
  id: string;
  name: string;
  primary: string; // Borders, headings
  accent: string;  // Course name background
  ribbon: string;  // Top notice and seal background
}

export interface SchoolSettings {
  schoolName: string;
  cnpj: string;
  showCnpj: boolean;
  instructorName: string;
  instructorCpf: string;
  showInstructorCpf: boolean;
  instructorTitle: string;
  signatureImage?: string; // Base64 string
  themes: Theme[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  syllabus: string[];
  instructor: string;
  themeId: string; // Reference to Theme.id
}

export interface Student {
  id: string;
  name: string;
  cpf: string;
  courseId: string;
  registrationDate: string;
  completionDate: string; // The date displayed on the certificate
  status: 'PENDENTE' | 'EMITIDO';
  issuedAt?: string;
  verificationCode?: string; // Unique ID for verification
}

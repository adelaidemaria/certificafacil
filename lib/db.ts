import { supabase, DbCourse, DbStudent, DbTheme, DbSchoolSettings } from './supabase';
import { Course, Student, SchoolSettings, Theme } from '../types';

// ========================
// Conversores de tipos
// ========================

function dbCourseToCourse(db: DbCourse): Course {
    return {
        id: db.id,
        name: db.name,
        description: db.description,
        duration: db.duration,
        instructor: db.instructor,
        themeId: db.theme_id,
        syllabus: db.syllabus || [],
    };
}

function courseToDbCourse(course: Omit<Course, 'id'>): Omit<DbCourse, 'id' | 'created_at' | 'updated_at'> {
    return {
        name: course.name,
        description: course.description,
        duration: course.duration,
        instructor: course.instructor,
        theme_id: course.themeId,
        syllabus: course.syllabus,
    };
}

function dbStudentToStudent(db: DbStudent): Student {
    return {
        id: db.id,
        name: db.name,
        cpf: db.cpf,
        courseId: db.course_id,
        registrationDate: db.registration_date,
        completionDate: db.completion_date,
        status: db.status,
        issuedAt: db.issued_at,
        verificationCode: db.verification_code,
    };
}

function studentToDbStudent(student: Omit<Student, 'id'>): Omit<DbStudent, 'id' | 'created_at' | 'updated_at'> {
    return {
        name: student.name,
        cpf: student.cpf,
        course_id: student.courseId,
        registration_date: student.registrationDate,
        completion_date: student.completionDate,
        status: student.status,
        issued_at: student.issuedAt,
        verification_code: student.verificationCode,
    };
}

function dbThemeToTheme(db: DbTheme): Theme {
    return {
        id: db.id,
        name: db.name,
        primary: db.primary_color,
        accent: db.accent_color,
        ribbon: db.ribbon_color,
    };
}

function themeToDbTheme(theme: Theme): Omit<DbTheme, 'created_at'> {
    return {
        id: theme.id,
        name: theme.name,
        primary_color: theme.primary,
        accent_color: theme.accent,
        ribbon_color: theme.ribbon,
    };
}

function dbSettingsToSettings(db: DbSchoolSettings, themes: Theme[]): SchoolSettings {
    return {
        schoolName: db.school_name,
        cnpj: db.cnpj,
        showCnpj: db.show_cnpj,
        instructorName: db.instructor_name,
        instructorCpf: db.instructor_cpf,
        showInstructorCpf: db.show_instructor_cpf,
        instructorTitle: db.instructor_title,
        signatureImage: db.signature_image,
        themes,
    };
}

// ========================
// Cursos
// ========================

export async function fetchCourses(): Promise<Course[]> {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as DbCourse[]).map(dbCourseToCourse);
}

export async function createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const { data, error } = await supabase
        .from('courses')
        .insert(courseToDbCourse(course))
        .select()
        .single();

    if (error) throw error;
    return dbCourseToCourse(data as DbCourse);
}

export async function updateCourse(course: Course): Promise<Course> {
    const { data, error } = await supabase
        .from('courses')
        .update(courseToDbCourse(course))
        .eq('id', course.id)
        .select()
        .single();

    if (error) throw error;
    return dbCourseToCourse(data as DbCourse);
}

export async function deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ========================
// Alunos
// ========================

export async function fetchStudents(): Promise<Student[]> {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as DbStudent[]).map(dbStudentToStudent);
}

export async function createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const { data, error } = await supabase
        .from('students')
        .insert(studentToDbStudent(student))
        .select()
        .single();

    if (error) throw error;
    return dbStudentToStudent(data as DbStudent);
}

export async function updateStudent(student: Student): Promise<Student> {
    const { data, error } = await supabase
        .from('students')
        .update(studentToDbStudent(student))
        .eq('id', student.id)
        .select()
        .single();

    if (error) throw error;
    return dbStudentToStudent(data as DbStudent);
}

export async function deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function findStudentByVerificationCode(code: string): Promise<Student | null> {
    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('verification_code', code.toUpperCase())
        .eq('status', 'EMITIDO')
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return dbStudentToStudent(data as DbStudent);
}

// ========================
// Temas
// ========================

export async function fetchThemes(): Promise<Theme[]> {
    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data as DbTheme[]).map(dbThemeToTheme);
}

export async function upsertThemes(themes: Theme[]): Promise<void> {
    const dbThemes = themes.map(themeToDbTheme);
    const { error } = await supabase
        .from('themes')
        .upsert(dbThemes, { onConflict: 'id' });

    if (error) throw error;
}

export async function deleteTheme(id: string): Promise<void> {
    const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ========================
// Configurações da escola
// ========================

export async function fetchSettings(): Promise<SchoolSettings | null> {
    // Buscar configurações
    const { data: settingsData, error: settingsError } = await supabase
        .from('school_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

    if (settingsError) throw settingsError;

    // Buscar temas
    const themes = await fetchThemes();

    if (!settingsData) return null;
    return dbSettingsToSettings(settingsData as DbSchoolSettings, themes);
}

export async function saveSettings(settings: SchoolSettings): Promise<void> {
    // Verificar se já existe um registro
    const { data: existing } = await supabase
        .from('school_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

    const payload = {
        school_name: settings.schoolName,
        cnpj: settings.cnpj,
        show_cnpj: settings.showCnpj,
        instructor_name: settings.instructorName,
        instructor_cpf: settings.instructorCpf,
        show_instructor_cpf: settings.showInstructorCpf,
        instructor_title: settings.instructorTitle,
        signature_image: settings.signatureImage,
    };

    if (existing) {
        const { error } = await supabase
            .from('school_settings')
            .update(payload)
            .eq('id', existing.id);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('school_settings')
            .insert(payload);
        if (error) throw error;
    }

    // Salvar temas separadamente
    await upsertThemes(settings.themes);
}

// ========================
// Autenticação
// ========================

export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

    if (error) {
        console.error('Erro ao autenticar:', error);
        return false;
    }
    return !!data;
}

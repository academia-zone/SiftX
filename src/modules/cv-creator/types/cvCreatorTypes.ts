export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level?: number; // 1 to 100%
  category?: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency?: string; // e.g. "Native Proficiency", "Fluent"
  percent?: number; // e.g. 100, 85
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer?: string;
  year?: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  title: string;
  company: string;
  phone?: string;
  email?: string;
  social?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  link?: string;
  description: string;
}

export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  whatsapp?: string;
  location: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  github?: string;
  summary: string;
  photoUrl?: string; // data URL or image link
}

export interface ResumeData {
  personal: PersonalDetails;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  references: ReferenceItem[];
  projects: ProjectItem[];
}

export type CvTemplateId = 
  | 'dual-tone-sidebar'   // Template 1: Galena Micheal (Dark header, light grey sidebar, checkmark skills)
  | 'teal-geometric'      // Template 2: Taya Miass (Teal geometric wave, circular photo, banner pills)
  | 'minimal-box'         // Template 3: Anaisha Parvati (Clean outer border box, centered header, 4-col skills)
  | 'executive-ribbon'    // Template 4: Corporate Blue Ribbon (Blue shaded banners, WhatsApp/LinkedIn, photo top right)
  | 'modern-clean'        // Template 5: Layla Morgan (Top left photo, right-aligned dates, bold blue dividers)
  | 'modern-executive'    // Clean executive sidebar
  | 'minimal-clean';      // Pure ATS single-column

export type CvThemeColor = 
  | 'slate'      // Charcoal / Dark Slate
  | 'teal'       // Vibrant Teal / Mint
  | 'blue'       // Navy / Corporate Blue
  | 'emerald'    // Forest Emerald Green
  | 'crimson'    // Rich Crimson Ruby
  | 'purple'     // Modern Indigo / Purple
  | 'custom';    // User chosen custom hex

export type TemplateId = 
  | "tunisian" 
  | "europass" 
  | "canadian"
  | "modern_tech"
  | "executive_luxe"
  | "creative_sidebar"
  | "compact_metro"
  | "gradient_header"
  | "minimalist_clean"
  | "nordic_light"
  | "classic_raw";

export type LanguageLevel = 
  | "Langue maternelle"
  | "Bilingue"
  | "Courant (C1/C2)"
  | "Intermédiaire (B1/B2)"
  | "Notions (A1/A2)"
  | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string; // e.g. "Tunis, Tunisie" or "Sousse, Tunisie"
  summary: string;
  photoUrl?: string;
  // Specific to Tunisian/Regional Format
  maritalStatus?: "Célibataire" | "Marié(e)" | "Divorcé(e)" | "Non spécifié";
  birthDate?: string;
  age?: string;
  drivingLicense?: string; // e.g. "Permis B"
  nationality?: string;
  // Links
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  contractType?: "CDI" | "CDD" | "Stage PFE" | "Stage d'été" | "Freelance" | "Alternance" | "Temps plein";
  startDate: string;
  endDate: string;
  current: boolean;
  bulletPoints: string[];
  technologies?: string[];
}

export interface EducationItem {
  id: string;
  degree: string; // e.g. "Diplôme National d'Ingénieur en Génie Logiciel" or "Licence en Informatique de Gestion"
  institution: string; // e.g. "INSAT", "ESPRIT", "ENIT", "FST", "IHEC Carthage"
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  honors?: string; // e.g. "Mention Très Bien", "Major de promotion"
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: "Technical" | "Frameworks & Tools" | "Soft Skills" | "Methodologies" | "General";
  level?: 1 | 2 | 3 | 4 | 5;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: LanguageLevel;
  certification?: string; // e.g. "TCF C1", "IELTS 7.5", "TOEIC 850"
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string; // e.g. "AWS Certified", "Scrum.org", "Google Cloud", "Oracle"
  date: string;
  url?: string;
  credentialId?: string;
}

export interface ResumeSettings {
  template: TemplateId;
  primaryColor: string;
  fontFamily: "sans" | "serif" | "mono" | "arabic";
  fontSize: "sm" | "base" | "lg";
  spacing: "compact" | "normal" | "spacious";
  language: "fr" | "en" | "ar";
  showPhoto: boolean;
  showMaritalStatus: boolean;
  showDrivingLicense: boolean;
  showBirthDate: boolean;
}

export interface ResumeData {
  id?: string;
  title: string;
  updatedAt?: string;
  personalInfo: PersonalInfo;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  settings: ResumeSettings;
}

export interface CoverLetterData {
  id?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateAddress: string;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  jobTitle: string;
  jobReference?: string;
  date: string;
  subject: string;
  greeting: string;
  openingParagraph: string;
  bodyParagraph: string;
  closingParagraph: string;
  signoff: string;
  language: "fr" | "en" | "ar";
  template: "modern" | "formal" | "minimal";
}

export interface ATSAnalysisResult {
  score: number; // 0 to 100
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  tailoredSummary: string;
  actionBulletSuggestions: { original: string; improved: string; reason: string }[];
}

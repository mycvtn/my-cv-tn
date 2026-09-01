export type SupportedLanguage = "fr" | "en" | "ar";

export interface ResumeLabels {
  summary: string;
  experience: string;
  experiences: string;
  education: string;
  skills: string;
  languages: string;
  projects: string;
  certifications: string;
  present: string;
  at: string;
  drivingLicense: string;
  maritalStatus: string;
  contact: string;
  nationality: string;
}

export interface EditorLabels {
  headerTitle: string;
  headerSubtitle: string;
  scanATS: string;
  coverLetterAI: string;
  // Tabs
  tabPersonal: string;
  tabExperience: string;
  tabEducation: string;
  tabSkills: string;
  tabLanguages: string;
  tabSettings: string;
  // Personal info
  photoLabel: string;
  uploadPhoto: string;
  changePhoto: string;
  removePhoto: string;
  noPhoto: string;
  photoHint: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  maritalLicense: string;
  summaryLabel: string;
  summaryPlaceholder: string;
  // Experience
  expSectionTitle: string;
  addPosition: string;
  positionNum: string;
  companyLabel: string;
  periodLabel: string;
  bulletPointsLabel: string;
  addBullet: string;
  optimizeAI: string;
  // Education
  eduSectionTitle: string;
  addDegree: string;
  degreeLabel: string;
  institutionLabel: string;
  honorsLabel: string;
  yearsLabel: string;
  // Skills
  skillsSectionTitle: string;
  addSkill: string;
  // Languages
  langSectionTitle: string;
  addLanguage: string;
  // Settings
  languageSelectorLabel: string;
  fontSizeLabel: string;
  compactFont: string;
  compactFontDesc: string;
  standardFont: string;
  standardFontDesc: string;
  spaciousFont: string;
  spaciousFontDesc: string;
  accentColorLabel: string;
  showPhotoLabel: string;
  showPhotoDesc: string;
}

export const RESUME_TRANSLATIONS: Record<SupportedLanguage, ResumeLabels> = {
  fr: {
    summary: "PROFIL PROFESSIONNEL",
    experience: "EXPÉRIENCES PROFESSIONNELLES",
    experiences: "EXPÉRIENCES PROFESSIONNELLES",
    education: "FORMATION & DIPLÔMES",
    skills: "COMPÉTENCES CLÉS & TECHNOLOGIES",
    languages: "LANGUES",
    projects: "PROJETS NOTABLES",
    certifications: "CERTIFICATIONS",
    present: "Présent",
    at: "chez",
    drivingLicense: "Permis",
    maritalStatus: "État civil",
    contact: "Contact",
    nationality: "Nationalité",
  },
  en: {
    summary: "PROFESSIONAL SUMMARY",
    experience: "PROFESSIONAL EXPERIENCE",
    experiences: "PROFESSIONAL EXPERIENCE",
    education: "EDUCATION & QUALIFICATIONS",
    skills: "CORE SKILLS & TECHNOLOGIES",
    languages: "LANGUAGES",
    projects: "KEY PROJECTS",
    certifications: "CERTIFICATIONS",
    present: "Present",
    at: "at",
    drivingLicense: "Driver's License",
    maritalStatus: "Marital Status",
    contact: "Contact",
    nationality: "Nationality",
  },
  ar: {
    summary: "الملف الشخصي والنبذة المهنية",
    experience: "الخبرات المهنية",
    experiences: "الخبرات المهنية",
    education: "التعليم والشهادات الأكاديمية",
    skills: "المهارات والتقنيات الأساسية",
    languages: "اللغات",
    projects: "المشاريع البارزة",
    certifications: "الشهادات والاعتمادات",
    present: "حتى الآن",
    at: "في",
    drivingLicense: "رخصة القيادة",
    maritalStatus: "الحالة الاجتماعية",
    contact: "معلومات الاتصال",
    nationality: "الجنسية",
  },
};

export const EDITOR_TRANSLATIONS: Record<SupportedLanguage, EditorLabels> = {
  fr: {
    headerTitle: "Éditeur Intelligent & Recrutement",
    headerSubtitle: "Remplissez vos informations ou optimisez votre profil avec l'IA",
    scanATS: "Scanner ATS",
    coverLetterAI: "Lettre de Motivation IA",
    tabPersonal: "Infos",
    tabExperience: "Expériences",
    tabEducation: "Formation",
    tabSkills: "Compétences",
    tabLanguages: "Langues",
    tabSettings: "Style & Modèle",
    photoLabel: "Photo de Profil :",
    uploadPhoto: "Téléverser depuis l'ordinateur",
    changePhoto: "Changer la photo",
    removePhoto: "Retirer",
    noPhoto: "Aucune",
    photoHint: "Formats acceptés : JPG, PNG, WEBP (Max: 5 Mo).",
    fullName: "Nom & Prénom *",
    jobTitle: "Titre Professionnel *",
    email: "Adresse Email *",
    phone: "Numéro de Téléphone *",
    location: "Ville & Pays *",
    linkedin: "Profil LinkedIn",
    github: "GitHub / Portfolio",
    maritalLicense: "État Civil & Permis (Modèle TN)",
    summaryLabel: "Profil Professionnel & Résumé",
    summaryPlaceholder: "Décrivez en 2 à 3 phrases vos forces principales et réalisations clés...",
    expSectionTitle: "Vos Postes & Expériences :",
    addPosition: "Ajouter un poste",
    positionNum: "Poste",
    companyLabel: "Entreprise",
    periodLabel: "Période (Début – Fin)",
    bulletPointsLabel: "Puces de réalisations (STAR / Impact) :",
    addBullet: "+ Ajouter une puce",
    optimizeAI: "Optimiser avec l'IA Gemini",
    eduSectionTitle: "Formations & Diplômes :",
    addDegree: "Ajouter un diplôme",
    degreeLabel: "Diplôme",
    institutionLabel: "Établissement / Université",
    honorsLabel: "Mention / Spécialité",
    yearsLabel: "Années (ex: 2018 – 2021)",
    skillsSectionTitle: "Compétences Clés & Technologies :",
    addSkill: "Ajouter",
    langSectionTitle: "Langues Maîtrisées :",
    addLanguage: "Ajouter une langue",
    languageSelectorLabel: "Langue du CV & de l'Éditeur :",
    fontSizeLabel: "Taille de Police & Densité :",
    compactFont: "Compact (9.5pt)",
    compactFontDesc: "Idéal 1 Page",
    standardFont: "Standard (10.5pt)",
    standardFontDesc: "Recommandé",
    spaciousFont: "Aéré (11.5pt)",
    spaciousFontDesc: "Grand format",
    accentColorLabel: "Couleur d'Accentuation :",
    showPhotoLabel: "Afficher la photo de profil",
    showPhotoDesc: "Activé par défaut sur les modèles Tunisien et Europass",
  },
  en: {
    headerTitle: "Smart Resume Editor & Hiring",
    headerSubtitle: "Fill in your information or optimize your profile with AI",
    scanATS: "ATS Scanner",
    coverLetterAI: "AI Cover Letter",
    tabPersonal: "Personal",
    tabExperience: "Experience",
    tabEducation: "Education",
    tabSkills: "Skills",
    tabLanguages: "Languages",
    tabSettings: "Style & Template",
    photoLabel: "Profile Picture:",
    uploadPhoto: "Upload from computer",
    changePhoto: "Change photo",
    removePhoto: "Remove",
    noPhoto: "None",
    photoHint: "Accepted formats: JPG, PNG, WEBP (Max: 5 MB).",
    fullName: "Full Name *",
    jobTitle: "Job Title *",
    email: "Email Address *",
    phone: "Phone Number *",
    location: "City & Country *",
    linkedin: "LinkedIn Profile",
    github: "GitHub / Portfolio",
    maritalLicense: "Marital Status & License",
    summaryLabel: "Professional Summary",
    summaryPlaceholder: "Describe your core strengths and key achievements in 2-3 sentences...",
    expSectionTitle: "Work Experience & Roles:",
    addPosition: "Add Position",
    positionNum: "Position",
    companyLabel: "Company",
    periodLabel: "Period (Start – End)",
    bulletPointsLabel: "Key Achievements & STAR Bullets:",
    addBullet: "+ Add bullet point",
    optimizeAI: "Optimize with Gemini AI",
    eduSectionTitle: "Education & Qualifications:",
    addDegree: "Add Degree",
    degreeLabel: "Degree / Diploma",
    institutionLabel: "University / Institution",
    honorsLabel: "Honors / Major",
    yearsLabel: "Years (e.g. 2018 – 2021)",
    skillsSectionTitle: "Core Skills & Technologies:",
    addSkill: "Add",
    langSectionTitle: "Languages & Proficiency:",
    addLanguage: "Add Language",
    languageSelectorLabel: "Resume & Editor Language:",
    fontSizeLabel: "Font Size & Layout Density:",
    compactFont: "Compact (9.5pt)",
    compactFontDesc: "Fits 1 Page",
    standardFont: "Standard (10.5pt)",
    standardFontDesc: "Recommended",
    spaciousFont: "Spacious (11.5pt)",
    spaciousFontDesc: "Large format",
    accentColorLabel: "Accent Theme Color:",
    showPhotoLabel: "Display profile picture",
    showPhotoDesc: "Enabled by default on Tunisian & Europass templates",
  },
  ar: {
    headerTitle: "محرر السيرة الذاتية الذكي والتوظيف",
    headerSubtitle: "املأ بياناتك أو حسّن ملفك المهني باستخدام الذكاء الاصطناعي",
    scanATS: "فاحص الـ ATS",
    coverLetterAI: "خطاب التغطية الذكي",
    tabPersonal: "المعلومات",
    tabExperience: "الخبرات",
    tabEducation: "التعليم",
    tabSkills: "المهارات",
    tabLanguages: "اللغات",
    tabSettings: "التصميم واللغة",
    photoLabel: "الصورة الشخصية:",
    uploadPhoto: "رفع صورة من الحاسوب",
    changePhoto: "تغيير الصورة",
    removePhoto: "حذف",
    noPhoto: "لا توجد صورة",
    photoHint: "الصيغ المدعومة: JPG, PNG, WEBP (الحجم الأقصى: 5 ميغابايت).",
    fullName: "الاسم واللقب *",
    jobTitle: "المسمى الوظيفي *",
    email: "البريد الإلكتروني *",
    phone: "رقم الهاتف *",
    location: "المدينة والدولة *",
    linkedin: "حساب لينكد إن (LinkedIn)",
    github: "معرض الأعمال / GitHub",
    maritalLicense: "الحالة الاجتماعية ورخصة القيادة",
    summaryLabel: "الملف الشخصي والنبذة المهنية",
    summaryPlaceholder: "اكتب نبذة مختصرة في 2 إلى 3 جمل تلخص أبرز نقاط قوتك وإنجازاتك...",
    expSectionTitle: "الخبرات والمناصب المهنية:",
    addPosition: "إضافة وظيفة",
    positionNum: "الوظيفة",
    companyLabel: "الشركة / المؤسسة",
    periodLabel: "الفترة (البداية – النهاية)",
    bulletPointsLabel: "الإنجازات والمهام الرئيسية:",
    addBullet: "+ إضافة نقطة",
    optimizeAI: "تحسين الصياغة بالذكاء الاصطناعي",
    eduSectionTitle: "التعليم والمؤهلات الأكاديمية:",
    addDegree: "إضافة مؤهل",
    degreeLabel: "الشهادة / الدرجة العلمية",
    institutionLabel: "الجامعة / المعهد",
    honorsLabel: "التقدير / التخصص",
    yearsLabel: "السنوات (مثال: 2018 – 2021)",
    skillsSectionTitle: "المهارات والتقنيات الأساسية:",
    addSkill: "إضافة",
    langSectionTitle: "اللغات المتقنة:",
    addLanguage: "إضافة لغة",
    languageSelectorLabel: "لغة السيرة الذاتية وواجهة التحرير:",
    fontSizeLabel: "حجم الخط وكثافة الصفحة:",
    compactFont: "مضغوط (9.5pt)",
    compactFontDesc: "مثالي لصفحة واحدة",
    standardFont: "قياسي (10.5pt)",
    standardFontDesc: "موصى به",
    spaciousFont: "مريح (11.5pt)",
    spaciousFontDesc: "تنسيق عريض",
    accentColorLabel: "لون التمييز الرئيسي:",
    showPhotoLabel: "إظهار الصورة الشخصية",
    showPhotoDesc: "مفعلة تلقائياً في النموذج التونسي والأوروبي",
  },
};

export function getResumeLabels(lang: SupportedLanguage = "fr"): ResumeLabels {
  return RESUME_TRANSLATIONS[lang] || RESUME_TRANSLATIONS.fr;
}

export const getResumeTranslation = getResumeLabels;

export function getEditorLabels(lang: SupportedLanguage = "fr"): EditorLabels {
  return EDITOR_TRANSLATIONS[lang] || EDITOR_TRANSLATIONS.fr;
}

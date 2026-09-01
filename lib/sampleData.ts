import { ResumeData, CoverLetterData } from "@/types/resume";

export const INITIAL_RESUME_DATA: ResumeData = {
  title: "CV Ingénieur Logiciel & Cloud Full-Stack",
  personalInfo: {
    fullName: "Yassine Ben Salem",
    jobTitle: "Senior Full-Stack & Cloud Engineer",
    email: "yassine.bensalem@email.tn",
    phone: "+216 98 123 456",
    location: "Tunis, Tunisie",
    summary: "Ingénieur logiciel avec 4+ ans d'expérience dans la conception d'architectures SaaS modulaires, le développement Next.js/TypeScript et le déploiement cloud AWS/GCP. Passionné par l'optimisation des performances web et le clean architecture.",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    maritalStatus: "Célibataire",
    birthDate: "1998-04-15",
    age: "28 ans",
    drivingLicense: "Permis B (Véhiculé)",
    nationality: "Tunisienne",
    linkedin: "linkedin.com/in/yassine-bensalem",
    github: "github.com/yassine-bs",
    website: "yassine-dev.tn"
  },
  experiences: [
    {
      id: "exp-1",
      title: "Lead Developer Full-Stack",
      company: "InnovTech Solutions",
      location: "Tunis (Les Berges du Lac)",
      contractType: "CDI",
      startDate: "2023-01",
      endDate: "Présent",
      current: true,
      technologies: ["Next.js", "React", "Node.js", "PostgreSQL", "Docker", "AWS"],
      bulletPoints: [
        "Conception et pilotage d'une plateforme SaaS B2B traitant plus de 50 000 requêtes/jour avec 99.9% d'uptime.",
        "Refonte complète de l'architecture frontend vers Next.js 14 App Router, réduisant le Largest Contentful Paint (LCP) de 45%.",
        "Mise en place de pipelines CI/CD automatisés sur GitHub Actions, diminuant le délai de livraison des releases de 3 jours à 20 minutes.",
        "Encadrement technique d'une équipe de 5 développeurs juniors et stagiaires PFE."
      ]
    },
    {
      id: "exp-2",
      title: "Ingénieur d'Études et Développement Web",
      company: "Digital Horizons North Africa",
      location: "Sousse / Remote",
      contractType: "CDI",
      startDate: "2021-09",
      endDate: "2022-12",
      current: false,
      technologies: ["TypeScript", "Vue.js", "NestJS", "MongoDB", "Redis"],
      bulletPoints: [
        "Développement d'APIs RESTful et microservices pour un système de paiement et facturation en ligne.",
        "Optimisation des requêtes de base de données avec Redis caching, multipliant le débit des transactions par 3.",
        "Intégration sécurisée des passerelles de paiement locales (Flouci, ClicToPay, Konnect) et internationales (Stripe)."
      ]
    },
    {
      id: "exp-3",
      title: "Stagiaire Projet de Fin d'Études (PFE)",
      company: "Sofrecom Tunisie (Groupe Orange)",
      location: "Tunis",
      contractType: "Stage PFE",
      startDate: "2021-02",
      endDate: "2021-07",
      current: false,
      technologies: ["React", "Python", "FastAPI", "PostgreSQL"],
      bulletPoints: [
        "Réalisation d'un dashboard de supervision réseau et détection d'anomalies basé sur le Machine Learning.",
        "Obtention de la mention Très Bien avec félicitations du jury universitaire."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Diplôme National d'Ingénieur en Génie Logiciel",
      institution: "INSAT (Institut National des Sciences Appliquées et de Technologie)",
      location: "Tunis, Tunisie",
      startDate: "2018",
      endDate: "2021",
      current: false,
      honors: "Mention Très Bien",
      description: "Spécialité Ingénierie Logicielle, Systèmes Distribués et Cloud Computing."
    },
    {
      id: "edu-2",
      degree: "Diplôme des Études Universitaires Générales (Classes Préparatoires Intégrées)",
      institution: "INSAT",
      location: "Tunis, Tunisie",
      startDate: "2016",
      endDate: "2018",
      current: false,
      honors: "Filière Mathématiques, Physique et Informatique (MPI)"
    },
    {
      id: "edu-3",
      degree: "Baccalauréat Scientifique (Section Mathématiques)",
      institution: "Lycée Pilote de Tunis",
      location: "Tunis, Tunisie",
      startDate: "2012",
      endDate: "2016",
      current: false,
      honors: "Mention Très Bien (Moyenne 17.85/20)"
    }
  ],
  skills: [
    { id: "sk-1", name: "TypeScript / JavaScript", category: "Technical", level: 5 },
    { id: "sk-2", name: "Next.js & React 18+", category: "Technical", level: 5 },
    { id: "sk-3", name: "Node.js & Express / NestJS", category: "Technical", level: 4 },
    { id: "sk-4", name: "PostgreSQL & Prisma / Supabase", category: "Technical", level: 5 },
    { id: "sk-5", name: "Docker & Kubernetes", category: "Frameworks & Tools", level: 4 },
    { id: "sk-6", name: "Cloud AWS (EC2, S3, RDS, Lambda)", category: "Frameworks & Tools", level: 4 },
    { id: "sk-7", name: "CI/CD & Git Flow", category: "Frameworks & Tools", level: 5 },
    { id: "sk-8", name: "Méthodologie Agile / Scrum", category: "Methodologies", level: 5 },
    { id: "sk-9", name: "Clean Architecture & DDD", category: "Methodologies", level: 4 },
    { id: "sk-10", name: "Leadership technique & Mentoring", category: "Soft Skills", level: 4 }
  ],
  languages: [
    { id: "lang-1", name: "Arabe", level: "Langue maternelle" },
    { id: "lang-2", name: "Français", level: "Bilingue", certification: "TCF C2" },
    { id: "lang-3", name: "Anglais", level: "Courant (C1/C2)", certification: "TOEIC 935" },
    { id: "lang-4", name: "Allemand", level: "Notions (A1/A2)", certification: "Goethe A2" }
  ],
  projects: [
    {
      id: "proj-1",
      name: "TounesHealth - Téléconsultation Médicale",
      role: "Lead Architect",
      link: "github.com/yassine-bs/tounes-health",
      startDate: "2024",
      description: "Plateforme open-source de mise en relation patients-médecins en Tunisie avec visioconférence WebRTC chiffrée et carnet de santé numérique.",
      technologies: ["Next.js", "WebRTC", "Supabase", "Tailwind CSS"]
    },
    {
      id: "proj-2",
      name: "DinarPay SDK - Wrapper Fintech Tunisie",
      role: "Maintainer",
      link: "npmjs.com/package/dinarpay-sdk",
      startDate: "2023",
      description: "Librairie TypeScript unifiant les intégrations Flouci, Konnect et Sobflous pour développeurs Node.js avec plus de 2000 téléchargements.",
      technologies: ["TypeScript", "Jest", "Rollup"]
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services (AWS)",
      date: "2024",
      credentialId: "AWS-SAA-849204"
    },
    {
      id: "cert-2",
      name: "Professional Scrum Master I (PSM I)",
      issuer: "Scrum.org",
      date: "2023",
      credentialId: "PSM-773194"
    }
  ],
  settings: {
    template: "tunisian",
    primaryColor: "#0f172a",
    fontFamily: "sans",
    fontSize: "base",
    spacing: "normal",
    language: "fr",
    showPhoto: true,
    showMaritalStatus: true,
    showDrivingLicense: true,
    showBirthDate: true
  }
};

export const INITIAL_COVER_LETTER_DATA: CoverLetterData = {
  candidateName: "Yassine Ben Salem",
  candidateEmail: "yassine.bensalem@email.tn",
  candidatePhone: "+216 98 123 456",
  candidateAddress: "Tunis, Tunisie",
  recipientName: "Direction des Ressources Humaines",
  recipientTitle: "Responsable Recrutement Tech",
  companyName: "TechCorp Global Solutions",
  companyAddress: "Paris, France (Éligible Remote / Relocation)",
  jobTitle: "Senior Full-Stack Cloud Engineer",
  jobReference: "TC-2026-FS",
  date: "1 Septembre 2026",
  subject: "Candidature au poste de Senior Full-Stack Cloud Engineer (Réf: TC-2026-FS)",
  greeting: "Madame, Monsieur,",
  openingParagraph: "C'est avec un enthousiasme marqué que je vous soumets ma candidature pour le poste de Senior Full-Stack Cloud Engineer au sein de TechCorp Global Solutions. Suivant de près vos récentes innovations dans le domaine des solutions distribuées à haute disponibilité, je suis convaincu que mon profil d'ingénieur logiciel et mon expertise full-stack constituent un atout majeur pour soutenir vos objectifs de croissance.",
  bodyParagraph: "Diplômé de l'INSAT avec plus de 4 années d'expérience en conception d'architectures SaaS scalables, j'ai notamment piloté la refonte d'applications critiques sous Next.js et microservices, aboutissant à une réduction de 45% des temps de latence et à un renforcement notable de la fiabilité des pipelines CI/CD. Habitué à travailler au sein d'environnements agiles et multiculturels, je combine rigueur algorithmique, sens du produit et passion pour le partage des bonnes pratiques techniques.",
  closingParagraph: "Intégrer vos équipes représente pour moi une opportunité stimulante de relever de nouveaux défis d'envergure. Je me tiens à votre entière disposition pour convenir d'un entretien au cours duquel nous pourrons aborder plus concrètement ma contribution à vos projets futurs.",
  signoff: "Je vous prie d'agréer, Madame, Monsieur, l'assurance de ma considération distinguée.",
  language: "fr",
  template: "modern"
};

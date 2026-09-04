import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Common ATS keyword dictionary for precise technology and professional terms detection
 */
const COMMON_SKILL_PATTERNS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", ".NET", "PHP", "Ruby", "Golang", "Rust", "Swift", "Kotlin", "R",
  "React", "React Native", "Next.js", "Vue.js", "Nuxt", "Angular", "Svelte", "Node.js", "Express", "NestJS", "FastAPI", "Django", "Flask", "Spring Boot", "Laravel", "Symfony",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Oracle", "SQLite", "Firebase", "Supabase", "DynamoDB",
  "AWS", "Amazon Web Services", "GCP", "Google Cloud", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible", "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "Linux", "Nginx",
  "REST API", "GraphQL", "Microservices", "Serverless", "Clean Architecture", "DDD", "TDD", "Agile", "Scrum", "Kanban", "Jira", "Git", "GitFlow",
  "Tailwind CSS", "Bootstrap", "Sass", "HTML5", "CSS3", "Figma", "UI/UX", "Responsive Design", "WebRTC", "WebSockets",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-Learn", "Data Analysis", "Power BI", "Tableau", "SQL",
  "Leadership", "Management", "Gestion de projet", "Communication", "Résolution de problèmes", "Travail en équipe", "Autonomie", "Rigueur",
  "Anglais", "Français", "Allemand", "Arabe", "Bilingue", "TOEIC", "TCF", "Scrum Master", "PMP", "AWS Certified"
];

/**
 * Extracts and calculates real ATS keywords and match score accurately
 */
export function extractAccurateKeywords(resumeText: string, jobDescription: string) {
  const resumeNormalized = resumeText.toLowerCase();
  const jobNormalized = jobDescription.toLowerCase();

  const matchedKeywordsSet = new Set<string>();
  const missingKeywordsSet = new Set<string>();

  COMMON_SKILL_PATTERNS.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");

    if (regex.test(jobNormalized)) {
      if (regex.test(resumeNormalized)) {
        matchedKeywordsSet.add(skill);
      } else {
        missingKeywordsSet.add(skill);
      }
    }
  });

  const dynamicTerms = jobDescription.match(/\b[A-Z][a-zA-Z0-9+#.-]{2,}\b/g) || [];
  const stopwords = new Set(["Nous", "Vous", "Pour", "Avec", "Dans", "Une", "Les", "Des", "Sur", "Par", "Votre", "Notre", "Plus", "Tous", "Très", "Bien", "Comme", "Cette", "Avoir", "Faire", "Poste", "Offre", "Profil", "Mission", "Entreprise", "Equipe", "Équipe", "Recherche", "Société", "Candidat", "Rejoindre"]);

  dynamicTerms.forEach((term) => {
    if (term.length >= 3 && !stopwords.has(term)) {
      const termLower = term.toLowerCase();
      const regex = new RegExp(`\\b${termLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");

      if (regex.test(resumeNormalized)) {
        matchedKeywordsSet.add(term);
      } else if (!missingKeywordsSet.has(term) && !matchedKeywordsSet.has(term)) {
        missingKeywordsSet.add(term);
      }
    }
  });

  const matchedKeywords = Array.from(matchedKeywordsSet).slice(0, 15);
  const missingKeywords = Array.from(missingKeywordsSet).slice(0, 12);

  const total = matchedKeywords.length + missingKeywords.length;
  let score = total > 0 ? Math.round((matchedKeywords.length / total) * 100) : 70;
  score = Math.max(25, Math.min(98, score));

  return {
    score,
    matchedKeywords,
    missingKeywords,
  };
}

/**
 * Converts conjugated French verb beginnings directly into their natural infinitive form
 */
const CONJUGATED_TO_INFINITIVE_MAP: [RegExp, string][] = [
  [/^(j'ai développé|j'ai codé|a développé|développe|programmé|programme)\s+/i, "Développer "],
  [/^(j'ai conçu|a conçu|conçoit|designé|designe)\s+/i, "Concevoir "],
  [/^(j'ai créé|a créé|crée|créait)\s+/i, "Créer "],
  [/^(j'ai géré|a géré|gère|piloté|pilote|managé|manage)\s+/i, "Piloter "],
  [/^(j'ai administré|a administré|administre)\s+/i, "Administrer "],
  [/^(j'ai configuré|a configuré|configure|installé|installe)\s+/i, "Configurer "],
  [/^(j'ai déployé|a déployé|déploie|mis en production)\s+/i, "Déployer "],
  [/^(j'ai optimisé|a optimisé|optimise|amélioré|améliore)\s+/i, "Optimiser "],
  [/^(j'ai automatisé|a automatisé|automatise)\s+/i, "Automatiser "],
  [/^(j'ai testé|a testé|teste|validé|valide|recetté)\s+/i, "Tester et valider "],
  [/^(j'ai sécurisé|a sécurisé|sécurise|protégé|protège)\s+/i, "Sécuriser "],
  [/^(j'ai encadré|a encadré|encadre|formé|forme|coaché)\s+/i, "Encadrer et former "],
  [/^(j'ai analysé|a analysé|analyse|étudié|étudie)\s+/i, "Analyser "],
  [/^(j'ai rédigé|a rédigé|rédige|documenté|documente)\s+/i, "Rédiger et documenter "],
  [/^(j'ai coordonné|a coordonné|coordonne|animé|anime)\s+/i, "Coordonner "],
  [/^(j'ai intégré|a intégré|intègre)\s+/i, "Intégrer "],
  [/^(j'ai maintenu|a maintenu|maintient)\s+/i, "Maintenir "],
  [/^(j'ai assisté|a assisté|assiste)\s+/i, "Assister "],
  [/^(j'ai assuré|a assuré|assure)\s+/i, "Assurer "],
];

/**
 * Intelligent French Semantic Infinitive Action Mapper
 */
function toFrenchInfinitive(text: string): string {
  let cleaned = text.replace(/^[-•*]\s*/, "").trim();
  cleaned = cleaned.replace(/\.+$/, "").trim();

  // Strip casual filler prefixes (e.g. "j'ai fait", "j ai fait", "jai fait", "responsable de", "charge de")
  cleaned = cleaned.replace(/^(j['’\s]?ai\s+(fait|travaill[eé]\s+sur|particip[eé]\s+[aà]|réalis[eé]|conçu|d[eé]velopp[eé]|g[eé]r[eé])?|responsable\s+de\s+l['’]|responsable\s+de|charg[eé]\s+de|faire\s+le|faire\s+la|faire\s+les|travail\s+sur|missions?\s*:?)\s*/i, "").trim();

  // 1. Check direct conjugated verbs
  for (const [pattern, inf] of CONJUGATED_TO_INFINITIVE_MAP) {
    if (pattern.test(cleaned)) {
      const rest = cleaned.replace(pattern, "").trim();
      return `${inf}${rest}.`;
    }
  }

  // 2. Exact action noun mappings -> Natural context-specific Infinitive verbs
  // Support / Maintenance / Dépannage
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(assuration|assurance|support|assistance|helpdesk|dépannage|résolution|maintenance)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(assuration|assurance|assurer|assuré|assurant|assistance|helpdesk|dépannage|résolution|maintenance)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    if (/^incidents?|pannes?|bugs?/i.test(rest)) {
      return `Prendre en charge et résoudre les ${rest}.`;
    }
    if (!/^(le|la|les|l'|du|des|de)\b/i.test(rest)) rest = `le ${rest}`;
    return `Assurer ${rest}.`;
  }

  // Développement / Frontend / Backend / Fullstack / API / Code
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(d[eé]veloppement|codage|programmation|impl[eé]mentation)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(d[eé]veloppement|codage|programmation|impl[eé]mentation)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    if (/^(backend|frontend|fullstack|site|logiciel|module|portail|projet)/i.test(rest)) {
      rest = `le ${rest}`;
    } else if (/^(api|applications?|infrastructures?|architectures?)/i.test(rest)) {
      rest = `l'${rest}`;
    } else if (!/^(l'|la|le|les|d'|des|du|de)\b/i.test(rest)) {
      rest = `les ${rest}`;
    }
    return `Développer et concevoir ${rest}.`;
  }

  // Conception / Architecture / Modélisation / Design
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(conception|architecture|mod[eé]lisation|design)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(conception|architecture|mod[eé]lisation|design)\s*(et\s+mod[eé]lisation\s+)?(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    if (!/^(l'|la|le|les|d'|des|du|de)\b/i.test(rest)) rest = `la ${rest}`;
    return `Concevoir et modéliser ${rest}.`;
  }

  // Création / Élaboration / Réalisation
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(cr[eé]ation|[eé]laboration|r[eé]alisation)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(cr[eé]ation|[eé]laboration|r[eé]alisation)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    if (!/^(l'|la|le|les|d'|des|du|de)\b/i.test(rest)) rest = `le ${rest}`;
    return `Réaliser et mettre en place ${rest}.`;
  }

  // Gestion / Pilotage / Management / Suivi / Animation
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(gestion|g[eé]rance|pilotage|management|suivi|animation)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(gestion|g[eé]rance|pilotage|management|suivi|animation)\s*(de\s+projet\s+agile|de\s+projet|de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    return `Piloter et gérer les projets ${rest}.`;
  }

  // Administration / Système / Réseau / Base de données
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(administration|admin)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(administration|admin)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    if (!/^(l'|la|le|les|d'|des|du|de)\b/i.test(rest)) rest = `les ${rest}`;
    return `Administrer et maintenir ${rest}.`;
  }

  // Déploiement / Mise en production / Release
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(d[eé]ploiement|mise\s+en\s+production|release)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(d[eé]ploiement|mise\s+en\s+production|release)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    return `Déployer et industrialiser ${rest}.`;
  }

  // Mise en place / Configuration / Installation / Paramétrage
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(mise\s+en\s+place|configuration|installation|param[eé]trage|setup)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(mise\s+en\s+place|configuration|installation|param[eé]trage|setup)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    if (!/^(les|l'|la|le|des|du|de)\b/i.test(rest)) rest = `les ${rest}`;
    return `Mettre en place et configurer ${rest}.`;
  }

  // Optimisation / Performance / Refonte / Amélioration
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(optimisation|refonte|am[eé]lioration|restructuration)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(optimisation|refonte|am[eé]lioration|restructuration)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    if (!/^(les|l'|la|le|des|du|de)\b/i.test(rest)) rest = `la ${rest}`;
    return `Optimiser et restructurer ${rest}.`;
  }

  // Automatisation / Scripting / CI/CD
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(automatisation|scripting)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(automatisation|scripting)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    if (!/^(les|l'|la|le|des|du|de)\b/i.test(rest)) rest = `les ${rest}`;
    return `Automatiser et industrialiser ${rest}.`;
  }

  // Sécurisation / Audit / Conformité / Protection
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(s[eé]curisation|audit|conformit[eé]|protection)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(s[eé]curisation|audit|conformit[eé]|protection)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    if (!/^(les|l'|la|le|des|du|de)\b/i.test(rest)) rest = `les ${rest}`;
    return `Sécuriser et auditer ${rest}.`;
  }

  // Encadrement / Formation / Mentoring / Coaching
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(encadrement|formation|coaching|mentorat|accompagnement)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(encadrement|formation|coaching|mentorat|accompagnement)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    return `Encadrer et former ${rest}.`;
  }

  // Tests / QA / Recette / Validation
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(tests?|qa|recette|validation|contr[oô]le)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(tests?|qa|recette|validation|contr[oô]le)\s*(unitaires\s+)?(et\s+validation\s+)?(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    return `Tester et valider ${rest ? rest : "les fonctionnalités"}.`;
  }

  // Analyse / Étude / Spécifications / Veille
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(analyse|[eé]tude|sp[eé]cifications?|veille)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(analyse|[eé]tude|sp[eé]cifications?|veille)\s*(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    return `Analyser et spécifier ${rest}.`;
  }

  // Rédaction / Documentation
  if (/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(r[eé]daction|documentation|r[eé]dactionnelle)\b/i.test(cleaned)) {
    let rest = cleaned.replace(/^(le\s+|la\s+|l['’]|les\s+|un\s+|une\s+|des\s+|du\s+)?(r[eé]daction|documentation)\s*(technique\s+)?(et\s+r[eé]daction\s+)?(de\s+l'|d'|du|des|de\s+la|de)?\s*/i, "").trim();
    return `Rédiger et documenter ${rest ? rest : "les spécifications techniques"}.`;
  }

  // If already starts with ANY French infinitive verb
  if (/^(Assurer|Concevoir|Développer|Piloter|Mettre en place|Optimiser|Administrer|Intégrer|Gérer|Superviser|Automatiser|Garantir|Structurer|Déployer|Réaliser|Coordonner|Encadrer|Maintenir|Configurer|Implémenter|Analyser|Rédiger|Tester|Valider|Sécuriser|Former|Négocier|Prospecter|Installer|Résoudre|Prendre en charge)\b/i.test(cleaned)) {
    const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return `${formatted}.`;
  }

  // Dynamic context fallback: identify verbs matching technical content
  if (/api|backend|frontend|react|node|java|python|web|application/i.test(cleaned)) {
    return `Développer et concevoir ${cleaned}.`;
  }
  if (/équipe|projet|réunion|agile|scrum|sprint|client/i.test(cleaned)) {
    return `Coordonner et piloter ${cleaned}.`;
  }
  if (/base de données|sql|serveur|linux|docker|cloud|aws/i.test(cleaned)) {
    return `Administrer et configurer ${cleaned}.`;
  }

  // Natural fallback
  const firstLower = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  return `Réaliser ${firstLower}.`;
}

/**
 * Intelligent Professional Polish Dictionary & Natural Rewriter
 */
function polishSentenceAuthentic(draft: string, lang: "fr" | "en" | "ar"): string {
  let text = draft.replace(/^[-•*]\s*/, "").trim();
  if (!text) return "";

  if (lang === "ar") {
    text = text.replace(/^(عملت على|قمت بـ|اشتغلت على|كنت مسؤول عن)\s*/i, "");
    if (/^(تصميم|تطوير|بناء|برمجة|إنشاء|إدارة|هيكلة|أتمتة|تأمين|تحسين|إشراف|صيانة|تنفيذ|إعداد|توثيق|ضمان|تنسيق|اختبار)/.test(text)) {
      return `${text.charAt(0).toUpperCase() + text.slice(1)}.`;
    }
    return `تطوير وتنفيذ ${text}.`;
  }

  if (lang === "en") {
    let cleaned = text.replace(/^(i worked on|i built|i helped with|responsible for|working on|did the|created|built|managed)\s+/i, "");
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    if (/^(Design|Develop|Architect|Engineer|Implement|Orchestrate|Spearhead|Automate|Optimize|Maintain|Lead|Configure|Refactor|Integrate|Manage|Administer|Ensure|Test|Analyze|Coordinate)\b/i.test(cleaned)) {
      return cleaned.endsWith(".") ? cleaned : `${cleaned}.`;
    }

    return `Develop and implement ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}.`;
  }

  // French: Exact semantic infinitive verb matching the actual action
  return toFrenchInfinitive(text);
}

/**
 * Optimizes a resume bullet point into an Authentic Professional Mode (Mode Pro)
 * The sentence ALWAYS starts with a natural, varied unconjugated INFINITIVE VERB tailored to the specific action described.
 * Gemini returns ONLY the refined text with ZERO conversational fluff, greetings, commentary, or markdown formatting.
 */
export async function optimizeBulletPoint(
  bullet: string,
  role: string = "",
  targetLanguage: string = "fr"
): Promise<string> {
  const client = getGeminiClient();
  const cleanedDraft = bullet.replace(/^[-•*]\s*/, "").replace(/^["']|["']$/g, "").trim();
  const langKey = targetLanguage === "ar" ? "ar" : targetLanguage === "en" ? "en" : "fr";

  if (!client) {
    return polishSentenceAuthentic(cleanedDraft, langKey);
  }

  const langInstruction = targetLanguage === "ar" 
    ? "Arabic (العربية)" 
    : targetLanguage === "en" 
    ? "English" 
    : "French (Français)";

  const prompt = `
You are an expert Executive Resume & ATS Optimization Engine.
Rewrite the following resume bullet point into an impactful, action-oriented, professional bullet point.

Candidate Role: ${role || "Professional"}
Original Draft: "${cleanedDraft}"
Target Language: ${langInstruction}

MANDATORY RULES:
1. NO CONVERSATIONAL FLUFF: DO NOT include greetings ("Bonjour", "Voici votre phrase"), conversational introductions, explanations, notes, markdown formatting (no bold **, no asterisks *, no hashtags #), or quotation marks.
2. PRESERVE TARGET LANGUAGE: Output strictly in ${langInstruction}.
3. STRICT ATS ACTION-VERB STRUCTURE:
   - In French: ALWAYS start with a precise, unconjugated INFINITIVE VERB (e.g. Développer, Concevoir, Piloter, Optimiser, Mettre en place, Administrer, Automatiser, Sécuriser, Tester, Encadrer, Analyser).
   - In English: ALWAYS start with a strong active verb (e.g. Develop, Design, Architect, Lead, Optimize, Implement, Deploy, Analyze, Automate).
   - In Arabic: ALWAYS start with a verbal noun (المصدر, e.g. تطوير, تصميم, قيادة, أتمتة, تحسين, إدارة).
4. PRESERVE FACTUAL TOOLS: Keep all technical skills, programming languages, frameworks, and metrics mentioned in the original draft.
5. CONCISE & EXACT: Output EXACTLY ONE polished sentence ending with a single period.

Output ONLY the final polished sentence:
`;

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    let result = response.text?.trim() || "";
    // Clean any accidental fluff, quotes, markdown, or commentary prefixes
    result = result
      .replace(/^```[a-z]*\s*/i, "")
      .replace(/\s*```$/i, "")
      .replace(/^["'«»“]+|["'«»”]+$/g, "")
      .replace(/^[-•*#\s]+/, "")
      .replace(/\*\*/g, "")
      .replace(/^\*([^*]+)\*$/, "$1")
      .replace(/^(voici|voici la phrase|phrase optimisée|optimisation|résultat|recommandation|bullet point|mode pro)\s*:\s*/i, "")
      .replace(/^(here is|optimized bullet|result)\s*:\s*/i, "")
      .trim();

    return result || polishSentenceAuthentic(cleanedDraft, langKey);
  } catch (error) {
    console.error("Gemini optimization error, using authentic polish:", error);
    return polishSentenceAuthentic(cleanedDraft, langKey);
  }
}

/**
 * Compares a resume against a job description and provides accurate ATS Score & Gap analysis.
 */
export async function analyzeJobMatch(
  resumeText: string,
  jobDescription: string,
  language: "fr" | "en" | "ar" = "fr"
) {
  const keywordAnalysis = extractAccurateKeywords(resumeText, jobDescription);
  const client = getGeminiClient();

  if (!client) {
    const strengths = keywordAnalysis.matchedKeywords.length > 0
      ? [
          `Correspondance validée sur les compétences clés : ${keywordAnalysis.matchedKeywords.slice(0, 4).join(", ")}.`,
          "Structure du CV claire et adaptée aux exigences fondamentales du poste.",
          "Expérience pertinente alignée sur les objectifs de l'offre d'emploi."
        ]
      : ["Profil général adaptable aux exigences du poste."];

    const improvements = keywordAnalysis.missingKeywords.length > 0
      ? [
          `Intégrez explicitement les mots-clés manquants : ${keywordAnalysis.missingKeywords.slice(0, 4).join(", ")}.`,
          "Ajoutez des réalisations chiffrées (ex: pourcentage d'optimisation, volume d'utilisateurs).",
          "Adaptez l'intitulé de votre poste pour correspondre exactement à l'intitulé de l'offre."
        ]
      : ["Quantifiez davantage vos réalisations pour maximiser votre impact ATS."];

    return {
      score: keywordAnalysis.score,
      matchedKeywords: keywordAnalysis.matchedKeywords,
      missingKeywords: keywordAnalysis.missingKeywords,
      strengths,
      improvements,
      tailoredSummary: `Professionnel qualifié maîtrisant ${keywordAnalysis.matchedKeywords.slice(0, 3).join(", ") || "les technologies clés du secteur"}, avec une expérience éprouvée dans la livraison de projets à fort impact. Motivé à apporter une valeur immédiate aux défis du poste.`,
    };
  }

  const prompt = `
You are a senior ATS Recruiter. Perform an accurate semantic match analysis between this Candidate Resume and the Target Job Description.

Candidate Resume:
${resumeText}

Target Job Description:
${jobDescription}

Strict Mathematical Keywords Found:
- Matched in CV: ${keywordAnalysis.matchedKeywords.join(", ")}
- Missing from CV: ${keywordAnalysis.missingKeywords.join(", ")}
- Base Keyword Match Score: ${keywordAnalysis.score}%

Provide your final analysis in JSON format with exactly the following schema:
{
  "score": ${keywordAnalysis.score},
  "matchedKeywords": [list of strings accurately detected in both the resume and the job description],
  "missingKeywords": [list of strings explicitly requested in the job description but absent from the resume],
  "strengths": [3 string bullet points in ${language} detailing verified candidate matches],
  "improvements": [3 string actionable recommendations in ${language} mentioning the missing keywords],
  "tailoredSummary": "A 3-sentence professional summary in ${language} perfectly adapted for this job"
}

Return ONLY raw JSON, with no markdown code fences.
`;

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const cleaned = (response.text || "{}").replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      score: typeof parsed.score === "number" ? parsed.score : keywordAnalysis.score,
      matchedKeywords: Array.isArray(parsed.matchedKeywords) && parsed.matchedKeywords.length > 0 ? parsed.matchedKeywords : keywordAnalysis.matchedKeywords,
      missingKeywords: Array.isArray(parsed.missingKeywords) && parsed.missingKeywords.length > 0 ? parsed.missingKeywords : keywordAnalysis.missingKeywords,
      strengths: parsed.strengths || ["Compétences clés alignées avec l'offre."],
      improvements: parsed.improvements || ["Intégrez les mots-clés requis."],
      tailoredSummary: parsed.tailoredSummary || "Profil qualifié adapté au poste.",
    };
  } catch (error) {
    console.error("Gemini ATS Match error, using accurate fallback:", error);
    return {
      score: keywordAnalysis.score,
      matchedKeywords: keywordAnalysis.matchedKeywords,
      missingKeywords: keywordAnalysis.missingKeywords,
      strengths: [`Correspondance validée sur : ${keywordAnalysis.matchedKeywords.slice(0, 3).join(", ")}`],
      improvements: [`Ajoutez les mots-clés : ${keywordAnalysis.missingKeywords.slice(0, 3).join(", ")}`],
      tailoredSummary: "Profil qualifié aligné avec les exigences de l'offre.",
    };
  }
}

/**
 * Generates a tailored, persuasive Cover Letter
 */
export async function generateCoverLetter(
  candidateData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    experiences: string;
    skills: string;
    education: string;
    projects?: string;
  },
  jobData: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    tone?: "formal" | "dynamic" | "academic";
    language?: "fr" | "en" | "ar";
  }
) {
  const client = getGeminiClient();
  const lang = jobData.language || "fr";

  if (!client) {
    return {
      subject: `Candidature au poste de ${jobData.jobTitle} - ${candidateData.name}`,
      greeting: "Madame, Monsieur,",
      openingParagraph: `C'est avec un vif intérêt que je vous adresse ma candidature pour le poste de ${jobData.jobTitle} au sein de ${jobData.companyName}. Fort de mon parcours et passionné par les défis actuels, je suis convaincu que mes compétences correspondent aux ambitions de votre équipe.`,
      bodyParagraph: `Au cours de mes expériences récentes (${candidateData.experiences.slice(0, 120)}...), j'ai développé une solide maîtrise technique (${candidateData.skills}). Mon parcours académique à ${candidateData.education.slice(0, 80)} m'a permis de mener des projets rigoureux. La mission de ${jobData.companyName} correspond parfaitement à mes aspirations.`,
      closingParagraph: `Je serais ravi d'échanger avec vous lors d'un entretien afin de vous exposer plus en détail ma motivation et la valeur que je peux apporter à ${jobData.companyName}.`,
      signoff: "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées."
    };
  }

  const prompt = `
You are an expert Executive Career Coach and Head of Talent Acquisition.
Write a highly persuasive, personalized, and ATS-optimized Cover Letter (Lettre de Motivation).

Candidate Profile (From Resume):
- Name: ${candidateData.name}
- Email: ${candidateData.email} | Phone: ${candidateData.phone} | Location: ${candidateData.address}
- Key Experiences & Achievements: ${candidateData.experiences}
- Core Skills & Tech Stack: ${candidateData.skills}
- Education & Credentials: ${candidateData.education}
- Key Projects: ${candidateData.projects || "N/A"}

Target Job & Company:
- Position: ${jobData.jobTitle}
- Target Company: ${jobData.companyName}
- Job Description & Key Requirements: ${jobData.jobDescription || "Standard requirements for " + jobData.jobTitle}
- Tone: ${jobData.tone || "formal"}
- Language: ${lang}

Output format: STRICT JSON schema:
{
  "subject": "<Concise compelling subject line>",
  "greeting": "<Formal greeting>",
  "openingParagraph": "<Engaging introduction>",
  "bodyParagraph": "<Substantive alignment between candidate CV milestones and job needs>",
  "closingParagraph": "<Call to action for interview>",
  "signoff": "<Formal signoff>"
}

Return ONLY raw valid JSON without markdown code fences.
`;

  try {
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const text = response.text || "{}";
    const cleaned = text
      .replace(/^```[a-z]*\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Extract JSON object if wrapped in text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        subject: parsed.subject || `Candidature au poste de ${jobData.jobTitle} - ${candidateData.name}`,
        greeting: parsed.greeting || "Madame, Monsieur,",
        openingParagraph: parsed.openingParagraph || "",
        bodyParagraph: parsed.bodyParagraph || "",
        closingParagraph: parsed.closingParagraph || "",
        signoff: parsed.signoff || "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
      };
    }
    throw new Error("Invalid JSON returned from Gemini");
  } catch (error) {
    console.error("Gemini Cover Letter error, falling back to structured template:", error);
    return {
      subject: `Candidature au poste de ${jobData.jobTitle} - ${candidateData.name}`,
      greeting: "Madame, Monsieur,",
      openingParagraph: `C'est avec un vif intérêt que je vous adresse ma candidature pour le poste de ${jobData.jobTitle} au sein de ${jobData.companyName}. Fort de mon parcours et passionné par les défis technologiques, je suis convaincu que mon profil correspond aux exigences de votre structure.`,
      bodyParagraph: `Au cours de mes expériences professionnelles, notamment sur ${candidateData.experiences ? candidateData.experiences.slice(0, 150) : "des projets stratégiques"}, j'ai développé une solide expertise en ${candidateData.skills || "ingénierie et résolution de problèmes complexes"}. Mon parcours académique (${candidateData.education || "formation supérieure"}) m'a permis d'acquérir une rigueur méthodologique que je souhaite mettre au service des objectifs ambitieux de ${jobData.companyName}.`,
      closingParagraph: `Je serais ravi de vous rencontrer lors d'un entretien afin d'échanger plus en détail sur ma motivation et sur la manière dont mes compétences peuvent contribuer au succès de vos équipes.`,
      signoff: "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées."
    };
  }
}

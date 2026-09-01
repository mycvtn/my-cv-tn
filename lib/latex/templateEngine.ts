import fs from "fs";
import path from "path";
import { ResumeData } from "@/types/resume";
import { escapeLatex, escapeLatexUrl } from "./escapeLatex";

export interface LatexGenerationOptions {
  isWatermarked?: boolean;
  watermarkText?: string;
}

export function generateLatexResume(
  data: ResumeData, 
  options: LatexGenerationOptions = {}
): string {
  const { isWatermarked = false, watermarkText = "my-cv.tn" } = options;
  const { personalInfo, experiences, education, skills, languages, projects, certifications } = data;

  // 1. En-tête et Contacts
  const name = escapeLatex(personalInfo.fullName || "CANDIDAT");
  const jobTitle = escapeLatex(personalInfo.jobTitle || "TITRE PROFESSIONNEL");
  
  const contactParts: string[] = [];
  if (personalInfo.location) contactParts.push(escapeLatex(personalInfo.location));
  if (personalInfo.phone) contactParts.push(escapeLatex(personalInfo.phone));
  if (personalInfo.email) {
    contactParts.push(`\\href{mailto:${escapeLatexUrl(personalInfo.email)}}{${escapeLatex(personalInfo.email)}}`);
  }
  if (personalInfo.linkedin) {
    const cleanLi = personalInfo.linkedin.replace(/^https?:\/\//, "");
    contactParts.push(`\\href{https://${escapeLatexUrl(cleanLi)}}{${escapeLatex(cleanLi)}}`);
  }
  if (personalInfo.github) {
    const cleanGh = personalInfo.github.replace(/^https?:\/\//, "");
    contactParts.push(`\\href{https://${escapeLatexUrl(cleanGh)}}{${escapeLatex(cleanGh)}}`);
  }
  const contactLine = contactParts.join(" $\\cdot$ ");

  // 2. Profil Professionnel
  let summarySection = "";
  if (personalInfo.summary?.trim()) {
    summarySection = `\\section*{PROFIL PROFESSIONNEL}
${escapeLatex(personalInfo.summary.trim())}
\\vspace{0.4em}`;
  }

  // 3. Expériences Professionnelles (Style "CV Rami" avec \hfill et \rule)
  let experienceSection = "";
  if (experiences && experiences.length > 0) {
    const expBlocks = experiences.map((exp) => {
      const title = escapeLatex(exp.title);
      const company = escapeLatex(exp.company);
      const location = escapeLatex(exp.location || "");
      const date = escapeLatex(`${exp.startDate} -- ${exp.current ? "Présent" : exp.endDate}`);
      
      const bullets = (exp.bulletPoints || [])
        .filter((b) => b.trim())
        .map((b) => `  \\item ${escapeLatex(b.trim())}`)
        .join("\n");

      return `\\textbf{${title}} \\hfill {\\small\\color{darkgray} ${date}}\\\\
{\\small\\textbf{\\color{primary} ${company}}} \\hfill {\\small\\color{darkgray} ${location}}
\\begin{itemize}
${bullets}
\\end{itemize}
\\vspace{0.3em}`;
    }).join("\n");

    experienceSection = `\\section*{EXPÉRIENCES PROFESSIONNELLES}
${expBlocks}`;
  }

  // 4. Compétences Techniques
  let skillsSection = "";
  if (skills && skills.length > 0) {
    const techSkills = skills.map((s) => escapeLatex(s.name)).join(", ");
    skillsSection = `\\section*{COMPÉTENCES CLÉS \\& TECHNOLOGIES}
\\begin{itemize}
  \\item \\textbf{Technologies \\& Outils :} ${techSkills}
\\end{itemize}
\\vspace{0.3em}`;
  }

  // 5. Formation & Diplômes
  let educationSection = "";
  if (education && education.length > 0) {
    const eduBlocks = education.map((edu) => {
      const degree = escapeLatex(edu.degree);
      const inst = escapeLatex(edu.institution);
      const loc = escapeLatex(edu.location || "");
      const date = escapeLatex(`${edu.startDate} -- ${edu.current ? "En cours" : edu.endDate}`);
      const honors = edu.honors ? ` {\\small\\color{accent}(${escapeLatex(edu.honors)})}` : "";

      return `\\textbf{${degree}}${honors} \\hfill {\\small\\color{darkgray} ${date}}\\\\
{\\small ${inst}} \\hfill {\\small\\color{darkgray} ${loc}}
\\vspace{0.2em}`;
    }).join("\n");

    educationSection = `\\section*{FORMATION \\& DIPLÔMES}
${eduBlocks}`;
  }

  // 6. Projets Clés
  let projectsSection = "";
  if (projects && projects.length > 0) {
    const projBlocks = projects.map((p) => {
      const pName = escapeLatex(p.name);
      const link = p.link ? ` {\\small\\href{https://${escapeLatexUrl(p.link)}}{[${escapeLatex(p.link)}]}}` : "";
      const desc = escapeLatex(p.description);
      return `\\textbf{${pName}}${link}\\\\
{\\small ${desc}}
\\vspace{0.2em}`;
    }).join("\n");

    projectsSection = `\\section*{PROJETS CLÉS}
${projBlocks}`;
  }

  // 7. Langues & Certifications
  let languagesSection = "";
  const langParts: string[] = [];
  if (languages && languages.length > 0) {
    const langs = languages.map((l) => `${escapeLatex(l.name)} (${escapeLatex(l.level)})`).join(", ");
    langParts.push(`\\item \\textbf{Langues :} ${langs}`);
  }
  if (certifications && certifications.length > 0) {
    const certs = certifications.map((c) => `${escapeLatex(c.name)} -- ${escapeLatex(c.issuer)}`).join(", ");
    langParts.push(`\\item \\textbf{Certifications :} ${certs}`);
  }
  if (langParts.length > 0) {
    languagesSection = `\\section*{LANGUES \\& CERTIFICATIONS}
\\begin{itemize}
${langParts.join("\n")}
\\end{itemize}`;
  }

  // Filigrane répétitif en lignes diagonales à 45° sur toute la page
  const safeWm = escapeLatex(watermarkText);
  const watermarkBlock = isWatermarked ? `
\\usepackage{eso-pic}
\\usepackage{tikz}

\\AddToShipoutPictureBG{%
  \\begin{tikzpicture}[remember picture,overlay]
    \\node[rotate=35,scale=1.7,text opacity=0.22,text=black] at (current page.center) {%
      \\begin{tabular}{cccccc}
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\[1.6cm]
        \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} & \\textbf{${safeWm}} \\\\
      \\end{tabular}
    };
  \\end{tikzpicture}%
}
` : "";

  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{titlesec}
\\usepackage{xcolor}
${watermarkBlock}

\\definecolor{primary}{RGB}{15, 23, 42}
\\definecolor{accent}{RGB}{2, 132, 199}
\\definecolor{darkgray}{RGB}{75, 85, 99}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

% Titres Style CV Rami (Majuscules + Ligne continue)
\\titleformat{\\section}{\\large\\bfseries\\color{primary}\\uppercase}{}{0em}{}[\\vspace{-0.55em}\\rule{\\textwidth}{0.8pt}\\vspace{-0.3em}]
\\titlespacing*{\\section}{0pt}{9pt}{5pt}
\\setlist[itemize]{leftmargin=1.4em, itemsep=1.5pt, topsep=2pt, parsep=0pt}

\\begin{document}

\\begin{center}
  {\\Huge\\textbf{\\color{primary} ${name}}}\\\\[0.25em]
  {\\large\\textbf{\\color{accent} ${jobTitle}}}\\\\[0.35em]
  {\\small\\color{darkgray} ${contactLine}}
\\end{center}
\\vspace{0.3em}

${summarySection}
${experienceSection}
${skillsSection}
${educationSection}
${projectsSection}
${languagesSection}

\\end{document}`;
}

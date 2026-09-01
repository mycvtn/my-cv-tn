"use client";

import React from "react";
import { ResumeData } from "@/types/resume";
import { getResumeTranslation } from "@/lib/i18n/resumeTranslations";
import { 
  Mail, Phone, MapPin, Globe, Linkedin, Github, 
  Briefcase, GraduationCap, Award, Languages, Code2
} from "lucide-react";

interface Props {
  data: ResumeData;
}

export const CreativeSidebarTemplate: React.FC<Props> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certifications, settings } = data;
  const lang = settings?.language || "fr";
  const t = getResumeTranslation(lang);
  const isRTL = lang === "ar";
  const primaryColor = settings?.primaryColor || "#e11d48";

  const sidebarBgGradient = isRTL
    ? "linear-gradient(to left, #0f172a 0, #0f172a 240px, #ffffff 240px, #ffffff 100%)"
    : "linear-gradient(to right, #0f172a 0, #0f172a 240px, #ffffff 240px, #ffffff 100%)";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full min-h-[285mm] text-slate-800 shadow-md print:shadow-none flex flex-row font-sans box-border"
      style={{ 
        fontFamily: settings?.fontFamily === "mono" ? "monospace" : settings?.fontFamily === "serif" ? "serif" : "sans-serif",
        background: sidebarBgGradient,
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact"
      }}
    >
      {/* Dark Sidebar Column */}
      <div 
        className="w-[240px] min-w-[240px] max-w-[240px] text-slate-200 p-6 flex flex-col justify-start flex-shrink-0 space-y-6"
        style={{
          color: "#e2e8f0",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact"
        }}
      >
        <div className="space-y-5">
          {/* Photo */}
          {settings?.showPhoto && personalInfo.photoUrl && (
            <div className="flex justify-center break-inside-avoid">
              <div 
                className="w-28 h-28 rounded-full overflow-hidden border-4 shadow-xl"
                style={{ borderColor: primaryColor }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={personalInfo.photoUrl} 
                  alt={personalInfo.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="break-inside-avoid">
            <h3 
              className="text-[11px] font-black uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-800"
              style={{ color: primaryColor }}
            >
              Contact
            </h3>
            <div className="space-y-2 text-[11px] text-slate-300">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate leading-none">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="leading-none">{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="leading-none">{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate leading-none">{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate leading-none">{personalInfo.github.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills Section */}
          {skills && skills.length > 0 && (
            <div className="break-inside-avoid">
              <h3 
                className="text-[11px] font-black uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-800"
                style={{ color: primaryColor }}
              >
                {t.skills}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span 
                    key={s.id}
                    className="text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700/80 px-2 py-1 rounded-lg"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages Section */}
          {languages && languages.length > 0 && (
            <div className="break-inside-avoid">
              <h3 
                className="text-[11px] font-black uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-800"
                style={{ color: primaryColor }}
              >
                {t.languages}
              </h3>
              <div className="space-y-1.5 text-[11px]">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span className="font-semibold text-slate-300">{l.name}</span>
                    <span className="text-slate-400 text-[10px]">{l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {certifications && certifications.length > 0 && (
            <div className="break-inside-avoid">
              <h3 
                className="text-[11px] font-black uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-800"
                style={{ color: primaryColor }}
              >
                {t.certifications}
              </h3>
              <div className="space-y-2 text-[10px]">
                {certifications.map((c) => (
                  <div key={c.id}>
                    <div className="font-bold text-slate-200">{c.name}</div>
                    <div className="text-slate-400">{c.issuer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-7 flex flex-col space-y-5 bg-transparent">
        {/* Name Header */}
        <div className="pb-3 border-b border-slate-200 break-inside-avoid">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {personalInfo.fullName || "Votre Nom"}
          </h1>
          <div 
            className="text-sm font-bold mt-0.5"
            style={{ color: primaryColor }}
          >
            {personalInfo.jobTitle || "Titre du Poste"}
          </div>
          {personalInfo.summary && (
            <p className="text-xs text-slate-600 mt-2 leading-relaxed text-justify">
              {personalInfo.summary}
            </p>
          )}
        </div>

        {/* Experience Section */}
        {experiences && experiences.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-200 break-inside-avoid">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
              <span>{t.experiences}</span>
            </h2>

            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold text-slate-900">{exp.title}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded flex-shrink-0">
                      {exp.startDate} — {exp.current ? t.present : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>

                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700">
                      {exp.bulletPoints.map((bp, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed text-justify">
                          <span 
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <span className="flex-grow">{bp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-200 break-inside-avoid">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.education}</span>
            </h2>

            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline break-inside-avoid">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-[11px] text-slate-600 font-medium">{edu.institution} {edu.location && `• ${edu.location}`}</div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold flex-shrink-0">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <div className="space-y-2.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 pb-1 border-b border-slate-200 break-inside-avoid">
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.projects}</span>
            </h2>

            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 break-inside-avoid">
                  <div className="text-xs font-bold text-slate-900">{p.name}</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

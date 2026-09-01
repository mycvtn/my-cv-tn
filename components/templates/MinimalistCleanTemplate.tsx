"use client";

import React from "react";
import { ResumeData } from "@/types/resume";
import { getResumeTranslation } from "@/lib/i18n/resumeTranslations";
import { 
  Mail, Phone, MapPin, Globe, Linkedin, Github
} from "lucide-react";

interface Props {
  data: ResumeData;
}

export const MinimalistCleanTemplate: React.FC<Props> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certifications, settings } = data;
  const lang = settings?.language || "fr";
  const t = getResumeTranslation(lang);
  const isRTL = lang === "ar";
  const primaryColor = settings?.primaryColor || "#0f172a";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full min-h-[285mm] bg-white text-slate-900 p-10 shadow-md print:shadow-none print:p-0 flex flex-col font-sans box-border"
      style={{ fontFamily: settings?.fontFamily === "mono" ? "monospace" : settings?.fontFamily === "serif" ? "serif" : "sans-serif" }}
    >
      {/* Header */}
      <header className="pb-6 border-b border-slate-900 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            {personalInfo.fullName || "Votre Nom"}
          </h1>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-1">
            {personalInfo.jobTitle || "Titre du Poste"}
          </div>

          {personalInfo.summary && (
            <p className="text-xs text-slate-700 mt-3 leading-relaxed max-w-xl text-justify">
              {personalInfo.summary}
            </p>
          )}

          {/* Clean Contact Line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3.5 text-[11px] text-slate-600">
            {personalInfo.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                <span className="leading-none">{personalInfo.email}</span>
              </span>
            )}
            {personalInfo.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                <span className="leading-none">{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                <span className="leading-none">{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="inline-flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                <span className="leading-none">{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
              </span>
            )}
          </div>
        </div>

        {settings?.showPhoto && personalInfo.photoUrl && (
          <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-900 flex-shrink-0 grayscale">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={personalInfo.photoUrl} 
              alt={personalInfo.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Main Clean Layout */}
      <div className="grid grid-cols-3 gap-8 pt-6 flex-grow">
        {/* Left Column (2 Cols): Experiences & Projects */}
        <div className="col-span-2 space-y-6">
          {experiences && experiences.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-950 pb-1 mb-3.5 border-b border-slate-300">
                {t.experiences}
              </h2>

              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-950">{exp.title}</h3>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {exp.startDate} — {exp.current ? t.present : exp.endDate}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>

                    {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                      <ul className="mt-2 space-y-1.5 text-[11px] text-slate-700">
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

          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-950 pb-1 mb-2.5 border-b border-slate-300">
                {t.projects}
              </h2>

              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.id}>
                    <div className="text-xs font-bold text-slate-950">{p.name}</div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Skills, Education, Languages */}
        <div className="space-y-6">
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-950 pb-1 mb-2.5 border-b border-slate-300">
                {t.skills}
              </h2>

              <div className="space-y-1 text-xs font-semibold text-slate-800">
                {skills.map((s) => (
                  <div key={s.id} className="flex items-center gap-1.5">
                    <span className="text-[10px]">•</span>
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-950 pb-1 mb-2.5 border-b border-slate-300">
                {t.education}
              </h2>

              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="text-xs font-bold text-slate-950">{edu.degree}</div>
                    <div className="text-[11px] text-slate-600">{edu.institution}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{edu.startDate} — {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-950 pb-1 mb-2 border-b border-slate-300">
                {t.languages}
              </h2>

              <div className="space-y-1 text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span className="font-bold text-slate-800">{l.name}</span>
                    <span className="text-slate-500 text-[10px]">{l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-950 pb-1 mb-2 border-b border-slate-300">
                {t.certifications}
              </h2>

              <div className="space-y-1.5 text-xs">
                {certifications.map((c) => (
                  <div key={c.id}>
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-slate-500 text-[10px]">{c.issuer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

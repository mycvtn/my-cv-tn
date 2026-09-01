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

export const GradientHeaderTemplate: React.FC<Props> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certifications, settings } = data;
  const lang = settings?.language || "fr";
  const t = getResumeTranslation(lang);
  const isRTL = lang === "ar";
  const primaryColor = settings?.primaryColor || "#e11d48";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full min-h-[285mm] bg-white text-slate-800 shadow-md print:shadow-none flex flex-col font-sans box-border"
      style={{ fontFamily: settings?.fontFamily === "mono" ? "monospace" : settings?.fontFamily === "serif" ? "serif" : "sans-serif" }}
    >
      {/* Full Width Gradient Banner */}
      <div 
        className="p-8 text-white relative overflow-hidden flex items-center justify-between gap-6"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, #1e1b4b 100%)`,
          color: "#ffffff",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact"
        }}
      >
        <div className="space-y-1 relative z-10" style={{ color: "#ffffff" }}>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "#ffffff" }}>
            {personalInfo.fullName || "Votre Nom"}
          </h1>
          <div className="text-sm font-extrabold uppercase tracking-wide" style={{ color: "#fbcfe8" }}>
            {personalInfo.jobTitle || "Titre du Poste"}
          </div>

          {personalInfo.summary && (
            <p className="text-xs mt-2 leading-relaxed max-w-xl text-justify" style={{ color: "rgba(255, 255, 255, 0.92)" }}>
              {personalInfo.summary}
            </p>
          )}

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2.5 text-[11px]" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
            {personalInfo.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-white/80" />
                <span className="leading-none">{personalInfo.email}</span>
              </span>
            )}
            {personalInfo.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-white/80" />
                <span className="leading-none">{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-white/80" />
                <span className="leading-none">{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="inline-flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 flex-shrink-0 text-white/80" />
                <span className="leading-none">{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Photo */}
        {settings?.showPhoto && personalInfo.photoUrl && (
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 flex-shrink-0 shadow-2xl relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={personalInfo.photoUrl} 
              alt={personalInfo.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="p-8 grid grid-cols-3 gap-6 flex-grow">
        {/* Left Column (2 Cols) */}
        <div className="col-span-2 space-y-6">
          {/* Experiences */}
          {experiences && experiences.length > 0 && (
            <div>
              <h2 
                className="text-xs font-black uppercase tracking-wider pb-1.5 mb-3 border-b-2 flex items-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t.experiences}</span>
              </h2>

              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-900">{exp.title}</h3>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {exp.startDate} — {exp.current ? t.present : exp.endDate}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
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

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div>
              <h2 
                className="text-xs font-black uppercase tracking-wider pb-1.5 mb-2.5 border-b-2 flex items-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{t.projects}</span>
              </h2>

              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="text-xs font-bold text-slate-900">{p.name}</div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 
                className="text-xs font-black uppercase tracking-wider pb-1.5 mb-3 border-b-2 flex items-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{t.skills}</span>
              </h2>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s.id}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-slate-900 border border-rose-100"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 
                className="text-xs font-black uppercase tracking-wider pb-1.5 mb-3 border-b-2 flex items-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{t.education}</span>
              </h2>

              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="text-xs font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-[11px] font-semibold text-slate-700">{edu.institution}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{edu.startDate} — {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h2 
                className="text-xs font-black uppercase tracking-wider pb-1.5 mb-3 border-b-2 flex items-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{t.languages}</span>
              </h2>

              <div className="space-y-1.5 text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-800">{l.name}</span>
                    <span className="text-[10px] text-slate-500">{l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h2 
                className="text-xs font-black uppercase tracking-wider pb-1.5 mb-3 border-b-2 flex items-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{t.certifications}</span>
              </h2>

              <div className="space-y-2 text-xs">
                {certifications.map((c) => (
                  <div key={c.id}>
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.issuer}</div>
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

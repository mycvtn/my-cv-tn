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

export const ExecutiveLuxeTemplate: React.FC<Props> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certifications, settings } = data;
  const lang = settings?.language || "fr";
  const t = getResumeTranslation(lang);
  const isRTL = lang === "ar";
  const primaryColor = settings?.primaryColor || "#0f172a"; // Deep Slate / Luxe Charcoal

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full min-h-[285mm] bg-white text-slate-900 p-10 shadow-md print:shadow-none print:p-0 flex flex-col font-serif box-border"
      style={{ fontFamily: settings?.fontFamily === "sans" ? "sans-serif" : settings?.fontFamily === "mono" ? "monospace" : "Georgia, serif" }}
    >
      {/* Centered High-End Header */}
      <header className="text-center pb-6 border-b-2 border-slate-900">
        <h1 className="text-3xl font-normal tracking-widest text-slate-950 uppercase">
          {personalInfo.fullName || "Votre Nom"}
        </h1>

        <div className="text-xs font-semibold tracking-widest uppercase text-slate-600 mt-1.5">
          {personalInfo.jobTitle || "Cadre Dirigeant & Expert Métier"}
        </div>
        {/* Contact Info Line */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-700 font-sans mt-3.5">
          {personalInfo.email && (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="leading-none">{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="leading-none">{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="leading-none">{personalInfo.location}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="inline-flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="leading-none">{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
            </span>
          )}
        </div>

        {personalInfo.summary && (
          <p className="text-xs text-slate-700 italic mt-3 max-w-2xl mx-auto leading-relaxed text-center font-serif">
            « {personalInfo.summary} »
          </p>
        )}
      </header>

      {/* Main Content Layout */}
      <div className="pt-6 space-y-6 flex-grow">
        {/* Core Expertise / Skills Grid */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-1 mb-2.5 border-b border-slate-300 font-sans">
              {t.skills} & Domaines d'Expertise
            </h2>
            <div className="grid grid-cols-3 gap-2 font-sans text-xs text-slate-800">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                  <span className="font-semibold">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Experience Section */}
        {experiences && experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-1 mb-3 border-b border-slate-300 font-sans">
              {t.experiences}
            </h2>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-baseline justify-between font-sans">
                    <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wide">
                      {exp.title}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {exp.startDate} — {exp.current ? t.present : exp.endDate}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 italic mt-0.5">
                    {exp.company} {exp.location && `— ${exp.location}`}
                  </div>

                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-800 font-sans">
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

        {/* Education & Qualifications */}
        {education && education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-1 mb-3 border-b border-slate-300 font-sans">
              {t.education}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="text-xs font-bold text-slate-950">{edu.degree}</div>
                  <div className="text-xs text-slate-700 font-serif italic">{edu.institution} {edu.location && `• ${edu.location}`}</div>
                  <div className="text-[10px] text-slate-500 font-sans font-medium mt-0.5">
                    Promotion {edu.startDate} — {edu.endDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-Columns Bottom: Languages & Certifications */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-1 mb-2 border-b border-slate-300 font-sans">
                {t.languages}
              </h2>
              <div className="space-y-1 font-sans text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span className="font-semibold text-slate-800">{l.name}</span>
                    <span className="text-slate-600">{l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 pb-1 mb-2 border-b border-slate-300 font-sans">
                {t.certifications}
              </h2>
              <div className="space-y-1 font-sans text-xs">
                {certifications.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span className="font-semibold text-slate-800">{c.name}</span>
                    <span className="text-slate-600">{c.issuer}</span>
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

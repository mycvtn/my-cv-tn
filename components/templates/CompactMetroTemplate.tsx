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

export const CompactMetroTemplate: React.FC<Props> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certifications, settings } = data;
  const lang = settings?.language || "fr";
  const t = getResumeTranslation(lang);
  const isRTL = lang === "ar";
  const primaryColor = settings?.primaryColor || "#4f46e5"; // Indigo / Metro Blue

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full min-h-[285mm] bg-white text-slate-900 p-8 shadow-md print:shadow-none print:p-0 flex flex-col font-sans box-border"
      style={{ fontFamily: settings?.fontFamily === "mono" ? "monospace" : settings?.fontFamily === "serif" ? "serif" : "sans-serif" }}
    >
      {/* Metro Header Box */}
      <header 
        className="p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-6 shadow-sm"
        style={{
          backgroundColor: "#0f172a",
          color: "#ffffff",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact"
        }}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            {personalInfo.fullName || "Votre Nom"}
          </h1>
          <div 
            className="text-xs font-extrabold uppercase tracking-wider"
            style={{ color: "#38bdf8" }}
          >
            {personalInfo.jobTitle || "Titre du Poste"}
          </div>

          {personalInfo.summary && (
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed max-w-xl text-justify">
              {personalInfo.summary}
            </p>
          )}

          {/* Inline Compact Contacts */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-[10px] text-slate-300">
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
            {personalInfo.github && (
              <span className="inline-flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="leading-none">{personalInfo.github.replace(/^https?:\/\//, "")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Photo */}
        {settings?.showPhoto && personalInfo.photoUrl && (
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-700 flex-shrink-0 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={personalInfo.photoUrl} 
              alt={personalInfo.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Modern Grid Body */}
      <div className="pt-6 grid grid-cols-12 gap-6 flex-grow">
        {/* Left Column (7 cols): Experiences & Projects */}
        <div className="col-span-7 space-y-5">
          {/* Experiences */}
          {experiences && experiences.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b-2 border-slate-900">
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-slate-900" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.experiences}
                </h2>
              </div>

              <div className="space-y-3.5">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-900">{exp.title}</h3>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
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
              <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b-2 border-slate-900">
                <Code2 className="w-3.5 h-3.5 text-slate-900" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.projects}
                </h2>
              </div>

              <div className="space-y-2">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-2.5 border border-slate-200 rounded-xl">
                    <div className="text-xs font-bold text-slate-900">{proj.name}</div>
                    <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Skills, Education, Languages */}
        <div className="col-span-5 space-y-5">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b-2 border-slate-900">
                <Award className="w-3.5 h-3.5 text-slate-900" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.skills}
                </h2>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s.id}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white"
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
              <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b-2 border-slate-900">
                <GraduationCap className="w-3.5 h-3.5 text-slate-900" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.education}
                </h2>
              </div>

              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-[10px] font-semibold text-slate-700">{edu.institution} {edu.location && `• ${edu.location}`}</div>
                    <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                      {edu.startDate} — {edu.endDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b-2 border-slate-900">
                <Languages className="w-3.5 h-3.5 text-slate-900" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.languages}
                </h2>
              </div>

              <div className="space-y-1.5 text-xs">
                {languages.map((l) => (
                  <div key={l.id} className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-800">{l.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b-2 border-slate-900">
                <Award className="w-3.5 h-3.5 text-slate-900" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.certifications}
                </h2>
              </div>

              <div className="space-y-1.5 text-xs">
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

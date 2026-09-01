"use client";

import React from "react";
import { ResumeData } from "@/types/resume";
import { getResumeTranslation } from "@/lib/i18n/resumeTranslations";
import { 
  Mail, Phone, MapPin, Globe, Linkedin, Github, 
  Calendar, Briefcase, GraduationCap, Code2, Award, Languages
} from "lucide-react";

interface Props {
  data: ResumeData;
}

export const ModernTechTemplate: React.FC<Props> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certifications, settings } = data;
  const lang = settings?.language || "fr";
  const t = getResumeTranslation(lang);
  const isRTL = lang === "ar";
  const primaryColor = settings?.primaryColor || "#0284c7"; // Modern Tech Sky/Blue default

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full min-h-[285mm] bg-white text-slate-800 p-8 shadow-md print:shadow-none print:p-0 flex flex-col font-sans box-border relative overflow-hidden"
      style={{ fontFamily: settings?.fontFamily === "mono" ? "monospace" : settings?.fontFamily === "serif" ? "serif" : "sans-serif" }}
    >
      {/* Top Accent Geometric Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-2.5"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Header */}
      <header className="pt-2 pb-6 border-b border-slate-200 flex items-start justify-between gap-6">
        <div className="flex-grow">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {personalInfo.fullName || "Votre Nom"}
            </h1>
            <span 
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: primaryColor }}
            >
              PRO
            </span>
          </div>

          <p className="text-base font-bold text-slate-700 mt-1">
            {personalInfo.jobTitle || "Titre du Poste"}
          </p>

          {personalInfo.summary && (
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed max-w-xl text-justify">
              {personalInfo.summary}
            </p>
          )}

          {/* Contact Bar with modern chips */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3.5 text-[11px] text-slate-600 font-medium">
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
          <div 
            className="w-24 h-24 rounded-2xl overflow-hidden border-2 shadow-lg flex-shrink-0"
            style={{ borderColor: primaryColor }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={personalInfo.photoUrl} 
              alt={personalInfo.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Main Grid: 2 Columns */}
      <div className="p-8 grid grid-cols-3 gap-8 flex-grow">
        {/* Left Column (2 Cols) */}
        <div className="col-span-2 space-y-6">
          {/* Experience Timeline */}
          {experiences && experiences.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {t.experiences}
                </h2>
              </div>

              <div className={`space-y-4 ${isRTL ? "border-r-2 pr-3.5 mr-1" : "border-l-2 pl-3.5 ml-1"} border-slate-200`}>
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative">
                    {/* Dot on timeline */}
                    <span 
                      className={`absolute ${isRTL ? "-right-[19px]" : "-left-[19px]"} top-1 w-2.5 h-2.5 rounded-full border-2 border-white`}
                      style={{ backgroundColor: primaryColor }}
                    />
                    
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-xs font-black text-slate-900">{exp.title}</h3>
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                        {exp.startDate} — {exp.current ? t.present : exp.endDate}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-slate-700 mt-0.5">
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

          {/* Key Projects Section */}
          {projects && projects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                <div 
                  className="p-1 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Code2 className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.projects}
                </h2>
              </div>

              <div className="space-y-2.5">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{proj.name}</span>
                      {proj.link && (
                        <span className="text-[10px] text-sky-600 font-medium">{proj.link.replace(/^https?:\/\//, "")}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="text-[9px] font-semibold bg-white text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Education, Skills, Languages, Certifs */}
        <div className="space-y-5">
          {/* Skills Section (Chips) */}
          {skills && skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                <div 
                  className="p-1 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Award className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.skills}
                </h2>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {education && education.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                <div 
                  className="p-1 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.education}
                </h2>
              </div>

              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="text-xs font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-[11px] font-semibold text-slate-700">{edu.institution}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {edu.startDate} — {edu.current ? t.present : edu.endDate} {edu.location && `• ${edu.location}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Section */}
          {languages && languages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                <div 
                  className="p-1 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Languages className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.languages}
                </h2>
              </div>

              <div className="space-y-1.5">
                {languages.map((langItem) => (
                  <div key={langItem.id} className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{langItem.name}</span>
                    <span className="text-slate-500 font-medium">{langItem.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {certifications && certifications.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                <div 
                  className="p-1 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Award className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {t.certifications}
                </h2>
              </div>

              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div key={cert.id} className="text-[11px]">
                    <div className="font-bold text-slate-800">{cert.name}</div>
                    <div className="text-[10px] text-slate-500">{cert.issuer} {cert.date && `• ${cert.date}`}</div>
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

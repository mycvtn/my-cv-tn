"use client";

import React from "react";
import { ResumeData } from "@/types/resume";
import { getResumeTranslation } from "@/lib/i18n/resumeTranslations";
import { 
  Mail, Phone, MapPin, Globe, Linkedin, Github, 
  Calendar, Award, Briefcase, GraduationCap, Code2, Languages, CheckCircle2, User, Sparkles
} from "lucide-react";

interface Props {
  data: ResumeData;
}

export const NordicLightTemplate: React.FC<Props> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certifications, settings } = data;
  const lang = settings?.language || "fr";
  const t = getResumeTranslation(lang);
  const isRTL = lang === "ar";
  const primaryColor = settings?.primaryColor || "#2563eb"; // Elegant Nordic Blue

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full min-h-[285mm] bg-white text-slate-900 p-8 shadow-md print:shadow-none print:p-0 flex flex-col font-sans box-border"
      style={{ fontFamily: settings?.fontFamily === "mono" ? "monospace" : settings?.fontFamily === "serif" ? "serif" : "sans-serif" }}
    >
      {/* Top Pure Light Header Banner */}
      <header className="bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-50 border border-slate-200/80 rounded-3xl p-6 mb-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between gap-6">
          <div className="space-y-2 flex-grow">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white border border-slate-200 text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
              {personalInfo.jobTitle || "Professionnel"}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              {personalInfo.fullName || "Votre Nom & Prénom"}
            </h1>

            {personalInfo.summary && (
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl text-justify pt-1">
                {personalInfo.summary}
              </p>
            )}

            {/* Contact Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-600">
              {personalInfo.email && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span>{personalInfo.email}</span>
                </span>
              )}
              {personalInfo.phone && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span>{personalInfo.phone}</span>
                </span>
              )}
              {personalInfo.location && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span>{personalInfo.location}</span>
                </span>
              )}
              {personalInfo.linkedin && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                  <Linkedin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span>{personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
                </span>
              )}
              {personalInfo.github && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                  <Github className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span>{personalInfo.github.replace(/^https?:\/\//, "")}</span>
                </span>
              )}
            </div>
          </div>

          {/* Photo Avatar */}
          {settings?.showPhoto && personalInfo.photoUrl && (
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 ring-4 ring-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={personalInfo.photoUrl} 
                alt={personalInfo.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="grid grid-cols-12 gap-6 flex-grow">
        {/* Left Column (4 Cols): Skills, Education, Languages, Certifications */}
        <div className="col-span-4 space-y-6">
          {/* Skills Section */}
          {skills && skills.length > 0 && (
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Code2 className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {t.skills}
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-700 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {education && education.length > 0 && (
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <GraduationCap className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {t.education}
                </h2>
              </div>
              <div className="space-y-3 pt-1">
                {education.map((edu) => (
                  <div key={edu.id} className="text-left space-y-0.5">
                    <h3 className="text-[11px] font-bold text-slate-900 leading-snug">{edu.degree}</h3>
                    <div className="text-[10px] font-semibold" style={{ color: primaryColor }}>
                      {edu.institution}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      {edu.startDate} — {edu.current ? t.present : edu.endDate} {edu.location ? `• ${edu.location}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Section */}
          {languages && languages.length > 0 && (
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Languages className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {t.languages}
                </h2>
              </div>
              <div className="space-y-2 pt-1">
                {languages.map((langItem) => (
                  <div key={langItem.id} className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-slate-800">{langItem.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">
                      {langItem.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {certifications && certifications.length > 0 && (
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Award className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {t.certifications}
                </h2>
              </div>
              <div className="space-y-2 pt-1">
                {certifications.map((cert) => (
                  <div key={cert.id} className="text-[10px]">
                    <div className="font-bold text-slate-900">{cert.name}</div>
                    <div className="text-[9px] text-slate-500">{cert.issuer} {cert.date ? `(${cert.date})` : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (8 Cols): Experiences & Projects */}
        <div className="col-span-8 space-y-6">
          {/* Experiences Section */}
          {experiences && experiences.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-100">
                <Briefcase className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-950">
                  {t.experiences}
                </h2>
              </div>

              <div className="space-y-5">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2 border-slate-200/80 space-y-1.5">
                    {/* Timeline indicator point */}
                    <div 
                      className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border border-white"
                      style={{ backgroundColor: primaryColor }}
                    />

                    <div className="flex flex-wrap justify-between items-baseline gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-950">{exp.title}</h3>
                        <div className="text-[11px] font-semibold" style={{ color: primaryColor }}>
                          {exp.company} {exp.contractType ? `(${exp.contractType})` : ""}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {exp.startDate} — {exp.current ? t.present : exp.endDate}
                      </span>
                    </div>

                    {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                      <ul className="list-disc list-outside ml-3.5 space-y-1 text-[11px] text-slate-700 leading-relaxed pt-1">
                        {exp.bulletPoints.map((bp, i) => (
                          <li key={i}>{bp}</li>
                        ))}
                      </ul>
                    )}

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {exp.technologies.map((tech, idx) => (
                          <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {projects && projects.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-100">
                <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-950">
                  {t.projects}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3.5 bg-slate-50/60 border border-slate-200/80 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                      {proj.link && (
                        <span className="text-[10px] font-semibold text-blue-600 hover:underline">
                          {proj.link.replace(/^https?:\/\//, "")}
                        </span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-[11px] text-slate-600 leading-relaxed">{proj.description}</p>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((tItem, tIdx) => (
                          <span key={tIdx} className="text-[9px] bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-semibold shadow-2xs">
                            {tItem}
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
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { ResumeData } from "@/types/resume";
import { getResumeTranslation } from "@/lib/i18n/resumeTranslations";

interface Props {
  data: ResumeData;
}

export const ClassicRawTemplate: React.FC<Props> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certifications, settings } = data;
  const lang = settings?.language || "fr";
  const t = getResumeTranslation(lang);
  const isRTL = lang === "ar";

  // Build simple inline contact list
  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.location) contactParts.push(personalInfo.location);
  if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin.replace(/^https?:\/\//, ""));
  if (personalInfo.github) contactParts.push(personalInfo.github.replace(/^https?:\/\//, ""));

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full min-h-[285mm] bg-white text-black p-10 shadow-md print:shadow-none print:p-0 flex flex-col font-serif box-border leading-normal"
      style={{ fontFamily: settings?.fontFamily === "sans" ? "Arial, sans-serif" : settings?.fontFamily === "mono" ? "monospace" : "Georgia, 'Times New Roman', serif" }}
    >
      {/* Centered Classic Header (No Icons, No Colors, No Backgrounds) */}
      <header className="text-center pb-4 mb-4 border-b-2 border-black">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
          {personalInfo.fullName || "VOTRE NOM COMPLET"}
        </h1>

        {personalInfo.jobTitle && (
          <div className="text-sm font-semibold uppercase tracking-wide text-black mt-1">
            {personalInfo.jobTitle}
          </div>
        )}

        {contactParts.length > 0 && (
          <div className="text-xs text-black mt-2 flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5">
            {contactParts.map((part, idx) => (
              <React.Fragment key={idx}>
                <span>{part}</span>
                {idx < contactParts.length - 1 && <span className="text-black/60 font-bold">•</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <div className="space-y-4 text-xs">
        {/* Summary */}
        {personalInfo.summary?.trim() && (
          <div>
            <h2 className="font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 text-xs">
              {t.summary}
            </h2>
            <p className="text-justify text-black leading-relaxed text-[11px]">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experiences */}
        {experiences && experiences.length > 0 && (
          <div>
            <h2 className="font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2 text-xs">
              {t.experiences}
            </h2>

            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-bold text-xs text-black">
                    <div>
                      <span>{exp.title}</span>
                      <span className="font-normal italic text-black"> — {exp.company}</span>
                      {exp.contractType && <span className="font-normal text-[10px]"> ({exp.contractType})</span>}
                    </div>
                    <div className="text-[11px] font-normal whitespace-nowrap text-right">
                      {exp.startDate} – {exp.current ? t.present : exp.endDate}
                      {exp.location ? `, ${exp.location}` : ""}
                    </div>
                  </div>

                  {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-[11px] text-black leading-relaxed pt-1">
                      {exp.bulletPoints.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                  )}

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="text-[10px] italic text-black pt-1">
                      Technologies : {exp.technologies.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <h2 className="font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2 text-xs">
              {t.education}
            </h2>

            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-black">{edu.degree}</span>
                    <span className="font-normal italic text-black">, {edu.institution}</span>
                  </div>
                  <div className="text-[11px] font-normal text-right whitespace-nowrap">
                    {edu.startDate} – {edu.current ? t.present : edu.endDate}
                    {edu.location ? `, ${edu.location}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills (Pure Inline Text) */}
        {skills && skills.length > 0 && (
          <div>
            <h2 className="font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 text-xs">
              {t.skills}
            </h2>
            <p className="text-[11px] text-black leading-relaxed">
              <span className="font-bold">Compétences techniques & outils : </span>
              {skills.map((s) => s.name).join(", ")}
            </p>
          </div>
        )}

        {/* Languages (Pure Inline Text) */}
        {languages && languages.length > 0 && (
          <div>
            <h2 className="font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 text-xs">
              {t.languages}
            </h2>
            <p className="text-[11px] text-black leading-relaxed">
              {languages.map((l) => `${l.name} (${l.level})`).join(" • ")}
            </p>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2 text-xs">
              {t.projects}
            </h2>

            <div className="space-y-1.5">
              {projects.map((proj) => (
                <div key={proj.id} className="text-[11px]">
                  <div className="font-bold text-black">
                    {proj.name}
                    {proj.link && <span className="font-normal italic"> ({proj.link.replace(/^https?:\/\//, "")})</span>}
                  </div>
                  {proj.description && <p className="text-black">{proj.description}</p>}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[10px] italic text-black">
                      Technologies : {proj.technologies.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1.5 text-xs">
              {t.certifications}
            </h2>
            <ul className="list-disc list-outside ml-4 space-y-0.5 text-[11px] text-black">
              {certifications.map((cert) => (
                <li key={cert.id}>
                  <span className="font-bold">{cert.name}</span> — {cert.issuer} {cert.date ? `(${cert.date})` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

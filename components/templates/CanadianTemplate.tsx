import React from "react";
import { ResumeData } from "@/types/resume";
import { MapPin, Phone, Mail, Linkedin, Github } from "lucide-react";
import { getResumeLabels } from "@/lib/i18n/resumeTranslations";

interface Props {
  data: ResumeData;
}

export const CanadianTemplate: React.FC<Props> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certifications, settings } = data;
  const primaryColor = settings?.primaryColor || "#0f172a";
  const lang = settings?.language || "fr";
  const isRTL = lang === "ar";
  const labels = getResumeLabels(lang);

  const contactItems: { id: string; icon: React.ReactNode; text: string; isBold?: boolean }[] = [];

  if (personalInfo.location) {
    contactItems.push({
      id: "loc",
      icon: <MapPin className={`w-3 h-3 text-slate-500 inline-block align-[-2px] ${isRTL ? "ml-1" : "mr-1"}`} />,
      text: personalInfo.location,
    });
  }
  if (personalInfo.phone) {
    contactItems.push({
      id: "tel",
      icon: <Phone className={`w-3 h-3 text-slate-500 inline-block align-[-2px] ${isRTL ? "ml-1" : "mr-1"}`} />,
      text: personalInfo.phone,
    });
  }
  if (personalInfo.email) {
    contactItems.push({
      id: "mail",
      icon: <Mail className={`w-3 h-3 text-slate-500 inline-block align-[-2px] ${isRTL ? "ml-1" : "mr-1"}`} />,
      text: personalInfo.email,
      isBold: true,
    });
  }
  if (personalInfo.linkedin) {
    contactItems.push({
      id: "li",
      icon: <Linkedin className={`w-3 h-3 text-slate-500 inline-block align-[-2px] ${isRTL ? "ml-1" : "mr-1"}`} />,
      text: personalInfo.linkedin,
    });
  }
  if (personalInfo.github) {
    contactItems.push({
      id: "gh",
      icon: <Github className={`w-3 h-3 text-slate-500 inline-block align-[-2px] ${isRTL ? "ml-1" : "mr-1"}`} />,
      text: personalInfo.github,
    });
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`w-full text-slate-900 font-sans text-[10.5px] leading-relaxed p-6 sm:p-7 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      {/* Header */}
      <div className="text-center pb-3 mb-3 border-b-2" style={{ borderColor: primaryColor }}>
        <h1 className="text-2xl font-black tracking-tight uppercase text-slate-950 mb-0.5">
          {personalInfo.fullName}
        </h1>
        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: primaryColor }}>
          {personalInfo.jobTitle}
        </div>

        {/* Contact Row */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
          {contactItems.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1">
              {item.icon}
              <span className="leading-none">{item.text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <section className="mb-3 break-inside-avoid">
          <h2
            className="text-[11px] font-bold uppercase tracking-wider mb-1 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: primaryColor }}
          >
            {labels.summary}
          </h2>
          <p className="text-slate-800 text-[10px] text-justify leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {experiences && experiences.length > 0 && (
        <section className="mb-3">
          <h2
            className="text-[11px] font-bold uppercase tracking-wider mb-2 pb-0.5 border-b break-inside-avoid"
            style={{ color: primaryColor, borderColor: primaryColor }}
          >
            {labels.experience}
          </h2>
          <div className="space-y-2.5">
            {experiences.map((exp) => (
              <div key={exp.id} className="break-inside-avoid">
                <div className="flex justify-between items-baseline font-bold text-slate-950 text-[10.5px]">
                  <span>
                    {exp.title}
                    <span className="font-normal text-slate-700"> — {exp.company}</span>
                  </span>
                  <span className="text-[9.5px] font-medium text-slate-500 flex-shrink-0">
                    {exp.startDate} – {exp.current ? labels.present : exp.endDate}
                  </span>
                </div>
                <div className="text-[9.5px] text-slate-500 italic mb-1">
                  {exp.location} {exp.contractType ? `• ${exp.contractType}` : ""}
                </div>
                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                  <ul className="mt-1 space-y-1 text-slate-800 text-[10px]">
                    {exp.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-relaxed text-justify">
                        <span 
                          className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
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
        </section>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <section className="mb-3 break-inside-avoid">
          <h2
            className="text-[11px] font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: primaryColor }}
          >
            {labels.education}
          </h2>
          <div className="space-y-1.5">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <div className="font-bold text-slate-950 text-[10px]">
                    {edu.degree}
                    {edu.honors ? <span className="font-medium text-slate-600 text-[9.5px]"> ({edu.honors})</span> : null}
                  </div>
                  <div className="text-[9.5px] text-slate-600">{edu.institution}, {edu.location}</div>
                </div>
                <span className="text-[9.5px] font-medium text-slate-500 flex-shrink-0">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section className="mb-3 break-inside-avoid">
          <h2
            className="text-[11px] font-bold uppercase tracking-wider mb-1 pb-0.5 border-b"
            style={{ color: primaryColor, borderColor: primaryColor }}
          >
            {labels.skills}
          </h2>
          <div className="flex flex-wrap gap-1 text-[9.5px] text-slate-800 pt-0.5">
            {skills.map((skill, idx) => (
              <span
                key={skill.id}
                className="bg-slate-100/90 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 font-medium"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Languages & Projects Row */}
      <div className="grid grid-cols-2 gap-4 break-inside-avoid">
        {languages && languages.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase tracking-wider mb-1 pb-0.5 border-b"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              {labels.languages}
            </h2>
            <div className="space-y-0.5 text-[9.5px] text-slate-800">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="font-semibold text-slate-900">{l.name}</span>
                  <span className="text-slate-500">{l.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications && certifications.length > 0 && (
          <section>
            <h2
              className="text-[11px] font-bold uppercase tracking-wider mb-1 pb-0.5 border-b"
              style={{ color: primaryColor, borderColor: primaryColor }}
            >
              {labels.certifications}
            </h2>
            <div className="space-y-0.5 text-[9.5px] text-slate-800">
              {certifications.map((c) => (
                <div key={c.id} className="flex justify-between">
                  <span className="font-semibold text-slate-900">{c.name}</span>
                  <span className="text-slate-500">{c.issuer}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

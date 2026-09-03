"use client";

import React from "react";
import { ResumeData } from "@/types/resume";
import { TunisianTemplate } from "./TunisianTemplate";
import { EuropassTemplate } from "./EuropassTemplate";
import { CanadianTemplate } from "./CanadianTemplate";
import { ModernTechTemplate } from "./ModernTechTemplate";
import { ExecutiveLuxeTemplate } from "./ExecutiveLuxeTemplate";
import { CreativeSidebarTemplate } from "./CreativeSidebarTemplate";
import { CompactMetroTemplate } from "./CompactMetroTemplate";
import { GradientHeaderTemplate } from "./GradientHeaderTemplate";
import { MinimalistCleanTemplate } from "./MinimalistCleanTemplate";
import { NordicLightTemplate } from "./NordicLightTemplate";
import { ClassicRawTemplate } from "./ClassicRawTemplate";
import { FileText } from "lucide-react";

interface Props {
  data: ResumeData;
  scale?: number;
}

export const TemplateRenderer: React.FC<Props> = ({ data, scale = 1 }) => {
  const templateId = data?.settings?.template || "tunisian";

  const renderTemplateContent = () => {
    switch (templateId) {
      // Pro ATS Models
      case "canadian":
        return <CanadianTemplate data={data} />;
      case "europass":
        return <EuropassTemplate data={data} />;
      case "tunisian":
        return <TunisianTemplate data={data} />;
      case "classic_raw":
        return <ClassicRawTemplate data={data} />;
      
      // Modern & Creative Models
      case "modern_tech":
        return <ModernTechTemplate data={data} />;
      case "executive_luxe":
        return <ExecutiveLuxeTemplate data={data} />;
      case "creative_sidebar":
        return <CreativeSidebarTemplate data={data} />;
      case "compact_metro":
        return <CompactMetroTemplate data={data} />;
      case "gradient_header":
        return <GradientHeaderTemplate data={data} />;
      case "minimalist_clean":
        return <MinimalistCleanTemplate data={data} />;
      case "nordic_light":
        return <NordicLightTemplate data={data} />;
      default:
        return <TunisianTemplate data={data} />;
    }
  };

  return (
    <div
      className="flex flex-col items-center select-none origin-top transition-transform duration-150"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      {/* Top Document Summary Pill */}
      <div className="export-ignore mb-4 bg-slate-900/90 text-slate-200 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm border border-slate-700">
        <FileText className="w-3.5 h-3.5 text-rose-400" />
        <span>Format A4 Professionnel (Marges 3 mm)</span>
      </div>

      {/* Clean A4 Sheet Wrapper (Exact 3mm Margins All Around) */}
      <div
        id="resume-sheet-preview"
        className="w-full max-w-[794px] bg-white rounded-lg shadow-sheet border border-slate-200/80 overflow-hidden mx-auto transition-all p-[3mm] text-slate-900"
        style={{
          minHeight: "1123px",
        }}
      >
        {renderTemplateContent()}
      </div>
    </div>
  );
};

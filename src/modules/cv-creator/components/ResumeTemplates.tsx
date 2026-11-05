import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Share2, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Check, 
  MessageSquare,
  User
} from 'lucide-react';
import type { ResumeData, CvTemplateId, CvThemeColor } from '../types/cvCreatorTypes';

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

interface ResumeTemplatesProps {
  data: ResumeData;
  templateId: CvTemplateId;
  themeColor: CvThemeColor;
  customHex?: string;
}

export const COLOR_PALETTES: Record<CvThemeColor, { primary: string; secondary: string; bgSoft: string; border: string }> = {
  slate: { primary: '#2c3240', secondary: '#475569', bgSoft: '#f1f5f9', border: '#cbd5e1' },
  teal: { primary: '#00a896', secondary: '#028090', bgSoft: '#e6fffa', border: '#99f6e4' },
  blue: { primary: '#1e40af', secondary: '#3b82f6', bgSoft: '#eff6ff', border: '#bfdbfe' },
  emerald: { primary: '#047857', secondary: '#10b981', bgSoft: '#ecfdf5', border: '#a7f3d0' },
  crimson: { primary: '#be123c', secondary: '#e11d48', bgSoft: '#fff1f2', border: '#fecdd3' },
  purple: { primary: '#6d28d9', secondary: '#8b5cf6', bgSoft: '#f5f3ff', border: '#ddd6fe' },
  custom: { primary: '#00a896', secondary: '#028090', bgSoft: '#e6fffa', border: '#99f6e4' },
};

export const ResumeTemplateView: React.FC<ResumeTemplatesProps> = ({
  data,
  templateId,
  themeColor,
  customHex,
}) => {
  const { personal, experience, education, skills, languages, certifications, references } = data;
  
  const palette = themeColor === 'custom' && customHex 
    ? { primary: customHex, secondary: customHex, bgSoft: '#f8fafc', border: '#e2e8f0' }
    : COLOR_PALETTES[themeColor] || COLOR_PALETTES.teal;

  const primaryColor = palette.primary;

  // Placeholder avatar if user has not uploaded a photo
  const avatarUrl = personal.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';

  // =========================================================================
  // TEMPLATE 1: DUAL-TONE SIDEBAR (Galena Micheal Style)
  // Dark top header, light-grey sidebar with pill-frame photo and black badge icons
  // =========================================================================
  if (templateId === 'dual-tone-sidebar') {
    return (
      <div 
        id="cv-printable-document"
        className="w-full bg-white text-slate-800 shadow-xl min-h-[1120px] font-sans text-left flex flex-col relative overflow-hidden"
      >
        {/* Top Dark Header */}
        <div 
          className="w-full py-8 px-10 text-white flex justify-between items-center"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="w-1/3" />
          <div className="w-2/3 pl-8 space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {personal.fullName || 'Galena Micheal'}
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-white/80">
              {personal.jobTitle || 'BACHELOR OF ARTS IN EDUCATION'}
            </p>
          </div>
        </div>

        {/* 2-Column Split Body */}
        <div className="flex-1 flex">
          
          {/* Left Sidebar (Light Grey) */}
          <div className="w-[35%] bg-slate-100 p-6 sm:p-8 space-y-6 flex flex-col justify-between border-r border-slate-200">
            <div className="space-y-6">
              
              {/* Pill-shaped profile photo overlapping header */}
              <div className="-mt-20 mb-4 flex justify-center">
                <div className="w-36 h-48 rounded-[48px] overflow-hidden border-4 border-white shadow-xl bg-slate-300">
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Contact Block */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <Phone className="w-3 h-3" />
                  </div>
                  <h3 className="font-extrabold text-xs tracking-wider uppercase text-slate-900">CONTACT</h3>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1.5 pl-1 leading-relaxed">
                  {personal.location && <p className="font-medium">{personal.location}</p>}
                  {personal.phone && <p>{personal.phone}</p>}
                  {personal.whatsapp && <p>WA: {personal.whatsapp}</p>}
                  {personal.email && <p className="break-all">{personal.email}</p>}
                  {personal.website && <p className="break-all">{personal.website}</p>}
                  {personal.linkedin && <p className="break-all">in/{personal.linkedin}</p>}
                </div>
              </div>

              {/* Languages with horizontal progress bars */}
              {languages && languages.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center">
                      <MessageSquare className="w-3 h-3" />
                    </div>
                    <h3 className="font-extrabold text-xs tracking-wider uppercase text-slate-900">LANGUAGES</h3>
                  </div>
                  <div className="space-y-2.5 pl-1">
                    {languages.map((lang) => (
                      <div key={lang.id} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                          <span>{lang.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{lang.proficiency || `${lang.percent || 90}%`}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${lang.percent || 85}%`,
                              backgroundColor: primaryColor 
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills with Checkmark Icons */}
              {skills && skills.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="font-extrabold text-xs tracking-wider uppercase text-slate-900">SKILLS</h3>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom URL */}
            <div className="pt-4 border-t border-slate-200 text-center">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                {personal.website || 'WWW.SIFTX.APP'}
              </span>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="w-[65%] p-8 space-y-6">
            
            {/* Summary */}
            {personal.summary && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </div>
                  <h3 className="font-black text-xs tracking-wider uppercase text-slate-900">SUMMARY</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal pl-1">
                  {personal.summary}
                </p>
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <GraduationCap className="w-3 h-3" />
                  </div>
                  <h3 className="font-black text-xs tracking-wider uppercase text-slate-900">EDUCATION</h3>
                </div>
                <div className="space-y-3 pl-1">
                  {education.map((edu) => (
                    <div key={edu.id} className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-900">{edu.institution}</h4>
                      <p className="text-[11px] italic text-slate-600">
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {edu.startDate} – {edu.endDate} {edu.gpa ? `· GPA: ${edu.gpa}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <Briefcase className="w-3 h-3" />
                  </div>
                  <h3 className="font-black text-xs tracking-wider uppercase text-slate-900">EXPERIENCE</h3>
                </div>
                <div className="space-y-4 pl-1">
                  {experience.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs text-slate-900">
                          {exp.company}, <span className="font-semibold text-slate-700">{exp.position}</span>
                        </h4>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </p>
                      <div className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line pl-2 border-l-2 border-slate-200">
                        {exp.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center">
                    <Award className="w-3 h-3" />
                  </div>
                  <h3 className="font-black text-xs tracking-wider uppercase text-slate-900">CERTIFICATIONS</h3>
                </div>
                <div className="space-y-1.5 pl-1">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-baseline gap-2 text-[11px] text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0 mt-1" />
                      <span>
                        <strong className="font-bold text-slate-900">{cert.title}</strong>
                        {cert.issuer && ` — ${cert.issuer}`}
                        {cert.year && ` (${cert.year})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Accent Line */}
            <div className="pt-8 mt-auto">
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>

          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 2: TEAL GEOMETRIC WAVE (Taya Miass Style)
  // Dynamic curved/angular header, circular photo, squircle contact, banner pills
  // =========================================================================
  if (templateId === 'teal-geometric') {
    return (
      <div 
        id="cv-printable-document"
        className="w-full bg-white text-slate-800 shadow-xl min-h-[1120px] font-sans text-left relative overflow-hidden flex flex-col"
      >
        {/* Top Geometric Wave Banner (SVG Header) */}
        <div className="relative w-full h-36 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
            <path d="M0,0 L800,0 L800,100 L500,140 L0,70 Z" fill={primaryColor} />
            <path d="M0,70 L500,140 L800,100 L800,130 L450,160 L0,100 Z" fill={primaryColor} opacity="0.3" />
          </svg>
        </div>

        {/* Body Split Container */}
        <div className="px-8 sm:px-12 pb-10 flex-1 grid grid-cols-12 gap-8 items-start relative z-10 -mt-16">
          
          {/* Left Column (5 cols) */}
          <div className="col-span-5 space-y-6">
            
            {/* Big Circular Photo with Thick Accent Ring */}
            <div className="flex justify-start">
              <div 
                className="w-36 h-36 rounded-full p-1.5 shadow-xl bg-white"
                style={{ border: `4px solid ${primaryColor}` }}
              >
                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>

            {/* Name & Title */}
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                {personal.fullName || 'Taya Miass'}
              </h1>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {personal.jobTitle || 'Graphic Designer'}
              </p>
              {personal.summary && (
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  {personal.summary}
                </p>
              )}
            </div>

            {/* Contact Squircles */}
            <div className="space-y-3 pt-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-100">
                CONTACT
              </h3>
              <div className="space-y-2.5">
                {personal.email && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium break-all">{personal.email}</span>
                  </div>
                )}
                {personal.phone && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium">{personal.phone}</span>
                  </div>
                )}
                {personal.whatsapp && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium">WA: {personal.whatsapp}</span>
                  </div>
                )}
                {personal.location && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium">{personal.location}</span>
                  </div>
                )}
                {personal.website && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium break-all">{personal.website}</span>
                  </div>
                )}
                {personal.facebook && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <FacebookIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-700 font-medium break-all">{personal.facebook}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills with Horizontal Bars */}
            {skills && skills.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-100">
                  SKILLS
                </h3>
                <div className="space-y-2">
                  {skills.map((s, idx) => (
                    <div key={s.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{s.name}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${s.level || (95 - idx * 7)}%`,
                            backgroundColor: primaryColor 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (7 cols) */}
          <div className="col-span-7 space-y-6 pt-12">
            
            {/* Education with Rounded Pill Banner */}
            {education && education.length > 0 && (
              <div className="space-y-3">
                <div 
                  className="px-6 py-2 rounded-full text-white font-extrabold text-xs tracking-wider uppercase inline-block shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  EDUCATION
                </div>
                <div className="space-y-3 pl-3 border-l-2 border-slate-200 ml-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="relative pl-3 space-y-0.5">
                      <div 
                        className="w-2.5 h-2.5 rounded-full absolute -left-[18px] top-1 border-2 border-white"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-extrabold text-xs text-slate-900">{edu.degree}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{edu.startDate} – {edu.endDate}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600">{edu.institution}</p>
                      {edu.description && <p className="text-[10px] text-slate-500 leading-relaxed">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {experience && experience.length > 0 && (
              <div className="space-y-3 pt-2">
                <div 
                  className="px-6 py-2 rounded-full text-white font-extrabold text-xs tracking-wider uppercase inline-block shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  WORK EXPERIENCE
                </div>
                <div className="space-y-4 pl-3 border-l-2 border-slate-200 ml-3">
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative pl-3 space-y-1">
                      <div 
                        className="w-2.5 h-2.5 rounded-full absolute -left-[18px] top-1 border-2 border-white"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-extrabold text-xs text-slate-900">{exp.position}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <p className="text-[11px] font-bold" style={{ color: primaryColor }}>{exp.company}</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages with Circular Progress Meters */}
            {languages && languages.length > 0 && (
              <div className="space-y-3 pt-2">
                <div 
                  className="px-6 py-2 rounded-full text-white font-extrabold text-xs tracking-wider uppercase inline-block shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  LANGUAGES
                </div>
                <div className="flex flex-wrap gap-6 pt-2">
                  {languages.map((lang) => {
                    const pct = lang.percent || 85;
                    const strokeDash = `${(pct / 100) * 125} 125`;
                    return (
                      <div key={lang.id} className="flex flex-col items-center space-y-1">
                        <div className="w-14 h-14 relative flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                            <circle 
                              cx="22" 
                              cy="22" 
                              r="18" 
                              fill="none" 
                              stroke={primaryColor} 
                              strokeWidth="3.5"
                              strokeDasharray={strokeDash}
                              strokeLinecap="round" 
                            />
                          </svg>
                          <span className="absolute text-[10px] font-black text-slate-800">{pct}%</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{lang.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Geometric Polygon */}
        <div className="relative w-full h-16 mt-auto overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 60" preserveAspectRatio="none">
            <polygon points="0,60 800,60 800,20 400,0 0,35" fill={primaryColor} />
          </svg>
        </div>

      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 3: MINIMALIST BORDER BOX (Anaisha Parvati Style)
  // Luxury outer border box, centered editorial typography, icon strip, references
  // =========================================================================
  if (templateId === 'minimal-box') {
    return (
      <div 
        id="cv-printable-document"
        className="w-full bg-white text-slate-900 shadow-xl min-h-[1120px] font-sans p-6 sm:p-10 text-left"
      >
        {/* Full A4 Outer Border Box */}
        <div className="border border-slate-300 w-full h-full p-8 sm:p-10 space-y-6">
          
          {/* Centered Editorial Header */}
          <div className="text-center space-y-2 border-b pb-5 border-slate-200">
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-slate-900">
              {personal.fullName || 'ANAISHA PARVATI'}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {personal.jobTitle || 'HEAD MANAGER'}
            </p>

            {/* Icon Contact Row */}
            <div className="flex flex-wrap justify-center items-center gap-4 pt-2 text-xs text-slate-600 font-medium">
              {personal.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{personal.phone}</span>
                </span>
              )}
              {personal.whatsapp && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WA: {personal.whatsapp}</span>
                </span>
              )}
              {personal.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{personal.location}</span>
                </span>
              )}
              {personal.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{personal.email}</span>
                </span>
              )}
              {personal.website && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{personal.website}</span>
                </span>
              )}
            </div>
          </div>

          {/* About Me */}
          {personal.summary && (
            <div className="space-y-2 border-b pb-4 border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                ABOUT ME
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {personal.summary}
              </p>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="space-y-3 border-b pb-5 border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                EDUCATION
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="grid grid-cols-12 gap-4 text-xs">
                    <div className="col-span-3 text-slate-500 font-mono text-[11px]">
                      <p className="font-bold text-slate-700">{edu.startDate} – {edu.endDate}</p>
                      <p>{edu.institution}</p>
                    </div>
                    <div className="col-span-9 space-y-0.5">
                      <h4 className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</h4>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{edu.description || 'Focused coursework and academic research honors.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div className="space-y-3 border-b pb-5 border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                EXPERIENCE
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="grid grid-cols-12 gap-4 text-xs">
                    <div className="col-span-3 text-slate-500 font-mono text-[11px]">
                      <p className="font-bold text-slate-700">{exp.startDate} – {exp.current ? 'NOW' : exp.endDate}</p>
                      <p>{exp.company}</p>
                    </div>
                    <div className="col-span-9 space-y-0.5">
                      <h4 className="font-bold text-slate-900">{exp.position}</h4>
                      <p className="text-slate-600 leading-relaxed text-[11px] whitespace-pre-line">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills (4-column Grid with Dots) */}
          {skills && skills.length > 0 && (
            <div className="space-y-3 border-b pb-5 border-slate-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                SKILLS
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
                {skills.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                    <span>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {references && references.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                REFERENCES
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {references.map((ref) => (
                  <div key={ref.id} className="space-y-0.5 text-slate-600">
                    <h4 className="font-bold text-slate-900">{ref.name}</h4>
                    <p className="text-[11px] text-slate-500">{ref.title} of {ref.company}</p>
                    {ref.phone && <p className="text-[11px]">Phone: {ref.phone}</p>}
                    {ref.email && <p className="text-[11px]">Email: {ref.email}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 4: EXECUTIVE BLUE RIBBON (Corporate Karachi Style)
  // Shaded blue banner headers, top right circular photo, WhatsApp + LinkedIn icons
  // =========================================================================
  if (templateId === 'executive-ribbon') {
    return (
      <div 
        id="cv-printable-document"
        className="w-full bg-white text-slate-900 shadow-xl min-h-[1120px] font-sans p-8 sm:p-12 text-left space-y-6"
      >
        {/* Top Header Block */}
        <div className="flex justify-between items-start border-b pb-6 border-slate-200">
          
          {/* Left Details */}
          <div className="space-y-3 max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: primaryColor }}>
              ({personal.fullName || 'ADD NAME'})
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {personal.jobTitle || 'Senior Operations Executive'}
            </p>

            <div className="space-y-1.5 text-xs text-slate-700 pt-1">
              {personal.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>{personal.location}</span>
                </div>
              )}
              {personal.whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium">WhatsApp: {personal.whatsapp}</span>
                </div>
              )}
              {personal.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>{personal.email}</span>
                </div>
              )}
              {personal.linkedin && (
                <div className="flex items-center gap-2">
                  <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>linkedin.com/in/{personal.linkedin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Circular Avatar */}
          <div className="shrink-0 pl-4">
            <div 
              className="w-32 h-32 rounded-full p-1 bg-white shadow-md overflow-hidden"
              style={{ border: `3px solid ${primaryColor}` }}
            >
              <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            </div>
          </div>

        </div>

        {/* Profile Summary */}
        {personal.summary && (
          <div className="space-y-2">
            <div 
              className="px-4 py-1.5 rounded-sm text-white font-extrabold text-xs uppercase tracking-wider"
              style={{ backgroundColor: primaryColor }}
            >
              PROFILE SUMMARY
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-normal pt-1 px-1">
              {personal.summary}
            </p>
          </div>
        )}

        {/* Core Competencies / Skills (2-Column Grid) */}
        {skills && skills.length > 0 && (
          <div className="space-y-2">
            <div 
              className="px-4 py-1.5 rounded-sm text-white font-extrabold text-xs uppercase tracking-wider"
              style={{ backgroundColor: primaryColor }}
            >
              CORE COMPETENCIES & TECHNICAL SKILLS
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 pt-1 px-1 text-xs text-slate-700">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <div className="space-y-2">
            <div 
              className="px-4 py-1.5 rounded-sm text-white font-extrabold text-xs uppercase tracking-wider"
              style={{ backgroundColor: primaryColor }}
            >
              WORK EXPERIENCE
            </div>
            <div className="space-y-3 pt-1 px-1">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-0.5">
                  <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                    <span>{exp.position} — <span style={{ color: primaryColor }}>{exp.company}</span></span>
                    <span className="font-mono text-slate-500 text-[11px]">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pt-0.5 pl-2 border-l-2 border-slate-200">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div className="space-y-2">
            <div 
              className="px-4 py-1.5 rounded-sm text-white font-extrabold text-xs uppercase tracking-wider"
              style={{ backgroundColor: primaryColor }}
            >
              EDUCATION
            </div>
            <div className="space-y-2 pt-1 px-1 text-xs">
              {education.map((edu) => (
                <div key={edu.id} className="flex items-baseline gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: primaryColor }} />
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>
                    <span className="text-slate-600"> | {edu.institution} ({edu.startDate} - {edu.endDate})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="space-y-2">
            <div 
              className="px-4 py-1.5 rounded-sm text-white font-extrabold text-xs uppercase tracking-wider"
              style={{ backgroundColor: primaryColor }}
            >
              PROFESSIONAL CERTIFICATIONS
            </div>
            <div className="space-y-1.5 pt-1 px-1 text-xs">
              {certifications.map((c) => (
                <div key={c.id} className="flex items-baseline gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: primaryColor }} />
                  <span>
                    <strong className="font-bold">{c.title}</strong>
                    {c.issuer && ` – ${c.issuer}`}
                    {c.year && ` (${c.year})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Strip at Bottom */}
        {languages && languages.length > 0 && (
          <div className="pt-4 border-t-2 border-slate-200 space-y-2">
            <h3 className="font-extrabold text-[11px] tracking-widest uppercase text-slate-500">LANGUAGES</h3>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-800 font-semibold">
              {languages.map((l, idx) => (
                <React.Fragment key={l.id}>
                  <span>
                    {l.name} — <span className="font-normal text-slate-500">{l.proficiency || 'Native Proficiency'}</span>
                  </span>
                  {idx < languages.length - 1 && <span className="text-slate-300">|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 5: MODERN CLEAN CORPORATE (Layla Morgan Style)
  // Top-left photo, right contact block, bold blue section headers with horizontal rule
  // =========================================================================
  return (
    <div 
      id="cv-printable-document"
      className="w-full bg-white text-slate-900 shadow-xl min-h-[1120px] font-sans p-8 sm:p-12 text-left space-y-6"
    >
      {/* Top Header Block with Photo on Left */}
      <div className="flex items-start gap-6 border-b pb-6 border-slate-200">
        
        {/* Profile Photo */}
        <div className="w-28 h-32 rounded-xl overflow-hidden shadow-md bg-slate-200 shrink-0">
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>

        {/* Name and Right Details */}
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight" style={{ color: primaryColor }}>
            {personal.fullName || 'LAYLA MORGAN'}
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {personal.jobTitle || 'Digital Marketing Specialist'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600 pt-1">
            {personal.location && <p><strong className="text-slate-800">Address:</strong> {personal.location}</p>}
            {personal.phone && <p><strong className="text-slate-800">Phone:</strong> {personal.phone}</p>}
            {personal.whatsapp && <p><strong className="text-slate-800">WhatsApp:</strong> {personal.whatsapp}</p>}
            {personal.email && <p><strong className="text-slate-800">Email:</strong> {personal.email}</p>}
            {personal.website && <p><strong className="text-slate-800">Website:</strong> {personal.website}</p>}
          </div>
        </div>

      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="space-y-1.5">
          <h2 className="text-xs font-black uppercase tracking-wider border-b pb-1 border-slate-300" style={{ color: primaryColor }}>
            SUMMARY
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {personal.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {experience && experience.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider border-b pb-1 border-slate-300" style={{ color: primaryColor }}>
            WORK EXPERIENCE
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                  <span>{exp.position}, <span style={{ color: primaryColor }}>{exp.company}</span></span>
                  <span className="font-mono text-slate-500 text-[11px]">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pl-2 border-l-2 border-slate-100">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider border-b pb-1 border-slate-300" style={{ color: primaryColor }}>
            EDUCATION
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="space-y-0.5">
                <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                  <span>{edu.degree} in {edu.fieldOfStudy}</span>
                  <span className="font-mono text-slate-500 text-[11px]">{edu.startDate} – {edu.endDate}</span>
                </div>
                <p className="text-xs text-slate-600">{edu.institution} {edu.gpa ? `· GPA: ${edu.gpa}` : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information (Skills, Languages, Certifications) */}
      <div className="space-y-2 pt-1">
        <h2 className="text-xs font-black uppercase tracking-wider border-b pb-1 border-slate-300" style={{ color: primaryColor }}>
          ADDITIONAL INFORMATION
        </h2>
        <div className="space-y-1.5 text-xs text-slate-700">
          {skills && skills.length > 0 && (
            <p>
              <strong className="text-slate-900">Core Skills:</strong> {skills.map((s) => s.name).join(', ')}
            </p>
          )}
          {languages && languages.length > 0 && (
            <p>
              <strong className="text-slate-900">Languages:</strong> {languages.map((l) => `${l.name} (${l.proficiency || 'Fluent'})`).join(', ')}
            </p>
          )}
          {certifications && certifications.length > 0 && (
            <p>
              <strong className="text-slate-900">Certifications:</strong> {certifications.map((c) => c.title).join(' • ')}
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

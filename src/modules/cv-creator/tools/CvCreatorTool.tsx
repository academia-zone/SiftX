import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Palette, 
  Download, 
  Sparkles, 
  Plus, 
  Trash2, 
  Upload, 
  Globe, 
  Award, 
  Users 
} from 'lucide-react';
import { ResumeTemplateView } from '../components/ResumeTemplates';
import type { 
  ResumeData, 
  CvTemplateId, 
  CvThemeColor, 
  ExperienceItem, 
  EducationItem, 
  SkillItem, 
  LanguageItem,
  CertificationItem,
  ReferenceItem
} from '../types/cvCreatorTypes';

const SAMPLE_RESUME_DATA: ResumeData = {
  personal: {
    fullName: 'Galena Micheal',
    jobTitle: 'Senior Education Specialist & Lead Instructor',
    email: 'gmicheal@email.com',
    phone: '+1 (012) 444-6789',
    whatsapp: '+92 300 1234567',
    location: 'Charlotte, NC 48210, USA',
    website: 'www.helpshared.com',
    linkedin: 'galena-micheal',
    facebook: 'facebook.com/galenamicheal',
    summary: 'Motivated lead educator with 7+ years of experience across multiple subject disciplines at all grade levels. Skilled in curriculum development, classroom management, standardized AP test preparation, and digital instructional design.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'River Tech High School',
      position: 'Special Education Lead Teacher',
      startDate: 'May 2023',
      endDate: 'Present',
      current: true,
      description: '• Prepare 60+ students for the AP English Literature exam, achieving a 94% pass rate.\n• Administer written assignments and provide actionable student development feedback.\n• Lead cross-functional teacher mentorship workshops for digital classroom tools.',
    },
    {
      id: 'exp-2',
      company: 'Oakridge Academy',
      position: 'High School English Instructor',
      startDate: 'Aug 2020',
      endDate: 'Apr 2023',
      current: false,
      description: '• Designed customized curriculum plans aligned with state educational standards.\n• Increased student test performance metrics by 28% through interactive multimedia assignments.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Johnson University, West Charlotte, NC',
      degree: 'Bachelor of Arts',
      fieldOfStudy: 'Education & Literature',
      startDate: '2016',
      endDate: '2020',
      gpa: '3.85',
      description: 'Summa Cum Laude, Dean’s Honor List all 8 semesters.',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'Curriculum Planning', level: 95 },
    { id: 'sk-2', name: 'Student Leadership', level: 90 },
    { id: 'sk-3', name: 'Creative Learning', level: 88 },
    { id: 'sk-4', name: 'Classroom Management', level: 92 },
    { id: 'sk-5', name: 'EdTech Tools (Canva, LMS)', level: 85 },
    { id: 'sk-6', name: 'AP Exam Preparation', level: 94 },
  ],
  languages: [
    { id: 'lng-1', name: 'English', proficiency: 'Native / Fluent', percent: 100 },
    { id: 'lng-2', name: 'Spanish', proficiency: 'Professional Working', percent: 85 },
    { id: 'lng-3', name: 'Urdu', proficiency: 'Conversational', percent: 75 },
  ],
  certifications: [
    { id: 'crt-1', title: 'Illinois Professional Educator License (PEL)', issuer: 'State Board of Education', year: '2025' },
    { id: 'crt-2', title: 'National Board Certified Teacher (NBCT)', issuer: 'NBPTS', year: '2025' },
  ],
  references: [
    { id: 'ref-1', name: 'Dr. Arthur Vance', title: 'Principal', company: 'River Tech High', phone: '+1 555-019-2831', email: 'avance@rivertech.edu' },
    { id: 'ref-2', name: 'Elena Rostova', title: 'Department Head', company: 'Johnson University', phone: '+1 555-019-4482', email: 'erostova@johnson.edu' },
  ],
  projects: [],
};

export const CvCreatorTool: React.FC = () => {
  const [data, setData] = useState<ResumeData>(SAMPLE_RESUME_DATA);
  const [templateId, setTemplateId] = useState<CvTemplateId>('dual-tone-sidebar');
  const [themeColor, setThemeColor] = useState<CvThemeColor>('slate');
  const [customHex, setCustomHex] = useState<string>('#00a896');
  const [activeTab, setActiveTab] = useState<'template' | 'personal' | 'experience' | 'education' | 'skills' | 'languages' | 'certifications' | 'references'>('template');
  const [newSkillText, setNewSkillText] = useState<string>('');

  // Handle Profile Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setData((prev) => ({
        ...prev,
        personal: { ...prev.personal, photoUrl: event.target?.result as string },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Experience Handlers
  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setData((prev) => ({ ...prev, experience: [...prev.experience, newItem] }));
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  // Education Handlers
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: '',
    };
    setData((prev) => ({ ...prev, education: [...prev.education, newItem] }));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const handleRemoveEducation = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  // Skills Handlers
  const handleAddSkill = () => {
    if (!newSkillText.trim()) return;
    const newItem: SkillItem = {
      id: `sk-${Date.now()}`,
      name: newSkillText.trim(),
      level: 90,
    };
    setData((prev) => ({ ...prev, skills: [...prev.skills, newItem] }));
    setNewSkillText('');
  };

  const handleRemoveSkill = (id: string) => {
    setData((prev) => ({ ...prev, skills: prev.skills.filter((item) => item.id !== id) }));
  };

  // Languages Handlers
  const handleAddLanguage = () => {
    const newItem: LanguageItem = {
      id: `lng-${Date.now()}`,
      name: 'New Language',
      proficiency: 'Fluent',
      percent: 85,
    };
    setData((prev) => ({ ...prev, languages: [...prev.languages, newItem] }));
  };

  const handleUpdateLanguage = (id: string, field: keyof LanguageItem, value: any) => {
    setData((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  };

  const handleRemoveLanguage = (id: string) => {
    setData((prev) => ({ ...prev, languages: prev.languages.filter((l) => l.id !== id) }));
  };

  // Certifications Handlers
  const handleAddCert = () => {
    const newItem: CertificationItem = {
      id: `crt-${Date.now()}`,
      title: 'New Certification or License',
      issuer: 'Issuing Organization',
      year: '2025',
    };
    setData((prev) => ({ ...prev, certifications: [...prev.certifications, newItem] }));
  };

  const handleUpdateCert = (id: string, field: keyof CertificationItem, value: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const handleRemoveCert = (id: string) => {
    setData((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.id !== id) }));
  };

  // References Handlers
  const handleAddRef = () => {
    const newItem: ReferenceItem = {
      id: `ref-${Date.now()}`,
      name: 'Manager / Colleague Name',
      title: 'Professional Title',
      company: 'Company Name',
      phone: '+1 555-000-0000',
      email: 'ref@company.com',
    };
    setData((prev) => ({ ...prev, references: [...prev.references, newItem] }));
  };

  const handleUpdateRef = (id: string, field: keyof ReferenceItem, value: string) => {
    setData((prev) => ({
      ...prev,
      references: prev.references.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  };

  const handleRemoveRef = (id: string) => {
    setData((prev) => ({ ...prev, references: prev.references.filter((r) => r.id !== id) }));
  };

  // Print & PDF Export
  const handlePrintPdf = () => {
    const el = document.getElementById('cv-printable-document');
    if (!el) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.personal.fullName || 'Resume'} - SiftX CV</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            * { box-sizing: border-box; }
            ${document.querySelector('style')?.innerHTML || ''}
          </style>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
        </head>
        <body>
          <div style="width: 210mm; min-height: 297mm; margin: 0 auto;">
            ${el.outerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Canva-style Control Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        
        {/* Quick Style & Sample Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('template')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'template'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Templates & Colors</span>
          </button>

          <button
            onClick={() => setData(SAMPLE_RESUME_DATA)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Load Sample Data</span>
          </button>
        </div>

        {/* Export Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintPdf}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
          >
            <Download className="w-4 h-4" />
            <span>Download A4 PDF</span>
          </button>
        </div>

      </div>

      {/* Main Split-Screen Workspace: Left Editor, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Editor (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          
          {/* Editor Sub-Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold p-2 gap-1 bg-slate-50 dark:bg-slate-950">
            {[
              { id: 'template', label: 'Styles', icon: Palette },
              { id: 'personal', label: 'Profile', icon: User },
              { id: 'experience', label: `Jobs (${data.experience.length})`, icon: Briefcase },
              { id: 'education', label: `Edu (${data.education.length})`, icon: GraduationCap },
              { id: 'skills', label: `Skills (${data.skills.length})`, icon: Code2 },
              { id: 'languages', label: `Langs (${data.languages.length})`, icon: Globe },
              { id: 'certifications', label: `Certs (${data.certifications.length})`, icon: Award },
              { id: 'references', label: `Refs (${data.references.length})`, icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="p-6 space-y-5 max-h-[720px] overflow-y-auto">
            
            {/* 1. TEMPLATES & CANVA STYLES */}
            {activeTab === 'template' && (
              <div className="space-y-6">
                
                {/* 5 Authentic Designs based on User's Photos */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Choose Template Design (5 Match Styles)
                  </label>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { 
                        id: 'dual-tone-sidebar', 
                        title: '1. Galena Micheal (Dual-Tone Sidebar)', 
                        desc: 'Dark top header, light grey sidebar, pill photo frame, checkmark skills, and circular badge icons.' 
                      },
                      { 
                        id: 'teal-geometric', 
                        title: '2. Taya Miass (Modern Geometric Wave)', 
                        desc: 'Dynamic angular wave header, big circular ring avatar, squircle contact badges, timeline dots, and circular progress meters.' 
                      },
                      { 
                        id: 'minimal-box', 
                        title: '3. Anaisha Parvati (Luxury Border Box)', 
                        desc: 'Full-page thin border framing, centered editorial typography, icon contact row, 4-column skills, and references.' 
                      },
                      { 
                        id: 'executive-ribbon', 
                        title: '4. Executive Corporate (Karachi Pakistan)', 
                        desc: 'Shaded ribbon headers, top-right circular photo, WhatsApp + LinkedIn icons, 2-column competencies, language footer strip.' 
                      },
                      { 
                        id: 'modern-clean', 
                        title: '5. Layla Morgan (Modern Clean Corporate)', 
                        desc: 'Top-left photo, right details, bold blue category dividers, right-aligned dates, and categorized additional information.' 
                      },
                    ].map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => {
                          setTemplateId(tmpl.id as CvTemplateId);
                          // Default colors based on picture
                          if (tmpl.id === 'dual-tone-sidebar') setThemeColor('slate');
                          if (tmpl.id === 'teal-geometric') setThemeColor('teal');
                          if (tmpl.id === 'minimal-box') setThemeColor('slate');
                          if (tmpl.id === 'executive-ribbon') setThemeColor('blue');
                          if (tmpl.id === 'modern-clean') setThemeColor('blue');
                        }}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          templateId === tmpl.id
                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">{tmpl.title}</h4>
                          {templateId === tmpl.id && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">Active</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">{tmpl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Scheme Picker */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Accent Color Palette
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-600 uppercase">{themeColor}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {[
                      { id: 'slate', hex: '#2c3240', name: 'Dark Slate' },
                      { id: 'teal', hex: '#00a896', name: 'Vibrant Teal' },
                      { id: 'blue', hex: '#1e40af', name: 'Navy Blue' },
                      { id: 'emerald', hex: '#047857', name: 'Emerald' },
                      { id: 'crimson', hex: '#be123c', name: 'Crimson' },
                      { id: 'purple', hex: '#6d28d9', name: 'Purple' },
                    ].map((col) => (
                      <button
                        key={col.id}
                        onClick={() => setThemeColor(col.id as CvThemeColor)}
                        className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer relative shadow-xs flex items-center justify-center ${
                          themeColor === col.id ? 'scale-115 border-slate-900 dark:border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {themeColor === col.id && <div className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                      </button>
                    ))}

                    {/* Custom Hex Color Picker */}
                    <div className="flex items-center gap-2 pl-2">
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => {
                          setCustomHex(e.target.value);
                          setThemeColor('custom');
                        }}
                        className="w-9 h-9 rounded-full border-2 border-slate-300 cursor-pointer overflow-hidden"
                        title="Pick Custom Color"
                      />
                      <span className="text-xs font-mono text-slate-500">Custom</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. PERSONAL DETAILS & PROFILE PHOTO */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                
                {/* Photo Upload */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-md shrink-0">
                    <img 
                      src={data.personal.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Profile Picture</label>
                    <div className="flex gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      {data.personal.photoUrl && (
                        <button
                          onClick={() => setData({ ...data, personal: { ...data.personal, photoUrl: '' } })}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={data.personal.fullName}
                    onChange={(e) => setData({ ...data, personal: { ...data.personal, fullName: e.target.value } })}
                    placeholder="e.g. Galena Micheal"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Professional Job Title</label>
                  <input
                    type="text"
                    value={data.personal.jobTitle}
                    onChange={(e) => setData({ ...data, personal: { ...data.personal, jobTitle: e.target.value } })}
                    placeholder="e.g. Bachelor of Arts in Education"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={data.personal.email}
                      onChange={(e) => setData({ ...data, personal: { ...data.personal, email: e.target.value } })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                      type="text"
                      value={data.personal.phone}
                      onChange={(e) => setData({ ...data, personal: { ...data.personal, phone: e.target.value } })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">WhatsApp Number</label>
                    <input
                      type="text"
                      value={data.personal.whatsapp || ''}
                      onChange={(e) => setData({ ...data, personal: { ...data.personal, whatsapp: e.target.value } })}
                      placeholder="+92 300 0000000"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location (City, Country)</label>
                    <input
                      type="text"
                      value={data.personal.location}
                      onChange={(e) => setData({ ...data, personal: { ...data.personal, location: e.target.value } })}
                      placeholder="Karachi, Pakistan"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">LinkedIn Username / URL</label>
                    <input
                      type="text"
                      value={data.personal.linkedin || ''}
                      onChange={(e) => setData({ ...data, personal: { ...data.personal, linkedin: e.target.value } })}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Website / Portfolio</label>
                    <input
                      type="text"
                      value={data.personal.website || ''}
                      onChange={(e) => setData({ ...data, personal: { ...data.personal, website: e.target.value } })}
                      placeholder="www.helpshared.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Profile Summary / Bio</label>
                  <textarea
                    rows={4}
                    value={data.personal.summary}
                    onChange={(e) => setData({ ...data, personal: { ...data.personal, summary: e.target.value } })}
                    placeholder="Brief summary of your career background..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 3. EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Work History</span>
                  <button
                    onClick={handleAddExperience}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Position</span>
                  </button>
                </div>

                {data.experience.map((exp, idx) => (
                  <div key={exp.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-indigo-600">Position #{idx + 1}</span>
                      <button onClick={() => handleRemoveExperience(exp.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Company / School Name"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={exp.position}
                        onChange={(e) => handleUpdateExperience(exp.id, 'position', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Start Date (e.g. May 2023)"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="End Date (e.g. Present)"
                        value={exp.endDate}
                        onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Bullet points and responsibilities..."
                      value={exp.description}
                      onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 4. EDUCATION */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Degrees & Schools</span>
                  <button
                    onClick={handleAddEducation}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                {data.education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-indigo-600">Education #{idx + 1}</span>
                      <button onClick={() => handleRemoveEducation(edu.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="University / Institute"
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Degree (e.g. Bachelor of Arts)"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleUpdateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Dates (e.g. 2016 – 2020)"
                        value={edu.startDate}
                        onChange={(e) => handleUpdateEducation(edu.id, 'startDate', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="GPA / Honors (optional)"
                        value={edu.gpa || ''}
                        onChange={(e) => handleUpdateEducation(edu.id, 'gpa', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. SKILLS */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Skill</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Leadership, Problem Solving, React"
                      value={newSkillText}
                      onChange={(e) => setNewSkillText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                    <button onClick={handleAddSkill} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer">
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {data.skills.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">{s.level || 90}%</span>
                        <input
                          type="range"
                          min={20}
                          max={100}
                          value={s.level || 90}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setData((prev) => ({
                              ...prev,
                              skills: prev.skills.map((item) => (item.id === s.id ? { ...item, level: val } : item)),
                            }));
                          }}
                          className="w-20 accent-indigo-600 cursor-pointer"
                        />
                        <button onClick={() => handleRemoveSkill(s.id)} className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer">
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. LANGUAGES */}
            {activeTab === 'languages' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Languages</span>
                  <button onClick={handleAddLanguage} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Language</span>
                  </button>
                </div>

                {data.languages.map((l) => (
                  <div key={l.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-3">
                    <input
                      type="text"
                      value={l.name}
                      onChange={(e) => handleUpdateLanguage(l.id, 'name', e.target.value)}
                      placeholder="Language"
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={l.proficiency || ''}
                      onChange={(e) => handleUpdateLanguage(l.id, 'proficiency', e.target.value)}
                      placeholder="e.g. Fluent, Native"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500">{l.percent || 85}%</span>
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={l.percent || 85}
                        onChange={(e) => handleUpdateLanguage(l.id, 'percent', Number(e.target.value))}
                        className="w-16 accent-indigo-600 cursor-pointer"
                      />
                    </div>
                    <button onClick={() => handleRemoveLanguage(l.id)} className="text-rose-500 p-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 7. CERTIFICATIONS */}
            {activeTab === 'certifications' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Licenses & Certifications</span>
                  <button onClick={handleAddCert} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certification</span>
                  </button>
                </div>

                {data.certifications.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={c.title}
                        onChange={(e) => handleUpdateCert(c.id, 'title', e.target.value)}
                        placeholder="Certificate Name"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                      <button onClick={() => handleRemoveCert(c.id)} className="text-rose-500 p-1 ml-2 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={c.issuer || ''}
                        onChange={(e) => handleUpdateCert(c.id, 'issuer', e.target.value)}
                        placeholder="Issuer (e.g. Google, State Board)"
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <input
                        type="text"
                        value={c.year || ''}
                        onChange={(e) => handleUpdateCert(c.id, 'year', e.target.value)}
                        placeholder="Year (e.g. 2025)"
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 8. REFERENCES */}
            {activeTab === 'references' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Professional References</span>
                  <button onClick={handleAddRef} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Reference</span>
                  </button>
                </div>

                {data.references.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={r.name}
                        onChange={(e) => handleUpdateRef(r.id, 'name', e.target.value)}
                        placeholder="Reference Name"
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                      <button onClick={() => handleRemoveRef(r.id)} className="text-rose-500 p-1 ml-2 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={r.title}
                        onChange={(e) => handleUpdateRef(r.id, 'title', e.target.value)}
                        placeholder="Job Title"
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <input
                        type="text"
                        value={r.company}
                        onChange={(e) => handleUpdateRef(r.id, 'company', e.target.value)}
                        placeholder="Company"
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={r.phone || ''}
                        onChange={(e) => handleUpdateRef(r.id, 'phone', e.target.value)}
                        placeholder="Phone Number"
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                      <input
                        type="text"
                        value={r.email || ''}
                        onChange={(e) => handleUpdateRef(r.id, 'email', e.target.value)}
                        placeholder="Email Address"
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Live A4 Real-time Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE A4 CANVAS PREVIEW</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">Standard 210 × 297mm Layout</span>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-2 sm:p-4 overflow-x-auto shadow-inner">
            <div className="max-w-[760px] mx-auto transition-all">
              <ResumeTemplateView
                data={data}
                templateId={templateId}
                themeColor={themeColor}
                customHex={customHex}
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

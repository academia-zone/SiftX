import React from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Code2, 
  Home, 
  Palette, 
  Sparkles 
} from 'lucide-react';
import type { PersonaType } from '../types';

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersona,
  onSelectPersona
}) => {
  const personas: { id: PersonaType; label: string; urdu: string; icon: any; desc: string }[] = [
    {
      id: 'all',
      label: 'All Tools',
      urdu: 'تمام ٹولز',
      icon: Sparkles,
      desc: 'Complete 25+ tool catalog'
    },
    {
      id: 'students',
      label: 'Students & Education',
      urdu: 'طلباء اور تعلیم',
      icon: GraduationCap,
      desc: 'GPA, OCR, Notes Maker, PDF Compress & Math'
    },
    {
      id: 'office',
      label: 'Office & Business',
      urdu: 'دفتری و کاروباری',
      icon: Briefcase,
      desc: 'Invoices, PDF Sign/Word, QR & Tax'
    },
    {
      id: 'household',
      label: 'Daily Life & Household',
      urdu: 'گھریلو و روزمرہ',
      icon: Home,
      desc: 'Electricity Bill, Fuel Cost, Age & Discount'
    },
    {
      id: 'creators',
      label: 'Content Creators',
      urdu: 'میڈیا و ڈیزائنرز',
      icon: Palette,
      desc: 'Background Remover, Crop/Rotate, Trimmers'
    },
    {
      id: 'developers',
      label: 'Developers & Tech',
      urdu: 'ڈویلپرز و آئی ٹی',
      icon: Code2,
      desc: 'Data Converter, Passwords, Image Optimizer'
    }
  ];

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-bold text-blue-950 flex items-center gap-2">
            <span>Filter by Your Role / Need</span>
            <span className="text-xs font-normal text-slate-700"> (یا کیٹیگری کے مطابق فلٹر کریں)</span>
          </h2>
          <p className="text-xs text-slate-700">
            Select who you are to instantly reveal the exact tools made for your daily tasks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {personas.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPersona === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p.id)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                isSelected 
                  ? 'bg-blue-950 text-white border-blue-950 shadow-md ring-2 ring-blue-950/20' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-950'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-blue-200' : 'text-slate-600'}`}>{p.urdu}</span>
              </div>
              <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-blue-950'}`}>{p.label}</p>
              <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-600'}`}>{p.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

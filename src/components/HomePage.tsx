import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Laptop, 
  Calculator, 
  FileText, 
  Sparkles, 
  Mic, 
  Briefcase
} from 'lucide-react';
import { CATEGORIES } from '../data/toolsData';

interface HomePageProps {
  onEnterToolkit: () => void;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, any> = {
  Calculator,
  FileText,
  Sparkles,
  Mic,
  Briefcase
};

export const HomePage: React.FC<HomePageProps> = ({
  onEnterToolkit,
  onSelectCategory
}) => {
  return (
    <div className="space-y-16 py-8">
      
      {/* 1. Hero Section - Navy Blue & White */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white p-8 sm:p-14 shadow-xl border border-blue-900/40">
        
        {/* Subtle Decorative Background Light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Universal Daily Problem Solver</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            تمام ضروری ٹولز، اب ایک ہی جگہ پر۔
            <span className="block text-blue-300 font-extrabold text-2xl sm:text-4xl mt-2">
              Every Essential Daily Tool. One Single Platform.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            دس الگ الگ ویب سائٹس پر جانے یا اشتہارات سے بھرپور سافٹ ویئرز ڈاؤنلوڈ کرنے کی ضرورت نہیں۔ 
            بجلی کے بل کے تخمینے اور GPA کیلکولیٹر سے لے کر مکمل مفت PDF ایڈیٹر اور وائس AI تک — سب کچھ 100٪ مفت، پرائیویٹ اور ایک کلک کی دوری پر۔
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onEnterToolkit}
              className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-blue-950 font-bold shadow-lg shadow-black/20 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer text-sm sm:text-base group"
            >
              <span>ٹول کٹ میں داخل ہوں (Enter Toolkit)</span>
              <ArrowRight className="w-4 h-4 text-blue-900 group-hover:translate-x-1 transition-transform" />
            </button>

            <span className="text-xs text-blue-200 font-medium">
              ✨ 100% Free • No Signups • Client-Side Private
            </span>
          </div>
        </div>
      </section>

      {/* 2. Main Categories Preview (صرف 5 مین کیٹیگریز کے صاف ستھرے کارڈز - No 25 cluttered cards) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-blue-950 tracking-tight">Main Tool Categories</h2>
            <p className="text-sm text-slate-700 mt-1">
              اپنی پسندیدہ کیٹیگری کا انتخاب کریں اور اس کے اندر تمام مخصوص ٹولز دیکھیں۔
            </p>
          </div>
          <button
            onClick={onEnterToolkit}
            className="text-xs font-bold text-blue-900 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>تمام کیٹیگریز دیکھیں</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Sparkles;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-700 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 group-hover:bg-blue-950 group-hover:text-white text-blue-950 flex items-center justify-center transition-colors mb-4">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-blue-950 group-hover:text-blue-900 transition-colors">
                      {cat.title}
                    </h3>
                    <span className="text-xs font-mono text-blue-800 font-semibold">{cat.titleUrdu}</span>
                  </div>

                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    {cat.subCategories.length} Sub-areas included
                  </span>
                  <span className="font-bold text-blue-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. About Us / Why Universal Toolkit Section */}
      <section className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">About The Platform</span>
          <h2 className="text-2xl sm:text-3xl font-black text-blue-950 mt-1">
            Universal Toolkit کیا ہے اور یہ کیوں مختلف ہے؟
          </h2>
          <p className="text-slate-700 text-sm mt-3 leading-relaxed">
            اکثر انٹرنیٹ پر چھوٹی چھوٹی ضروریات کے لیے (جیسے پی ڈی ایف کا سائز کم کرنا، تصویر کا بیک گراؤنڈ ہٹانا، یا بجلی کے بل کا حساب لگانا) 
            لوگوں کو مختلف ویب سائٹس پر بار بار لاگ ان کرنا پڑتا ہے اور مہنگے سبسکرپشنز مانگے جاتے ہیں۔ 
            ہم نے ان تمام مسائل کا حل ایک سادہ، محفوظ اور مکمل مفت پورٹل میں جمع کر دیا ہے۔
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-blue-950">100% مفت اور لامحدود</h4>
              <p className="text-xs text-slate-700 mt-1">کوئی پوشیدہ فیس یا پیجز کی حد نہیں۔ ہر ٹول سب کے لیے مفت ہے۔</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-blue-950">مکمل رازداری (Local Privacy)</h4>
              <p className="text-xs text-slate-700 mt-1">آپ کی فائلز آپ کے کمپیوٹر پر ہی پراسیس ہوتی ہیں، کسی سرور پر اپلوڈ نہیں ہوتیں۔</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-blue-950">ویب سائٹ اور ڈیسک ٹاپ ایپ</h4>
              <p className="text-xs text-slate-700 mt-1">براؤزر میں آن لائن چلائیں یا ڈیسک ٹاپ پر بغیر انٹرنیٹ کے استعمال کریں۔</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

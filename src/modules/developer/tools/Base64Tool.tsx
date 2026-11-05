import React, { useState } from 'react';
import { 
  Binary, 
  Copy, 
  Check, 
  ArrowRightLeft, 
  Upload 
} from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [inputText, setInputText] = useState<string>('SiftX Universal Toolkit 2026 - اردو سپورٹ');
  const [outputText, setOutputText] = useState<string>('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (mode === 'text') {
      try {
        if (direction === 'encode') {
          // Safe UTF-8 encode including Urdu, Arabic, Emojis
          const encoded = btoa(encodeURIComponent(inputText).replace(/%([0-9A-F]{2})/g, (_m, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
          }));
          setOutputText(encoded);
          setErrorMsg(null);
        } else {
          // Safe UTF-8 decode
          const decoded = decodeURIComponent(Array.prototype.map.call(atob(inputText), (c: string) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          setOutputText(decoded);
          setErrorMsg(null);
        }
      } catch (err: any) {
        setErrorMsg('Invalid Base64 or encoding error');
        setOutputText('');
      }
    }
  }, [inputText, direction, mode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setOutputText(result);
      if (f.type.startsWith('image/')) {
        setFilePreview(result);
      } else {
        setFilePreview(null);
      }
    };
    reader.readAsDataURL(f);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Base64 Live Studio</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                UTF-8 & File Safe
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Encode & decode plain text, UTF-8 strings (Urdu/Arabic), and convert images or documents into Base64 data URLs.
            </p>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${mode === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Text Mode
            </button>
            <button
              onClick={() => setMode('file')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${mode === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              File / Image
            </button>
          </div>

          <button
            onClick={handleCopy}
            disabled={!outputText}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-teal-500/20 cursor-pointer disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Base64'}</span>
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{direction === 'encode' ? 'Plain Text Input (UTF-8)' : 'Base64 Encoded Input'}</span>
              <button
                onClick={() => {
                  setDirection(direction === 'encode' ? 'decode' : 'encode');
                  setInputText(outputText);
                }}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Switch to {direction === 'encode' ? 'Decode' : 'Encode'}</span>
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text..."
              className="w-full h-80 p-4 bg-slate-900 text-teal-200 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{direction === 'encode' ? 'Base64 Result' : 'Decoded Text Result'}</span>
              <span className="text-[11px] font-mono text-slate-400">{outputText.length} chars</span>
            </div>
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}
            <textarea
              readOnly
              value={outputText}
              placeholder="Result will appear here..."
              className="w-full h-80 p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none resize-none leading-relaxed shadow-inner break-all"
              spellCheck={false}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-teal-500 transition cursor-pointer relative bg-slate-50">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-teal-600" />
              <div className="text-sm font-bold text-slate-800">Upload any file or image</div>
              <div className="text-xs text-slate-400">Generates instant base64 Data URL (100% in browser)</div>
            </div>
          </div>

          {filePreview && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img src={filePreview} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
              <div className="text-xs font-bold text-slate-700">Image converted to Base64 Data URL successfully!</div>
            </div>
          )}

          {outputText && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700">Generated Data URL String</div>
              <textarea
                readOnly
                value={outputText}
                rows={6}
                className="w-full p-3 bg-slate-900 text-teal-300 font-mono text-xs rounded-xl border border-slate-800 break-all"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

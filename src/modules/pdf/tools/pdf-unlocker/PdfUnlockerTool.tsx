import React, { useState, useRef } from 'react';
import { 
  Lock, 
  Unlock,
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  FileText,
  Loader2,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { decryptPDF, isEncrypted } from '@pdfsmaller/pdf-decrypt';
import { downloadPdfBytes } from '../../engines/pdfEngine';

export const PdfUnlockerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [actionType, setActionType] = useState<'protect' | 'unlock'>('protect');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fileIsEncrypted, setFileIsEncrypted] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selected: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');

    if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file (.pdf).');
      return;
    }
    setFile(selected);

    try {
      const ab = await selected.arrayBuffer();
      const bytes = new Uint8Array(ab);
      const encInfo = await isEncrypted(bytes);
      const encrypted = !!encInfo.encrypted;
      setFileIsEncrypted(encrypted);

      if (encrypted) {
        setActionType('unlock');
        setSuccessMsg('This PDF is currently locked with a password. Enter password to unlock.');
      } else {
        setActionType('protect');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleExecute = async () => {
    if (!file) return;

    if (!password.trim()) {
      setErrorMsg('Please enter a password.');
      return;
    }

    if (actionType === 'protect' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const arrayBuffer = await file.arrayBuffer();
      const inputBytes = new Uint8Array(arrayBuffer);

      if (actionType === 'protect') {
        // Genuine AES-256 PDF Encryption
        const encryptedBytes = await encryptPDF(inputBytes, password);
        downloadPdfBytes(encryptedBytes, `protected_locked_${file.name}`);
        setSuccessMsg(`Document locked with AES-256 encryption! It will now require "${password}" to open anywhere.`);
      } else {
        // Genuine PDF Decryption
        try {
          const decryptedBytes = await decryptPDF(inputBytes, password);
          downloadPdfBytes(decryptedBytes, `unlocked_open_${file.name}`);
          setSuccessMsg('PDF successfully unlocked and password restriction removed!');
        } catch (decErr: any) {
          setErrorMsg('Incorrect password! Could not unlock the PDF document.');
        }
      }
    } catch (err: any) {
      console.error('Security operation error:', err);
      setErrorMsg(err.message || 'Security operation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setFileIsEncrypted(false);
    setSuccessMsg(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-600" />
              <span>PDF Security: Genuine Password Lock & Unlock</span>
            </h2>
            <p className="text-xs text-slate-500">
              Lock PDFs with military-grade AES-256 encryption (prompts for password on open) or remove existing passwords.
            </p>
          </div>

          {file && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Upload New</span>
            </button>
          )}
        </div>

        {/* Upload Zone */}
        {!file ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer relative group ${
                isDragging 
                  ? 'border-rose-500 bg-rose-100/50 scale-[1.01]' 
                  : 'border-rose-200 hover:border-rose-400 bg-rose-50/30'
              }`}
            >
              <div className="space-y-3 pointer-events-none select-none">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-base text-slate-900">
                    Click to select PDF or drag & drop here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    100% Client-Side Private • Genuine AES-256 encryption & decryption
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs group-hover:bg-rose-700 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Select PDF File
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected File Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • {fileIsEncrypted ? '🔒 Currently Encrypted' : '🔓 Unencrypted PDF'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${fileIsEncrypted ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                {fileIsEncrypted ? 'Encrypted' : 'Ready to Protect'}
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Choose Security Operation:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActionType('protect')}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    actionType === 'protect'
                      ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-600" />
                    <p className={`text-xs font-bold ${actionType === 'protect' ? 'text-rose-700' : 'text-slate-800'}`}>
                      Protect with Password (AES-256)
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Adds genuine password lock so file cannot be viewed without this code
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('unlock')}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                    actionType === 'unlock'
                      ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-rose-600" />
                    <p className={`text-xs font-bold ${actionType === 'unlock' ? 'text-rose-700' : 'text-slate-800'}`}>
                      Unlock & Remove Password
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Enter password to permanently remove lock and view unrestricted
                  </p>
                </button>
              </div>
            </div>

            {/* Password Inputs */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {actionType === 'protect' ? 'Set Document Password:' : 'Enter Document Password to Unlock:'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                />
              </div>

              {actionType === 'protect' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Confirm Password:
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to confirm..."
                    className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
                  />
                </div>
              )}
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isProcessing || !password.trim()}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing AES-256 Encryption...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{actionType === 'protect' ? 'Encrypt & Download Protected PDF' : 'Unlock & Download Clean PDF'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

      </div>

    </div>
  );
};

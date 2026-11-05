import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  RefreshCw, 
  Copy, 
  Check, 
  Globe, 
  Sparkles 
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { downloadFile } from '../engines/imageEngine';

export const ImageOcrTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<'eng' | 'urd'>('eng');
  const [extractedText, setExtractedText] = useState<string>('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    runOcr(selectedFile, language);
  };

  const runOcr = async (targetFile: File, lang: 'eng' | 'urd') => {
    setIsProcessing(true);
    setProgress(0);
    setStatusMessage('Initializing OCR engine...');
    setExtractedText('');
    setConfidence(null);

    try {
      const worker = await createWorker(lang, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatusMessage(`Recognizing text... ${Math.round(m.progress * 100)}%`);
          } else {
            setStatusMessage(m.status);
          }
        },
      });

      const ret = await worker.recognize(targetFile);
      setExtractedText(ret.data.text);
      setConfidence(Math.round(ret.data.confidence));
      await worker.terminate();
    } catch (err) {
      console.error('OCR failed:', err);
      setStatusMessage('OCR recognition encountered an error. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLanguageChange = (lang: 'eng' | 'urd') => {
    setLanguage(lang);
    if (file) {
      runOcr(file, lang);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, `${base}-ocr.txt`);
  };

  const handleDownloadDoc = () => {
    if (!extractedText || !file) return;
    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Extracted Text</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">
  <pre style="white-space: pre-wrap; font-family: inherit;">${extractedText}</pre>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    downloadFile(blob, `${base}-ocr.doc`);
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setConfidence(null);
    setProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Image to Text (OCR)</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  تصویر سے تحریر نکالیں
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Extract high-accuracy English and Urdu text from scanned documents, receipts, screenshots, and signs.
              </p>
            </div>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              Upload New
            </button>
            <button
              onClick={handleCopy}
              disabled={!extractedText || isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
            isDragging ? 'border-purple-500 bg-purple-50/50 scale-[0.99]' : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your document or image here for OCR</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Supports scans, photos of books, receipts, and signs in English and Urdu.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-sm">
            <Upload className="w-4 h-4" />
            Select Image
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls & Original Image */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Recognition Language
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLanguageChange('eng')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition ${
                    language === 'eng'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('urd')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition ${
                    language === 'urd'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-urdu text-sm">اردو (Urdu)</span>
                </button>
              </div>
            </div>

            {/* Original Preview */}
            <div className="border border-gray-200 rounded-xl p-2 bg-gray-50/50 flex flex-col items-center">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Original"
                  className="max-h-[240px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                />
              )}
              <span className="text-xs text-gray-400 mt-2">Source Document</span>
            </div>

            {/* Confidence metric */}
            {confidence !== null && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-purple-700 font-medium">Recognition Confidence</span>
                <span className="text-xs font-bold text-purple-800 bg-white px-2 py-0.5 rounded shadow-xs">
                  {confidence}%
                </span>
              </div>
            )}
          </div>

          {/* Extracted Text Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Extracted Text</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadTxt}
                  disabled={!extractedText || isProcessing}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40"
                >
                  Download .TXT
                </button>
                <button
                  onClick={handleDownloadDoc}
                  disabled={!extractedText || isProcessing}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition disabled:opacity-40"
                >
                  Download .DOC
                </button>
              </div>
            </div>

            {isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4 min-h-[300px]">
                <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
                <div className="text-center space-y-1">
                  <div className="text-sm font-semibold text-gray-800">{statusMessage}</div>
                  <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto overflow-hidden">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted text will appear here. You can edit, copy, or download it."
                dir={language === 'urd' ? 'rtl' : 'ltr'}
                className={`w-full flex-1 min-h-[340px] p-4 bg-gray-50/70 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:border-purple-500 focus:bg-white resize-none ${
                  language === 'urd' ? 'font-urdu text-base leading-loose' : 'font-sans'
                }`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

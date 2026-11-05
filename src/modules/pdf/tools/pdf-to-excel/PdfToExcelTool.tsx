import React, { useState, useRef } from 'react';
import { 
  Table, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { pdfjsLib } from '../../engines/pdfjsHelper';

export const PdfToExcelTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [tablePreview, setTablePreview] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selected: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setTablePreview([]);

    if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file (.pdf).');
      return;
    }
    setFile(selected);

    try {
      setIsProcessing(true);
      setProcessProgress('Reading PDF Document...');

      const ab = await selected.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(ab) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const extractedRows: string[][] = [];

      for (let i = 1; i <= numPages; i++) {
        setProcessProgress(`Parsing Table Data from Page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as Array<{ str: string; transform: number[] }>;

        // Group text items by line (Y coordinate rounded to ~8pt)
        const lineMap = new Map<number, Array<{ x: number; text: string }>>();
        
        for (const item of items) {
          if (!item.str.trim()) continue;
          const x = item.transform[4];
          const y = Math.round(item.transform[5] / 8) * 8; // bucket by 8 points

          if (!lineMap.has(y)) {
            lineMap.set(y, []);
          }
          lineMap.get(y)!.push({ x, text: item.str });
        }

        // Sort lines descending by Y (top to bottom)
        const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);

        for (const y of sortedY) {
          const lineItems = lineMap.get(y)!.sort((a, b) => a.x - b.x);
          const rowCells = lineItems.map(item => item.text.trim()).filter(Boolean);
          if (rowCells.length > 0) {
            extractedRows.push(rowCells);
          }
        }
      }

      if (extractedRows.length === 0) {
        setErrorMsg('No text or tabular records could be extracted from this PDF.');
        return;
      }

      // Normalize row widths
      const maxCols = Math.max(...extractedRows.map(r => r.length));
      const normalizedRows = extractedRows.map(row => {
        const padded = [...row];
        while (padded.length < maxCols) {
          padded.push('');
        }
        return padded;
      });

      setTablePreview(normalizedRows);
      setSuccessMsg(`Extracted ${normalizedRows.length} tabular rows from ${numPages} pages! Ready to download as Excel.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Could not parse tabular data from this PDF file.');
    } finally {
      setIsProcessing(false);
      setProcessProgress('');
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

  const handleDownloadExcel = (format: 'xlsx' | 'csv') => {
    if (tablePreview.length === 0) return;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(tablePreview);
    XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');

    const baseName = file?.name.replace(/\.pdf$/i, '') || 'spreadsheet';

    if (format === 'xlsx') {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const csvStr = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTablePreview([]);
    setSuccessMsg(null);
    setErrorMsg(null);
    setProcessProgress('');
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
              <Table className="w-5 h-5 text-rose-600" />
              <span>PDF to Excel (.xlsx) & CSV Table Extractor</span>
            </h2>
            <p className="text-xs text-slate-500">
              Extract real table rows, columns, bank statements, and accounting records into Microsoft Excel.
            </p>
          </div>

          {(file || tablePreview.length > 0) && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Upload New</span>
            </button>
          )}
        </div>

        {/* Upload Drop Zone */}
        {!file && tablePreview.length === 0 ? (
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
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-base text-slate-900">
                    Click to select PDF or drag & drop here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    100% Client-Side Private • Real table rows & column reconstruction
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
          <div className="space-y-5">
            {/* File Info Card */}
            {file && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • {tablePreview.length} extracted rows
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isProcessing ? (
              <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800">{processProgress}</p>
                <p className="text-xs text-slate-400">Parsing table columns and coordinate matrix...</p>
              </div>
            ) : tablePreview.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Extracted Table Preview (First 15 Rows):</span>
                  <span className="text-slate-400 font-normal">{tablePreview.length} rows total</span>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-80">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-[11px] font-black uppercase text-slate-600 border-b border-slate-200 sticky top-0">
                      <tr>
                        {tablePreview[0]?.map((_, idx) => (
                          <th key={idx} className="p-3">
                            Col {idx + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {tablePreview.slice(0, 15).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 font-medium whitespace-nowrap max-w-xs truncate">
                              {cell || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* Excel Download Buttons */}
            {tablePreview.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleDownloadExcel('xlsx')}
                  className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Excel Workbook (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleDownloadExcel('csv')}
                  className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV (.csv)</span>
                </button>
              </div>
            )}
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

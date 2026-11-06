import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Code2, 
  Globe,
  Boxes, 
  FileCheck, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck, 
  LayoutDashboard
} from 'lucide-react';
import { DEVELOPER_TOOLS, type DeveloperToolId } from './types/developerTypes';
import { DeveloperDashboard } from './dashboard/DeveloperDashboard';

// All Implemented Developer Tools
import { WebsiteAuditStudioTool } from './tools/WebsiteAuditStudioTool';
import { TypeSchemaConverterTool } from './tools/TypeSchemaConverterTool';
import { EnvDoctorTool } from './tools/EnvDoctorTool';
import { AiContextOptimizerTool } from './tools/AiContextOptimizerTool';
import { JsonFormatterTool } from './tools/JsonFormatterTool';
import { Base64Tool } from './tools/Base64Tool';
import { UuidPasswordTool } from './tools/UuidPasswordTool';
import { RegexTesterTool } from './tools/RegexTesterTool';
import { JwtInspectorTool } from './tools/JwtInspectorTool';
import { CurlToCodeTool } from './tools/CurlToCodeTool';
import { GitConflictResolverTool } from './tools/GitConflictResolverTool';
import { OpenGraphPreviewerTool } from './tools/OpenGraphPreviewerTool';
import { SvgToReactTool } from './tools/SvgToReactTool';

function normalizeDevToolId(id?: string | null): DeveloperToolId {
  if (!id) return 'website-auditor';
  const map: Record<string, DeveloperToolId> = {
    'website-auditor': 'website-auditor',
    'type-schema-converter': 'type-schema-converter',
    'env-doctor': 'env-doctor',
    'ai-context-optimizer': 'ai-context-optimizer',
    'json-formatter': 'json-formatter',
    'html-formatter': 'json-formatter',
    'css-minifier': 'json-formatter',
    'javascript-minifier': 'json-formatter',
    'markdown-editor': 'json-formatter',
    'base64-encoder-decoder': 'base64',
    'url-encoder-decoder': 'base64',
    'base64': 'base64',
    'uuid-generator': 'uuid-password',
    'password-generator': 'uuid-password',
    'uuid-password': 'uuid-password',
    'regex-tester': 'regex-tester',
    'jwt-inspector': 'jwt-inspector',
    'curl-to-code': 'curl-to-code',
    'git-conflict-resolver': 'git-conflict-resolver',
    'opengraph-previewer': 'opengraph-previewer',
    'svg-to-react': 'svg-to-react',
  };
  return map[id] || 'website-auditor';
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Globe,
  Boxes,
  FileCheck,
  Sparkles,
  Code2
};

interface DeveloperStudioAppProps {
  onBackToTools?: () => void;
  initialToolId?: string;
}

export const DeveloperStudioApp: React.FC<DeveloperStudioAppProps> = ({
  onBackToTools,
  initialToolId
}) => {
  const [activeToolId, setActiveToolId] = useState<DeveloperToolId | null>(normalizeDevToolId(initialToolId));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeTool = DEVELOPER_TOOLS.find((t) => t.id === activeToolId);

  const renderActiveTool = () => {
    switch (activeToolId) {
      case 'website-auditor':
        return <WebsiteAuditStudioTool />;
      case 'type-schema-converter':
        return <TypeSchemaConverterTool />;
      case 'env-doctor':
        return <EnvDoctorTool />;
      case 'ai-context-optimizer':
        return <AiContextOptimizerTool />;
      case 'json-formatter':
        return <JsonFormatterTool />;
      case 'base64':
        return <Base64Tool />;
      case 'uuid-password':
        return <UuidPasswordTool />;
      case 'regex-tester':
        return <RegexTesterTool />;
      case 'jwt-inspector':
        return <JwtInspectorTool />;
      case 'curl-to-code':
        return <CurlToCodeTool />;
      case 'git-conflict-resolver':
        return <GitConflictResolverTool />;
      case 'opengraph-previewer':
        return <OpenGraphPreviewerTool />;
      case 'svg-to-react':
        return <SvgToReactTool />;
      default:
        return <WebsiteAuditStudioTool />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 flex flex-col">
      {/* Studio Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Navigation and Brand */}
          <div className="flex items-center gap-3">
            {onBackToTools && (
              <button
                onClick={onBackToTools}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-700 bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-xl transition border border-gray-200 cursor-pointer"
                title="Return to Main Suite"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All Studios</span>
              </button>
            )}

            <button
              onClick={() => setActiveToolId(null)}
              className="flex items-center gap-2.5 font-bold text-gray-900 hover:text-indigo-600 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-black tracking-tight flex items-center gap-1.5">
                  SiftX Developer <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded font-bold">Suite</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">4 Core High-Impact Tools</span>
              </div>
            </button>
          </div>

          {/* Center: 4-Tool Switcher Tabs / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition cursor-pointer"
            >
              <span className="truncate max-w-[140px] sm:max-w-[220px]">
                {activeTool ? activeTool.name : '4 Essential Tools'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 p-2 divide-y divide-gray-100">
                  <div className="pb-1.5">
                    <button
                      onClick={() => {
                        setActiveToolId(null);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                        activeToolId === null
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                      <span>Studio Dashboard (4 Tools)</span>
                    </button>
                  </div>

                  <div className="pt-1.5 space-y-1">
                    {DEVELOPER_TOOLS.map((t) => {
                      const IconC = ICON_MAP[t.icon] || Code2;
                      const isSel = activeToolId === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveToolId(t.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                            isSel
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <IconC className={`w-4 h-4 ${isSel ? 'text-indigo-600' : 'text-gray-400'}`} />
                            <span className="truncate">{t.name}</span>
                          </div>
                          {t.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                              {t.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Guarantee Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Client-Side Privacy</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 p-4 sm:p-8">
        {activeToolId === null ? (
          <DeveloperDashboard onSelectTool={(id) => setActiveToolId(id)} />
        ) : (
          renderActiveTool()
        )}
      </main>
    </div>
  );
};

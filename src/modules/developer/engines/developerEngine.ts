/**
 * SiftX Developer Studio - Core Engine
 * 100% Client-Side, Zero Server Network Roundtrips, Privacy-Preserving
 */

// ============================================================================
// 1. UNIVERSAL TYPE & SCHEMA GENERATOR (JSON -> TS, Zod, Pydantic, Go)
// ============================================================================

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') || 'Root';
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/[^a-zA-Z0-9_]/g, '_');
}

export function jsonToTypeScript(jsonStr: string, rootName: string = 'RootModel'): { code: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    const interfaces: string[] = [];
    const generatedTypes = new Set<string>();

    function parseType(value: any, keyName: string): string {
      if (value === null) return 'null | any';
      if (value === undefined) return 'undefined';
      const type = typeof value;

      if (type === 'string') return 'string';
      if (type === 'number') return 'number';
      if (type === 'boolean') return 'boolean';

      if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]';
        const elemType = parseType(value[0], keyName.endsWith('s') ? keyName.slice(0, -1) : keyName + 'Item');
        return `${elemType}[]`;
      }

      if (type === 'object') {
        const typeName = toPascalCase(keyName);
        if (!generatedTypes.has(typeName)) {
          generatedTypes.add(typeName);
          const fields = Object.entries(value).map(([k, v]) => {
            const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
            const isOpt = v === null || v === undefined;
            return `  ${safeKey}${isOpt ? '?' : ''}: ${parseType(v, k)};`;
          });
          interfaces.unshift(`export interface ${typeName} {\n${fields.join('\n')}\n}`);
        }
        return typeName;
      }

      return 'any';
    }

    parseType(data, rootName);
    return { code: interfaces.join('\n\n') };
  } catch (err: any) {
    return { code: '', error: err.message || 'Invalid JSON syntax' };
  }
}

export function jsonToZodSchema(jsonStr: string, rootName: string = 'rootSchema'): { code: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    const schemas: string[] = [];
    const generated = new Set<string>();

    function parseZod(value: any, name: string): string {
      if (value === null) return 'z.any().nullable()';
      const type = typeof value;

      if (type === 'string') return 'z.string()';
      if (type === 'number') return 'z.number()';
      if (type === 'boolean') return 'z.boolean()';

      if (Array.isArray(value)) {
        if (value.length === 0) return 'z.array(z.any())';
        const inner = parseZod(value[0], name + 'Item');
        return `z.array(${inner})`;
      }

      if (type === 'object') {
        const schemaName = name.endsWith('Schema') ? name : name + 'Schema';
        if (!generated.has(schemaName)) {
          generated.add(schemaName);
          const fields = Object.entries(value).map(([k, v]) => {
            const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
            return `  ${safeKey}: ${parseZod(v, k)},`;
          });
          schemas.unshift(`export const ${schemaName} = z.object({\n${fields.join('\n')}\n});\n\nexport type ${toPascalCase(name)} = z.infer<typeof ${schemaName}>;`);
        }
        return schemaName;
      }

      return 'z.any()';
    }

    parseZod(data, rootName);
    return { code: `import { z } from 'zod';\n\n` + schemas.join('\n\n') };
  } catch (err: any) {
    return { code: '', error: err.message || 'Invalid JSON syntax' };
  }
}

export function jsonToPydantic(jsonStr: string, rootName: string = 'RootModel'): { code: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    const models: string[] = [];
    const generated = new Set<string>();

    function parsePython(value: any, keyName: string): string {
      if (value === null) return 'Optional[Any] = None';
      const type = typeof value;

      if (type === 'string') return 'str';
      if (type === 'number') return Number.isInteger(value) ? 'int' : 'float';
      if (type === 'boolean') return 'bool';

      if (Array.isArray(value)) {
        if (value.length === 0) return 'List[Any]';
        const inner = parsePython(value[0], keyName.endsWith('s') ? keyName.slice(0, -1) : keyName + 'Item');
        return `List[${inner}]`;
      }

      if (type === 'object') {
        const modelName = toPascalCase(keyName);
        if (!generated.has(modelName)) {
          generated.add(modelName);
          const fields = Object.entries(value).map(([k, v]) => {
            const pyField = toSnakeCase(k);
            const pyType = parsePython(v, k);
            return `    ${pyField}: ${pyType}`;
          });
          models.unshift(`class ${modelName}(BaseModel):\n${fields.join('\n') || '    pass'}`);
        }
        return modelName;
      }

      return 'Any';
    }

    parsePython(data, rootName);
    return {
      code: `from typing import List, Optional, Any\nfrom pydantic import BaseModel\n\n` + models.join('\n\n')
    };
  } catch (err: any) {
    return { code: '', error: err.message || 'Invalid JSON syntax' };
  }
}

export function jsonToGoStruct(jsonStr: string, rootName: string = 'Root'): { code: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    const structs: string[] = [];
    const generated = new Set<string>();

    function parseGo(value: any, keyName: string): string {
      if (value === null) return 'interface{}';
      const type = typeof value;

      if (type === 'string') return 'string';
      if (type === 'number') return Number.isInteger(value) ? 'int64' : 'float64';
      if (type === 'boolean') return 'bool';

      if (Array.isArray(value)) {
        if (value.length === 0) return '[]interface{}';
        const inner = parseGo(value[0], keyName.endsWith('s') ? keyName.slice(0, -1) : keyName + 'Item');
        return `[]${inner}`;
      }

      if (type === 'object') {
        const structName = toPascalCase(keyName);
        if (!generated.has(structName)) {
          generated.add(structName);
          const fields = Object.entries(value).map(([k, v]) => {
            const goField = toPascalCase(k);
            const goType = parseGo(v, k);
            return `\t${goField} ${goType} \`json:"${k}"\``;
          });
          structs.unshift(`type ${structName} struct {\n${fields.join('\n')}\n}`);
        }
        return structName;
      }

      return 'interface{}';
    }

    parseGo(data, rootName);
    return { code: structs.join('\n\n') };
  } catch (err: any) {
    return { code: '', error: err.message || 'Invalid JSON syntax' };
  }
}

// ============================================================================
// 2. .ENV DOCTOR & SECRET LEAK AUDITOR
// ============================================================================

export interface EnvAuditItem {
  key: string;
  exampleValue?: string;
  actualValue?: string;
  status: 'ok' | 'missing' | 'extra' | 'syntax_warning' | 'security_leak' | 'duplicate';
  message: string;
}

export function auditEnvFiles(exampleContent: string, actualContent: string): {
  items: EnvAuditItem[];
  missingCount: number;
  warningsCount: number;
  securityLeaksCount: number;
  healthScore: number;
} {
  const parseLines = (content: string) => {
    const map = new Map<string, { value: string; raw: string; lineNum: number }>();
    const duplicates: string[] = [];
    const syntaxErrors: { key: string; msg: string }[] = [];

    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) {
        syntaxErrors.push({ key: `Line ${idx + 1}`, msg: 'Missing equals sign (=) in variable declaration' });
        return;
      }

      const rawKey = line.substring(0, eqIdx).trim();
      const rawVal = line.substring(eqIdx + 1);

      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(rawKey)) {
        syntaxErrors.push({ key: rawKey, msg: `Invalid environment variable key name "${rawKey}". Only alphanumeric characters and underscores are allowed.` });
      }

      // Check for unquoted whitespace in value
      if (rawVal.trim().includes(' ') && !rawVal.trim().startsWith('"') && !rawVal.trim().startsWith("'")) {
        syntaxErrors.push({ key: rawKey, msg: 'Value contains unquoted spaces which may break dotenv parsers in production.' });
      }

      if (map.has(rawKey)) {
        duplicates.push(rawKey);
      } else {
        map.set(rawKey, { value: rawVal.trim(), raw: line, lineNum: idx + 1 });
      }
    });

    return { map, duplicates, syntaxErrors };
  };

  const exParsed = parseLines(exampleContent);
  const actParsed = parseLines(actualContent);

  const items: EnvAuditItem[] = [];
  const sensitivePatterns = [
    /sk_live_[a-zA-Z0-9]+/i,
    /ghp_[a-zA-Z0-9]+/i,
    /AKIA[0-9A-Z]{16}/,
    /postgres:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@/i,
    /mongodb(\+srv)?:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@/i,
    /bearer\s+[a-zA-Z0-9._-]+/i,
  ];

  // 1. Check all expected keys from example
  exParsed.map.forEach((exData, key) => {
    if (!actParsed.map.has(key)) {
      items.push({
        key,
        exampleValue: exData.value,
        status: 'missing',
        message: 'Defined in .env.example but completely MISSING in your active .env file'
      });
    } else {
      const actData = actParsed.map.get(key)!;
      let isSecurityLeak = false;

      sensitivePatterns.forEach(pattern => {
        if (pattern.test(actData.value)) {
          isSecurityLeak = true;
        }
      });

      if (isSecurityLeak) {
        items.push({
          key,
          exampleValue: exData.value,
          actualValue: actData.value.slice(0, 4) + '...' + actData.value.slice(-4),
          status: 'security_leak',
          message: 'CRITICAL SECURITY: Matches real production API secret or database credential. Ensure this file is added to .gitignore!'
        });
      } else if (!actData.value || actData.value === 'your_key_here' || actData.value === 'CHANGE_ME') {
        items.push({
          key,
          exampleValue: exData.value,
          actualValue: actData.value,
          status: 'syntax_warning',
          message: 'Variable exists but contains a placeholder or empty value'
        });
      } else {
        items.push({
          key,
          exampleValue: exData.value,
          actualValue: actData.value.slice(0, 3) + '••••••••',
          status: 'ok',
          message: 'Configured and present'
        });
      }
    }
  });

  // 2. Check for extra keys in actual that are not in example
  actParsed.map.forEach((actData, key) => {
    if (!exParsed.map.has(key)) {
      items.push({
        key,
        actualValue: actData.value.slice(0, 3) + '••••••••',
        status: 'extra',
        message: 'Present in active .env but not documented in .env.example'
      });
    }
  });

  // 3. Add duplicates and syntax errors
  actParsed.duplicates.forEach(dupKey => {
    items.unshift({
      key: dupKey,
      status: 'duplicate',
      message: `Duplicate declaration of "${dupKey}". Later values will silently override earlier ones.`
    });
  });

  actParsed.syntaxErrors.forEach(err => {
    items.unshift({
      key: err.key,
      status: 'syntax_warning',
      message: err.msg
    });
  });

  const missingCount = items.filter(i => i.status === 'missing').length;
  const warningsCount = items.filter(i => i.status === 'syntax_warning' || i.status === 'duplicate').length;
  const securityLeaksCount = items.filter(i => i.status === 'security_leak').length;
  
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (missingCount * 20 + securityLeaksCount * 30 + warningsCount * 10))));

  return { items, missingCount, warningsCount, securityLeaksCount, healthScore };
}

// ============================================================================
// 3. AI PROMPT CONTEXT OPTIMIZER & TOKEN ESTIMATOR
// ============================================================================

export interface ContextOptimizationResult {
  optimizedText: string;
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  compressionRatio: number;
  costEstimates: {
    model: string;
    originalCost: number;
    optimizedCost: number;
    savings: number;
  }[];
}

export function optimizePromptContext(
  rawText: string,
  options: {
    removeComments?: boolean;
    removeBlankLines?: boolean;
    condenseJson?: boolean;
    trimLineSpaces?: boolean;
  } = {}
): ContextOptimizationResult {
  const {
    removeComments = true,
    removeBlankLines = true,
    condenseJson = true,
    trimLineSpaces = true
  } = options;

  let text = rawText;

  // 1. Remove comments
  if (removeComments) {
    // Multi-line C/JS/CSS comments /* ... */
    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
    // Single line // comments (careful not to kill https://)
    text = text.replace(/(^|[^:])\/\/[^\n\r]*/g, '$1');
    // Python / Bash / Yaml # comments
    text = text.replace(/(^|\s)#[^\n\r]*/g, '$1');
    // HTML / XML <!-- ... --> comments
    text = text.replace(/<!--[\s\S]*?-->/g, '');
  }

  // 2. Condense JSON blocks if present
  if (condenseJson) {
    text = text.replace(/\{[\s\S]*?\}/g, (match) => {
      try {
        const parsed = JSON.parse(match);
        return JSON.stringify(parsed);
      } catch {
        return match;
      }
    });
  }

  // 3. Trim whitespace and blank lines
  if (trimLineSpaces) {
    text = text
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n');
  }

  if (removeBlankLines) {
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  }

  // Standard token heuristic: English code/prose is ~3.7 - 4.0 chars per token
  const estimateTokens = (str: string) => Math.ceil(str.length / 3.8);

  const originalTokens = estimateTokens(rawText);
  const optimizedTokens = estimateTokens(text);
  const savedTokens = Math.max(0, originalTokens - optimizedTokens);
  const compressionRatio = originalTokens > 0 
    ? Math.round(((originalTokens - optimizedTokens) / originalTokens) * 100) 
    : 0;

  // Pricing rates per 1M input tokens (as of 2026 standard rates)
  const models = [
    { name: 'Gemini 2.0 Flash', ratePerM: 0.10 },
    { name: 'Claude 3.5 Sonnet', ratePerM: 3.00 },
    { name: 'GPT-4o', ratePerM: 2.50 },
    { name: 'DeepSeek V3', ratePerM: 0.14 }
  ];

  const costEstimates = models.map(m => {
    const originalCost = (originalTokens / 1_000_000) * m.ratePerM;
    const optimizedCost = (optimizedTokens / 1_000_000) * m.ratePerM;
    return {
      model: m.name,
      originalCost: Number(originalCost.toFixed(5)),
      optimizedCost: Number(optimizedCost.toFixed(5)),
      savings: Number((originalCost - optimizedCost).toFixed(5))
    };
  });

  return {
    optimizedText: text,
    originalTokens,
    optimizedTokens,
    savedTokens,
    compressionRatio,
    costEstimates
  };
}

// ============================================================================
// 4. SVG TO REACT / TSX COMPONENT CLEANER
// ============================================================================

export function cleanAndConvertSvgToReact(svgRaw: string, componentName: string = 'CustomIcon'): {
  reactComponent: string;
  cleanSvg: string;
  dataUri: string;
  error?: string;
} {
  try {
    let clean = svgRaw.trim();

    // Extract inner attributes and content
    const svgMatch = clean.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/i);
    if (!svgMatch) {
      return { reactComponent: '', cleanSvg: '', dataUri: '', error: 'Valid <svg> root element not found' };
    }

    let attrs = svgMatch[1];
    let innerContent = svgMatch[2];

    // Clean XML headers & doc types
    clean = clean.replace(/<\?xml[\s\S]*?\?>/i, '').replace(/<!DOCTYPE[\s\S]*?>/i, '').trim();

    // Transform attributes to JSX camelCase
    const replacements: [RegExp, string][] = [
      [/\bclass=/g, 'className='],
      [/\bclip-path=/g, 'clipPath='],
      [/\bfill-rule=/g, 'fillRule='],
      [/\bclip-rule=/g, 'clipRule='],
      [/\bstroke-width=/g, 'strokeWidth='],
      [/\bstroke-linecap=/g, 'strokeLinecap='],
      [/\bstroke-linejoin=/g, 'strokeLinejoin='],
      [/\bstroke-miterlimit=/g, 'strokeMiterlimit='],
      [/\bstop-color=/g, 'stopColor='],
      [/\bstop-opacity=/g, 'stopOpacity='],
      [/\bxml:space="[^"]*"/g, ''],
      [/\bxmlns:xlink="[^"]*"/g, ''],
    ];

    replacements.forEach(([pattern, repl]) => {
      attrs = attrs.replace(pattern, repl);
      innerContent = innerContent.replace(pattern, repl);
    });

    // Make width and height customizable props if present
    const hasViewBox = /viewBox="[^"]*"/i.test(attrs);
    const viewBoxAttr = attrs.match(/viewBox="([^"]*)"/i)?.[0] || (hasViewBox ? '' : 'viewBox="0 0 24 24"');

    const cleanSvg = `<svg ${viewBoxAttr} fill="none" stroke="currentColor" ${innerContent.includes('fill=') ? '' : ''} xmlns="http://www.w3.org/2000/svg">\n${innerContent.trim()}\n</svg>`;

    const pascalName = toPascalCase(componentName);

    const reactComponent = `import React from 'react';

export interface ${pascalName}Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

export const ${pascalName}: React.FC<${pascalName}Props> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      ${viewBoxAttr}
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      ${innerContent.trim()}
    </svg>
  );
};

export default ${pascalName};`;

    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;

    return { reactComponent, cleanSvg, dataUri };
  } catch (err: any) {
    return { reactComponent: '', cleanSvg: '', dataUri: '', error: err.message || 'Error parsing SVG' };
  }
}

// ============================================================================
// 5. VISUAL GIT MERGE CONFLICT RESOLVER
// ============================================================================

export interface GitConflictBlock {
  id: string;
  currentOurs: string;
  incomingTheirs: string;
  currentLabel: string;
  incomingLabel: string;
  selectedResolution: 'ours' | 'theirs' | 'both' | 'manual';
  manualText?: string;
}

export function parseGitConflicts(conflictRaw: string): {
  blocks: GitConflictBlock[];
  hasConflicts: boolean;
} {
  const regex = /<<<<<<< (.*?)\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> (.*?)\n/g;
  const blocks: GitConflictBlock[] = [];
  let match;
  let counter = 1;

  while ((match = regex.exec(conflictRaw)) !== null) {
    blocks.push({
      id: `conflict-${counter++}`,
      currentLabel: match[1]?.trim() || 'HEAD (Current Change)',
      currentOurs: match[2],
      incomingTheirs: match[3],
      incomingLabel: match[4]?.trim() || 'Incoming Change',
      selectedResolution: 'ours'
    });
  }

  return {
    blocks,
    hasConflicts: blocks.length > 0
  };
}

export function assembleResolvedGitConflict(
  originalRaw: string,
  resolutions: Record<string, 'ours' | 'theirs' | 'both'>
): string {
  let counter = 1;
  return originalRaw.replace(
    /<<<<<<< (.*?)\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> (.*?)\n/g,
    (_match, _label1, ours, theirs) => {
      const id = `conflict-${counter++}`;
      const choice = resolutions[id] || 'ours';
      if (choice === 'theirs') return theirs;
      if (choice === 'both') return ours + theirs;
      return ours;
    }
  );
}

// ============================================================================
// 6. JWT INSPECTOR & OFFLINE DECODER
// ============================================================================

export interface JwtInspection {
  header: any;
  payload: any;
  signature: string;
  isExpired: boolean;
  expiresAt?: string;
  issuedAt?: string;
  timeLeftFormatted?: string;
  error?: string;
}

export function inspectJwt(tokenStr: string): JwtInspection {
  try {
    const parts = tokenStr.trim().split('.');
    if (parts.length !== 3) {
      return {
        header: null,
        payload: null,
        signature: '',
        isExpired: false,
        error: 'Invalid JWT token. Expected 3 base64url segments separated by dots (header.payload.signature).'
      };
    }

    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    };

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    let isExpired = false;
    let expiresAt: string | undefined;
    let issuedAt: string | undefined;
    let timeLeftFormatted: string | undefined;

    if (payload.exp && typeof payload.exp === 'number') {
      const expDate = new Date(payload.exp * 1000);
      expiresAt = expDate.toLocaleString();
      const now = Date.now();
      const diffMs = expDate.getTime() - now;

      if (diffMs < 0) {
        isExpired = true;
        timeLeftFormatted = `Expired ${Math.abs(Math.round(diffMs / 60000))} minutes ago`;
      } else {
        const mins = Math.floor(diffMs / 60000);
        const hours = Math.floor(mins / 60);
        timeLeftFormatted = hours > 0 ? `${hours}h ${mins % 60}m remaining` : `${mins} minutes remaining`;
      }
    }

    if (payload.iat && typeof payload.iat === 'number') {
      issuedAt = new Date(payload.iat * 1000).toLocaleString();
    }

    return { header, payload, signature, isExpired, expiresAt, issuedAt, timeLeftFormatted };
  } catch (err: any) {
    return {
      header: null,
      payload: null,
      signature: '',
      isExpired: false,
      error: err.message || 'Failed to decode JWT string'
    };
  }
}

// ============================================================================
// 7. CURL TO CODE TRANSPILER
// ============================================================================

export interface TranspiledCurl {
  fetchCode: string;
  axiosCode: string;
  pythonCode: string;
  goCode: string;
  error?: string;
}

export function transpileCurl(curlRaw: string): TranspiledCurl {
  try {
    let text = curlRaw.trim().replace(/\\\n/g, ' ');
    if (!text.toLowerCase().startsWith('curl')) {
      return { fetchCode: '', axiosCode: '', pythonCode: '', goCode: '', error: 'Command must start with "curl"' };
    }

    let url = '';
    let method = 'GET';
    const headers: Record<string, string> = {};
    let data = '';

    // Simple arg tokenizer
    const tokens: string[] = [];
    const tokenRegex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let match;
    while ((match = tokenRegex.exec(text)) !== null) {
      tokens.push(match[1] || match[2] || match[0]);
    }

    for (let i = 1; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok === '-X' || tok === '--request') {
        method = (tokens[++i] || 'GET').toUpperCase();
      } else if (tok === '-H' || tok === '--header') {
        const headerLine = tokens[++i] || '';
        const colon = headerLine.indexOf(':');
        if (colon !== -1) {
          headers[headerLine.substring(0, colon).trim()] = headerLine.substring(colon + 1).trim();
        }
      } else if (tok === '-d' || tok === '--data' || tok === '--data-raw') {
        data = tokens[++i] || '';
        if (method === 'GET') method = 'POST';
      } else if (!tok.startsWith('-') && !url && tok.startsWith('http')) {
        url = tok;
      }
    }

    if (!url) {
      const possibleUrl = tokens.find(t => t.startsWith('http://') || t.startsWith('https://'));
      if (possibleUrl) url = possibleUrl;
    }

    if (!url) {
      return { fetchCode: '', axiosCode: '', pythonCode: '', goCode: '', error: 'Target URL not found in cURL command' };
    }

    // 1. JavaScript Fetch
    const fetchOptions: any = { method };
    if (Object.keys(headers).length > 0) fetchOptions.headers = headers;
    if (data) fetchOptions.body = data;

    const fetchCode = `const response = await fetch("${url}", ${JSON.stringify(fetchOptions, null, 2)});\nconst data = await response.json();\nconsole.log(data);`;

    // 2. JavaScript Axios
    const axiosCode = `import axios from 'axios';\n\nconst { data } = await axios({\n  method: '${method.toLowerCase()}',\n  url: '${url}',\n  headers: ${JSON.stringify(headers, null, 2)},\n  data: ${data ? (data.startsWith('{') ? data : JSON.stringify(data)) : 'undefined'}\n});\nconsole.log(data);`;

    // 3. Python Requests
    const pythonHeaders = Object.keys(headers).length > 0
      ? `headers = ${JSON.stringify(headers, null, 4)}\n`
      : 'headers = {}\n';
    const pythonData = data
      ? (data.startsWith('{') ? `json_data = ${data}\n` : `data = ${JSON.stringify(data)}\n`)
      : '';

    const pythonCode = `import requests\n\nurl = "${url}"\n${pythonHeaders}${pythonData}response = requests.${method.toLowerCase()}(url, headers=headers${data ? (data.startsWith('{') ? ', json=json_data' : ', data=data') : ''})\nprint(response.json())`;

    // 4. Go net/http
    const goCode = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n\t"strings"\n)\n\nfunc main() {\n\tclient := &http.Client{}\n\treq, err := http.NewRequest("${method}", "${url}", strings.NewReader(${JSON.stringify(data)}))\n\tif err != nil {\n\t\tpanic(err)\n\t}\n${Object.entries(headers).map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`).join('\n')}\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`;

    return { fetchCode, axiosCode, pythonCode, goCode };
  } catch (err: any) {
    return { fetchCode: '', axiosCode: '', pythonCode: '', goCode: '', error: err.message || 'Transpilation failed' };
  }
}

// ============================================================================
// 8. FORMATTERS & FAST UTILITIES
// ============================================================================

export function formatJsonString(raw: string, space: number = 2): { result: string; error?: string } {
  try {
    const obj = JSON.parse(raw);
    return { result: JSON.stringify(obj, null, space) };
  } catch (err: any) {
    return { result: '', error: err.message };
  }
}

export function minifyJsonString(raw: string): { result: string; error?: string } {
  try {
    const obj = JSON.parse(raw);
    return { result: JSON.stringify(obj) };
  } catch (err: any) {
    return { result: '', error: err.message };
  }
}

export function minifyCssString(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/\s+/g, ' ')             // collapse whitespace
    .replace(/\s*([\{\}\:\;\,])\s*/g, '$1') // remove space around separators
    .replace(/;}/g, '}')             // remove last semicolon
    .trim();
}

export function minifyJsSnippet(js: string): string {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n\r]*/g, '$1')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export function generateCryptoUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateSecurePassword(length: number = 16, includeSymbols: boolean = true): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + (includeSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '');
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

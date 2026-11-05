import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Globe, 
  Wifi, 
  MessageSquare, 
  FileText,
  Sliders
} from 'lucide-react';
import QRCode from 'qrcode';
import { downloadFile } from '../engines/imageEngine';

type QrType = 'url' | 'text' | 'wifi' | 'whatsapp';

export const QrGeneratorTool: React.FC = () => {
  const [type, setType] = useState<QrType>('url');
  const [urlInput, setUrlInput] = useState<string>('https://google.com');
  const [textInput, setTextInput] = useState<string>('Welcome to SiftX Creative Studio!');
  const [wifiSsid, setWifiSsid] = useState<string>('Home_Fiber_5G');
  const [wifiPass, setWifiPass] = useState<string>('');
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [phoneInput, setPhoneInput] = useState<string>('+92 300 1234567');
  const [waMessage, setWaMessage] = useState<string>('Hello! I would like to connect.');

  const [fgColor, setFgColor] = useState<string>('#7c3aed');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const getPayload = (): string => {
    switch (type) {
      case 'url':
        return urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
      case 'text':
        return textInput;
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPass};;`;
      case 'whatsapp': {
        const cleanPhone = phoneInput.replace(/[^\d+]/g, '');
        const encMsg = encodeURIComponent(waMessage);
        return `https://wa.me/${cleanPhone.replace('+', '')}?text=${encMsg}`;
      }
      default:
        return urlInput;
    }
  };

  const generateCode = async () => {
    const payload = getPayload();
    if (!payload) return;
    try {
      const url = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: errorLevel,
        margin: 2,
        width: 600,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setDataUrl(url);
    } catch (err) {
      console.error('QR code generation error:', err);
    }
  };

  useEffect(() => {
    generateCode();
  }, [type, urlInput, textInput, wifiSsid, wifiPass, wifiAuth, phoneInput, waMessage, fgColor, bgColor, errorLevel]);

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-${type}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = async () => {
    const payload = getPayload();
    if (!payload) return;
    try {
      const svgString = await QRCode.toString(payload, {
        type: 'svg',
        errorCorrectionLevel: errorLevel,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      downloadFile(blob, `qrcode-${type}.svg`);
    } catch (err) {
      console.error('SVG export failed:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPayload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">QR Code Studio</h1>
                <span className="text-sm font-urdu font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  کیو آر کوڈ بنائیں
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Custom high-resolution vector and PNG QR codes with color branding, WiFi auto-connect, and WhatsApp presets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
          >
            <Download className="w-4 h-4" />
            Export SVG
          </button>
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Type & Content Config */}
        <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm space-y-6">
          {/* Modes */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'url', label: 'URL / Link', icon: Globe },
              { id: 'wifi', label: 'WiFi Hotspot', icon: Wifi },
              { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
              { id: 'text', label: 'Plain Text', icon: FileText },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = type === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setType(m.id as QrType)}
                  className={`py-2.5 px-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Form depending on type */}
          <div className="space-y-3 pt-2">
            {type === 'url' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Target Website URL</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>
            )}

            {type === 'wifi' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Password</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    placeholder="WiFi Password"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Encryption</label>
                  <select
                    value={wifiAuth}
                    onChange={(e) => setWifiAuth(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
              </div>
            )}

            {type === 'whatsapp' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Phone Number (with Country Code)</label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Pre-filled Message</label>
                  <textarea
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white resize-none"
                  />
                </div>
              </div>
            )}

            {type === 'text' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Text Content</label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white resize-none"
                />
              </div>
            )}
          </div>

          {/* Color & Styling Options */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              Brand Styling
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Pattern Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-600">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Error correction level */}
            <div className="space-y-1 pt-1">
              <label className="text-xs text-gray-600">Error Correction (Redundancy)</label>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setErrorLevel(lvl)}
                    className={`py-1 text-xs font-bold rounded-lg border transition ${
                      errorLevel === lvl
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-purple-100 shadow-sm flex flex-col items-center justify-center space-y-6">
          <div className="p-4 rounded-3xl border-2 border-purple-200 shadow-xl bg-white flex items-center justify-center">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="QR Code"
                className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-2xl"
              />
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Payload Copied!' : 'Copy Payload Data'}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center max-w-sm">
            Ready to scan by any camera app or QR scanner. Crisp vector rendering suitable for print banners and digital apps.
          </p>
        </div>
      </div>
    </div>
  );
};

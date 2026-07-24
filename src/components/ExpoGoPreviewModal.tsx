import React, { useState } from 'react';
import {
  Smartphone,
  Copy,
  CheckCircle2,
  Code,
  ShieldCheck,
  QrCode,
  Sparkles,
  Zap,
  ArrowLeft,
  Mail,
  Dna,
  ListOrdered
} from 'lucide-react';

interface ExpoGoPreviewModalProps {
  onClose?: () => void;
}

export const ExpoGoPreviewModal: React.FC<ExpoGoPreviewModalProps> = () => {
  const [mobileTab, setMobileTab] = useState<'scan' | 'report' | 'cases'>('scan');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [sampleAnalysed, setSampleAnalysed] = useState<boolean>(true);

  const expoCodeSnippet = `// OrphanDx Mobile - React Native / Expo Go Diagnostic App
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function App() {
  const [referralText, setReferralText] = useState('');
  const [report, setReport] = useState(null);

  const analyzeReferral = async () => {
    // Calls HIPAA-compliant OrphanDx API with Gemini Pro
    const res = await fetch('https://your-orphandx-server/api/analyze-referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailText: referralText, deIdentifyFirst: true }),
    });
    const data = await res.json();
    setReport(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>OrphanDx™ Mobile Workstation</Text>
      <TextInput
        multiline
        style={styles.input}
        placeholder="Paste physician referral email..."
        value={referralText}
        onChangeText={setReferralText}
      />
      <TouchableOpacity style={styles.button} onPress={analyzeReferral}>
        <Text style={styles.buttonText}>Execute Gemini Pro Clinical Scan</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#38bdf8', marginBottom: 15 },
  input: { backgroundColor: '#1e293b', color: '#fff', borderRadius: 10, padding: 15, height: 180 },
  button: { backgroundColor: '#0284c7', borderRadius: 10, padding: 15, marginTop: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(expoCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl transition-colors">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Expo Go Mobile Workstation & Native App Companion
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-platform React Native / Expo Go client for doctors on call and hospital rounds.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 text-xs px-2.5 py-1 rounded font-mono font-bold flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Expo SDK 51 Ready
          </span>
        </div>
      </div>

      {/* Grid: Mobile Device Frame Simulator + Native Code Export */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Mobile Phone Frame Simulation */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[320px] h-[640px] bg-slate-900 dark:bg-slate-950 rounded-[40px] border-4 border-slate-800 shadow-2xl p-3 flex flex-col relative overflow-hidden ring-1 ring-slate-700/50">
            {/* Phone Speaker Notch */}
            <div className="w-32 h-4 bg-slate-950 dark:bg-slate-900 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Mobile App Header */}
            <div className="bg-slate-800 dark:bg-slate-900 p-3 rounded-2xl border border-slate-700 dark:border-slate-800 mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                  Dx
                </div>
                <span className="text-xs font-bold text-white">OrphanDx Go</span>
              </div>
              <span className="bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded border border-emerald-800">
                Encrypted
              </span>
            </div>

            {/* Mobile Screen Content */}
            <div className="flex-1 bg-slate-950/90 rounded-2xl p-3 border border-slate-800 overflow-y-auto text-xs text-slate-200">
              {mobileTab === 'scan' && (
                <div className="space-y-3">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      Quick Email Intake (On Call)
                    </label>
                    <textarea
                      rows={6}
                      className="w-full bg-slate-950 text-slate-100 text-[11px] p-2 rounded-lg border border-slate-800 focus:outline-none leading-relaxed"
                      defaultValue="Dr. Reed: Referral for 28yo male with burning acroparesthesias in hands/feet, hypohidrosis, angiokeratomas, and unexplained left ventricular hypertrophy..."
                    />
                  </div>

                  <button
                    onClick={() => setMobileTab('report')}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run Gemini Pro Mobile Scan</span>
                  </button>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1 text-slate-300 font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>HIPAA Safe Harbor</span>
                    </div>
                    <p>Auto-scrubs PHI before cellular transmission.</p>
                  </div>
                </div>
              )}

              {mobileTab === 'report' && (
                <div className="space-y-2 text-[11px]">
                  <div className="bg-purple-950/80 border border-purple-800 p-2.5 rounded-xl text-purple-200">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-900 px-1.5 py-0.5 rounded text-purple-200 block mb-1">
                      RARE DISEASE PROBABLE
                    </span>
                    <h4 className="font-bold text-white text-xs">
                      Fabry Disease (GLA deficiency)
                    </h4>
                    <p className="text-[10px] text-purple-300 mt-1">
                      Confidence 94% • ORPHA: 324
                    </p>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-cyan-400 text-[10px] uppercase block">
                      Recommended Urgent Action:
                    </strong>
                    <p className="text-[10px] text-slate-300">
                      1. Order Alpha-Galactosidase A enzyme activity assay.
                    </p>
                    <p className="text-[10px] text-slate-300">
                      2. Urgent Medical Genetics referral.
                    </p>
                  </div>

                  <button
                    onClick={() => setMobileTab('scan')}
                    className="w-full py-1.5 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Scan Another Referral</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Nav Bar */}
            <div className="bg-slate-900 mt-2 p-1.5 rounded-xl border border-slate-800 flex justify-around text-[10px]">
              <button
                onClick={() => setMobileTab('scan')}
                className={`flex flex-col items-center gap-0.5 ${
                  mobileTab === 'scan' ? 'text-cyan-400 font-bold' : 'text-slate-500'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Intake</span>
              </button>
              <button
                onClick={() => setMobileTab('report')}
                className={`flex flex-col items-center gap-0.5 ${
                  mobileTab === 'report' ? 'text-cyan-400 font-bold' : 'text-slate-500'
                }`}
              >
                <Dna className="w-3.5 h-3.5" />
                <span>Dossier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Code & Expo Setup Instructions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>React Native / Expo Go Source Code</span>
              </h3>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copied!' : 'Copy Expo App.tsx'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-slate-200 text-xs font-mono p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-[300px] leading-relaxed">
              <code>{expoCodeSnippet}</code>
            </pre>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>How to Run in Expo Go on iOS & Android</span>
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <li>
                Install <strong className="text-slate-900 dark:text-white">Expo Go</strong> app from the Apple App Store or Google Play Store.
              </li>
              <li>
                Run <code className="bg-slate-200 dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-mono">npx create-expo-app OrphanDxMobile</code> in your terminal.
              </li>
              <li>
                Paste the above code into your <code className="bg-slate-200 dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-mono">App.tsx</code> file.
              </li>
              <li>
                Start the dev server using <code className="bg-slate-200 dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded font-mono">npx expo start</code> and scan the generated QR code with your camera or Expo Go app!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

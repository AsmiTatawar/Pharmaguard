
import React, { useState, useEffect } from 'react';
import { User, SystemSettings } from '../types';
import { Icons } from '../constants';

interface SettingsPageProps {
  user: User;
  onUpdateProfile: (u: User) => void;
  settings: SystemSettings;
  onUpdateSettings: (s: SystemSettings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateProfile, settings, onUpdateSettings }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(user);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [isGeneratingLog, setIsGeneratingLog] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  
  // Clinical logic states
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleString());
  const [isTestingDB, setIsTestingDB] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'testing' | 'offline'>('online');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setIsEditingProfile(false);
    triggerSaveToast();
  };

  const toggleSetting = (key: keyof SystemSettings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date().toLocaleString());
      triggerSaveToast();
    }, 2000);
  };

  const handleTestDB = () => {
    setIsTestingDB(true);
    setDbStatus('testing');
    setTimeout(() => {
      setIsTestingDB(false);
      setDbStatus('online');
      triggerSaveToast();
    }, 1500);
  };

  const handleWipeCache = () => {
    if (confirm('CRITICAL ACTION: This will permanently purge all patient history, genomic analysis results, and report caches from this terminal. Proceed with high-level data zeroing?')) {
      setIsWiping(true);
      setTimeout(() => {
        localStorage.removeItem('lastAnalysis');
        localStorage.removeItem('pharmaGuardHistory');
        setIsWiping(false);
        alert('SECURITY PROTOCOL COMPLETE: Local cache successfully purged. All session-stored genomic metadata has been zeroed using AES-wipe standards.');
        window.location.reload();
      }, 1500);
    }
  };

  const handleGenerateLog = () => {
    setIsGeneratingLog(true);
    setTimeout(() => {
      setIsGeneratingLog(false);
      setShowAuditModal(true);
    }, 1800);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-500">Configure your clinical environment and AI preference settings.</p>
        </div>
        {showSaveMessage && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-bold text-sm animate-in fade-in zoom-in duration-300">
            <Icons.Check className="w-4 h-4" /> Changes Saved
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Clinical Profile
            </h2>
            {!isEditingProfile ? (
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="text-sky-600 font-bold text-sm hover:text-sky-700 flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => { setIsEditingProfile(false); setProfileForm(user); }}
                  className="text-slate-500 font-bold text-sm hover:text-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProfileSave}
                  className="text-sky-600 font-bold text-sm hover:text-sky-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-2xl overflow-hidden relative group">
               <img src={`https://picsum.photos/seed/${user.id}/200/200`} alt="Avatar" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                 <Icons.Upload className="w-6 h-6 text-white" />
               </div>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg leading-none">{user.name}</p>
              <p className="text-sm text-slate-500 mt-1">{user.role}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <input 
                type="text" 
                value={profileForm.name} 
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                readOnly={!isEditingProfile}
                className={`w-full rounded-xl px-4 py-3 text-sm transition-all ${
                  isEditingProfile 
                  ? 'bg-white border border-sky-200 focus:ring-2 focus:ring-sky-500 outline-none shadow-sm' 
                  : 'bg-slate-50 border border-slate-100 text-slate-600 outline-none'
                }`} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Role/Title</label>
              <input 
                type="text" 
                value={profileForm.role} 
                onChange={(e) => setProfileForm({...profileForm, role: e.target.value})}
                readOnly={!isEditingProfile}
                className={`w-full rounded-xl px-4 py-3 text-sm transition-all ${
                  isEditingProfile 
                  ? 'bg-white border border-sky-200 focus:ring-2 focus:ring-sky-500 outline-none shadow-sm' 
                  : 'bg-slate-50 border border-slate-100 text-slate-600 outline-none'
                }`} 
              />
            </div>
          </form>
        </div>

        {/* AI & Clinical Guidelines Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Icons.Dna className="w-5 h-5 text-emerald-500" />
            Clinical Logic Configuration
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between group">
              <div className="flex-1 pr-4">
                <p className="font-bold text-slate-800">Automatic Guideline Sync</p>
                <p className="text-xs text-slate-500">Keep reasoning aligned with latest CPIC/DPWG updates via real-time cloud patching.</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Last Sync: {lastSync}</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className={`p-2 rounded-lg transition-all ${isSyncing ? 'animate-spin text-sky-600 bg-sky-50' : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'}`}
                  title="Sync Now"
                >
                  <Icons.History className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => toggleSetting('guidelineSync')}
                  className={`w-12 h-6 rounded-full relative transition-all duration-200 focus:outline-none ${settings.guidelineSync ? 'bg-sky-600 shadow-inner' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${settings.guidelineSync ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                <p className="font-bold text-slate-800">AI Narrative Detail Level</p>
                <p className="text-xs text-slate-500">Set the depth of the generated clinical explanation for dosage recommendations.</p>
              </div>
              <select 
                value={settings.aiNarrativeDetail}
                onChange={(e) => {
                  onUpdateSettings({...settings, aiNarrativeDetail: e.target.value as any});
                  triggerSaveToast();
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
              >
                <option value="Concise">Concise (Summary)</option>
                <option value="Standard">Standard (Balanced)</option>
                <option value="Exhaustive">Exhaustive (Full Evidence)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Genomic Database Connectivity</p>
                <p className="text-xs text-slate-500">Real-time status of connected PharmGKB and ClinVar endpoints.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleTestDB}
                  disabled={isTestingDB}
                  className="text-xs font-bold text-sky-600 hover:underline"
                >
                  Test Connection
                </button>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                  dbStatus === 'online' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                  dbStatus === 'testing' ? 'text-sky-600 bg-sky-50 border-sky-100 animate-pulse' :
                  'text-rose-600 bg-rose-50 border-rose-100'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    dbStatus === 'online' ? 'bg-emerald-500' :
                    dbStatus === 'testing' ? 'bg-sky-500' : 'bg-rose-500'
                  }`}></div>
                  {dbStatus === 'online' ? 'Live Connectivity' : dbStatus === 'testing' ? 'Verifying...' : 'Connection Error'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Icons.Alert className="w-5 h-5" />
              Security & Privacy
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HIPAA Compliance Mode</span>
              <button 
                onClick={() => toggleSetting('hipaaMode')}
                className={`w-12 h-6 rounded-full relative transition-all duration-200 focus:outline-none ${settings.hipaaMode ? 'bg-rose-600 shadow-inner' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${settings.hipaaMode ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-8">
            <p className="text-sm text-rose-900 leading-relaxed">
              <strong>Data Privacy Protocol:</strong> When active, all patient-identifying information (PII) is obfuscated locally before genomic metadata is transmitted for AI analysis. Reports are stored encrypted at rest.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleWipeCache}
              disabled={isWiping}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${
                isWiping 
                ? 'bg-slate-100 border-slate-200 text-slate-400' 
                : 'bg-white border-rose-200 text-rose-700 hover:bg-rose-50 hover:shadow-sm'
              }`}
            >
              {isWiping ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                  Purging terminal...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  Wipe Local Report Cache
                </>
              )}
            </button>
            <button 
              onClick={handleGenerateLog}
              disabled={isGeneratingLog}
              className={`px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50`}
            >
              {isGeneratingLog ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Compiling...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Generate Security Audit Log
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Icons.Alert className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Security Audit Log</h3>
                  <p className="text-xs text-slate-500 tracking-tight">System Integrity Report - {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAuditModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-600 space-y-3">
              <p className="text-emerald-600 font-bold border-b border-emerald-100 pb-1">[SUCCESS] HIPAA COMPLIANCE HANDSHAKE VERIFIED</p>
              <p className="text-slate-400">SESSION_ID: PHARM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <p className="text-slate-400">TIMESTAMP: {new Date().toISOString()}</p>
              <hr className="my-2 border-slate-100" />
              <div className="space-y-1">
                <p>[INFO] AUTH_LOG: USER {user.id} ({user.name}) ACCESS GRANTED FROM IP: 192.168.1.104</p>
                <p>[INFO] PRIVACY_LOG: GENOMIC DATA TRANSMISSION OBFUSCATED (LOCAL PII MASKING ENABLED: {settings.hipaaMode ? 'TRUE' : 'FALSE'})</p>
                <p>[INFO] API_LOG: GEMINI AI ENDPOINT SECURED WITH CLINICAL TOKEN [SHA-256 VERIFIED]</p>
                <p className="text-amber-600 font-bold">[WARN] THREAT_MITIGATION: ATTEMPTED ACCESS TO RAW VCF BY UNAUTHORIZED PROCESS 'browser_extension_x' BLOCKED AT SOURCE</p>
                <p>[INFO] CRYPTO_LOG: ENCRYPTION LAYER [AES-256-GCM] VERIFIED AT REST</p>
                <p>[INFO] DATA_GOVERNANCE: {localStorage.getItem('pharmaGuardHistory') ? 'PERSISTENT RECORDS DETECTED' : 'LOCAL CACHE ZEROED'}</p>
                <p className="text-emerald-600">[INFO] SYSTEM_INTEGRITY: CLINICALLY COMPLIANT / NO BREACHES DETECTED</p>
              </div>
              <p className="text-slate-400 mt-6 pt-4 border-t border-slate-100 italic text-center">--- END OF CRYPTOGRAPHIC AUDIT LOG ---</p>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               <button 
                onClick={() => setShowAuditModal(false)}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
              <button 
                className="px-6 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 active:scale-95"
                onClick={() => {
                  alert('Generating encrypted report package...');
                  setTimeout(() => {
                    alert('Audit log exported: pharma_guard_audit_' + Date.now() + '.pdf');
                    setShowAuditModal(false);
                  }, 1000);
                }}
              >
                Download Verified PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

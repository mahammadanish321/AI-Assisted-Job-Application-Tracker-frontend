import { useState, useEffect } from 'react';
import { X, Building2, Calendar, Check, Copy, Wand2, Loader2, Sparkles, MapPin, Code2, Globe, Save, Upload, Link2, Ghost, Palette } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateApplication, generateStrategicSummary } from '../api';
import toast from 'react-hot-toast';

interface DetailViewModalProps {
  application: any;
  onClose: () => void;
}

export default function DetailViewModal({ application, onClose }: DetailViewModalProps) {
  const { isDark } = useDarkMode();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab ] = useState<'details' | 'ai'>('details');
  const [bullets, setBullets] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [experienceInput, setExperienceInput] = useState("Experienced software engineer with full-stack capabilities.");
  
  // Form State
  const [formData, setFormData] = useState({
    company: application.company || '',
    role: application.role || '',
    location: application.location || '',
    techStack: application.techStack || '',
    deadline: application.deadline ? new Date(application.deadline).toISOString().split('T')[0] : '',
    startDate: application.startDate ? new Date(application.startDate).toISOString().split('T')[0] : '',
    salaryRange: application.salaryRange || '',
    notes: application.notes || '',
    strategicNotes: application.strategicNotes || '',
    isInternship: application.isInternship || false,
    expectedDuration: application.expectedDuration || '',
    companyLogo: application.companyLogo || '',
    status: application.status || 'Applied',
    color: application.color || '#3b82f6'
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateApplication(application._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application updated successfully!');
    },
    onError: () => toast.error('Failed to save changes.')
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleSummarize = async () => {
    if (!application.jdLink && !formData.notes) {
      toast.error('Please provide a JD link or notes for the AI to summarize.');
      return;
    }
    
    setIsSummarizing(true);
    try {
      const jdText = formData.notes || application.jdLink;
      const { summary } = await generateStrategicSummary(jdText);
      setFormData(prev => ({ ...prev, strategicNotes: summary }));
      toast.success('Strategic summary generated!');
    } catch (err) {
      toast.error('Failed to generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateBullets = async () => {
    setBullets([]);
    setIsGenerating(true);
    
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).accessToken : '';
      
      const params = new URLSearchParams({
        jdText: application.jdLink || application.role,
        userExperience: experienceInput
      });
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const url = `${baseUrl}/applications/stream-resume?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to start stream');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            try {
              const { bullet, error } = JSON.parse(dataStr);
              if (error) throw new Error(error);
              if (bullet) {
                setBullets(prev => prev.includes(bullet) ? prev : [...prev, bullet]);
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      toast.error('Failed to generate bullets.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePasteLogo = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setFormData(prev => ({ ...prev, companyLogo: event.target?.result as string }));
            toast.success('Logo pasted from clipboard!');
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, companyLogo: event.target?.result as string }));
        toast.success('Logo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const dark = isDark;
  const inputBase = `w-full text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border transition-all ${dark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'}`;
  const labelBase = `block text-[10px] font-black uppercase tracking-widest mb-1.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md sm:p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className={`shadow-2xl w-full max-w-4xl h-full sm:h-auto sm:max-h-[95vh] flex flex-col relative overflow-hidden cursor-default border group/modal rounded-none sm:rounded-3xl ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        onClick={e => e.stopPropagation()}
        onPaste={handlePasteLogo}
      >
        {/* Header Section */}
        <div className={`p-4 sm:px-8 sm:py-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${dark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
          <div className="flex items-center gap-5">
            <div className="relative group/logo">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border-2 ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                {formData.companyLogo ? (
                  <img src={formData.companyLogo} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <Building2 className={`w-8 h-8 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                )}
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover/logo:opacity-100 transition-opacity rounded-2xl">
                   <Upload className="w-5 h-5 text-white" />
                   <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <input 
                   value={formData.role} 
                   onChange={e => setFormData(p => ({...p, role: e.target.value}))}
                   className={`text-2xl font-black tracking-tight bg-transparent border-none p-0 focus:ring-0 ${dark ? 'text-white' : 'text-slate-900'}`}
                 />
              </div>
              <div className="flex items-center gap-2">
                <input 
                   value={formData.company} 
                   onChange={e => setFormData(p => ({...p, company: e.target.value}))}
                   className={`text-sm font-bold bg-transparent border-none p-0 focus:ring-0 ${dark ? 'text-blue-500' : 'text-blue-600'}`}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
             <button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
             >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
             </button>
             <button onClick={onClose} className={`p-2 rounded-xl transition-all hover:rotate-90 ${dark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
               <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`px-8 flex border-b ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
          {[
            { id: 'details', label: 'Detailed Info', icon: Building2 },
            { id: 'ai', label: 'AI Strategy & Bullets', icon: Sparkles }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-500' 
                  : `border-transparent ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'}`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'details' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                  <div>
                     <label className={labelBase}><MapPin className="inline w-3 h-3 mr-1" /> Location</label>
                     <input 
                        value={formData.location} 
                        onChange={e => setFormData(p => ({...p, location: e.target.value}))}
                        className={inputBase} 
                        placeholder="e.g. San Francisco (Hybrid)" 
                     />
                  </div>
                  <div>
                     <label className={labelBase}><Code2 className="inline w-3 h-3 mr-1" /> Tech Stack</label>
                     <input 
                        value={formData.techStack} 
                        onChange={e => setFormData(p => ({...p, techStack: e.target.value}))}
                        className={inputBase} 
                        placeholder="React, TypeScript, Node.js" 
                     />
                     {formData.techStack && (
                       <div className="flex flex-wrap gap-1 mt-2">
                         {formData.techStack.split(',').map((tech: string, i: number) => tech.trim() && (
                           <span key={i} className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${dark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                             {tech.trim()}
                           </span>
                         ))}
                       </div>
                     )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}><Calendar className="inline w-3 h-3 mr-1" /> Apply Date</label>
                      <input type="date" value={formData.startDate} onChange={e => setFormData(p => ({...p, startDate: e.target.value}))} className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}><Calendar className="inline w-3 h-3 mr-1" /> Deadline</label>
                      <input type="date" value={formData.deadline} onChange={e => setFormData(p => ({...p, deadline: e.target.value}))} className={inputBase} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}><Palette className="inline w-3 h-3 mr-1" /> Card Color</label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                      {[
                        { name: 'Indigo', value: '#6366f1' },
                        { name: 'Rose', value: '#f43f5e' },
                        { name: 'Amber', value: '#f59e0b' },
                        { name: 'Emerald', value: '#10b981' },
                        { name: 'Sky', value: '#0ea5e9' },
                        { name: 'Violet', value: '#8b5cf6' },
                        { name: 'Pink', value: '#ec4899' },
                        { name: 'Slate', value: '#64748b' },
                      ].map((col) => (
                        <button
                          key={col.value}
                          title={col.name}
                          type="button"
                          onClick={() => setFormData(p => ({...p, color: col.value}))}
                          className={`w-full aspect-square rounded-lg transition-transform hover:scale-110 active:scale-95 border-2 ${formData.color === col.value ? (dark ? 'border-white' : 'border-slate-900') : 'border-transparent'}`}
                          style={{ backgroundColor: col.value }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                     <label className={labelBase}><Globe className="inline w-3 h-3 mr-1" /> Stipend / Salary</label>
                     <input 
                        value={formData.salaryRange} 
                        onChange={e => setFormData(p => ({...p, salaryRange: e.target.value}))}
                        className={inputBase} 
                        placeholder="e.g. $10k/mo" 
                     />
                  </div>
                </div>

                <div>
                   <label className={labelBase}>Logo URL (Alternative to Paste)</label>
                   <div className="relative">
                      <Link2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        value={formData.companyLogo}
                        onChange={e => setFormData(p => ({...p, companyLogo: e.target.value}))}
                        className={`${inputBase} pl-10`}
                        placeholder="https://..."
                      />
                   </div>
                </div>
              </div>

              {/* Right Column: Descriptions */}
              <div className="space-y-6">
                <div className="flex flex-col h-full">
                  <label className={labelBase}>Application Narrative & JD Highlights</label>
                  <textarea 
                    value={formData.notes}
                    onChange={e => setFormData(p => ({...p, notes: e.target.value}))}
                    className={`${inputBase} flex-1 min-h-[300px] leading-relaxed py-4`}
                    placeholder="Paste job description or your personal thoughts here..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Strategic Notes Section */}
              <div className={`p-8 rounded-[32px] border relative overflow-hidden ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-blue-50/30 border-blue-100'}`}>
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Ghost className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h4 className={`font-black text-lg ${dark ? 'text-white' : 'text-slate-900'}`}>Strategic Insights</h4>
                        <p className={`text-xs font-bold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>AI analysis of company culture and interview prep.</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleSummarize}
                      disabled={isSummarizing}
                      className="group flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl border border-blue-200 dark:border-slate-700 hover:border-blue-500 transition-all shadow-sm"
                    >
                      {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-blue-500" />}
                      Generate Strategic Notes
                    </button>
                 </div>
                 <textarea 
                   value={formData.strategicNotes}
                   onChange={e => setFormData(p => ({...p, strategicNotes: e.target.value}))}
                   className={`w-full bg-transparent border-none p-0 focus:ring-0 text-sm leading-relaxed min-h-[120px] ${dark ? 'text-slate-300' : 'text-slate-600'}`}
                   placeholder="Click generate to get an AI summary of this role..."
                 />
              </div>

              {/* Resume Copilot */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className={`font-black text-lg ${dark ? 'text-white' : 'text-slate-900'}`}>AI Resume Co-pilot</h4>
                      <p className={`text-xs font-bold opacity-60 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Tailored bullet points for this specific role.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                  <label className={labelBase}>Your Relevant Experience (For the AI)</label>
                  <textarea 
                      value={experienceInput}
                      onChange={e => setExperienceInput(e.target.value)}
                      className={inputBase}
                      rows={3}
                  />
                  <button 
                    onClick={handleGenerateBullets}
                    disabled={isGenerating}
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                    Compose AI Bullet Points
                  </button>
                </div>

                {bullets.length > 0 && (
                  <div className="grid gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    {bullets.map((bullet, index) => (
                      <div key={index} className={`flex gap-4 group border p-6 rounded-[28px] transition-all hover:scale-[1.01] ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <p className={`text-sm leading-relaxed flex-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{bullet}</p>
                        <button 
                          onClick={() => handleCopy(bullet, index)}
                          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all ${copiedIndex === index ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 opacity-0 group-hover/modal:opacity-100'}`}
                        >
                          {copiedIndex === index ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

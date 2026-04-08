import { useState } from 'react';
import { X, Building2, Calendar, Check, Copy, Wand2, Loader2, Sparkles } from 'lucide-react';
import { api } from '../api';
import { useDarkMode } from '../hooks/useDarkMode';

interface DetailViewModalProps {
  application: any;
  onClose: () => void;
}

export default function DetailViewModal({ application, onClose }: DetailViewModalProps) {
  const { isDark } = useDarkMode();
  const [bullets, setBullets] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [experienceInput, setExperienceInput] = useState("Experienced software engineer with full-stack capabilities.");

  const handleGenerateBullets = async () => {
    setIsGenerating(true);
    try {
      const { data } = await api.post('/applications/generate-resume', {
        jdText: application.jdLink || application.role,
        userExperience: experienceInput
      });
      setBullets(data.bullets);
    } catch (err) {
      console.error(err);
      alert('Failed to generate bullets. Please ensure API is stable.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();

  const dark = isDark;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className={`rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative overflow-hidden cursor-default border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        onClick={handleModalClick}
      >
        
        {/* Header */}
        <div className={`px-8 py-7 border-b flex justify-between items-start ${dark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <div className="space-y-1">
            <h2 className={`text-3xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{application.role}</h2>
            <div className={`flex flex-wrap items-center gap-3 mt-4 text-xs font-bold uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}><Building2 className="w-4 h-4" /> {application.company}</span>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}><Calendar className="w-4 h-4" /> {new Date(application.dateApplied).toLocaleDateString()}</span>
              {application.salaryRange && <span className="bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg font-black">{application.salaryRange}</span>}
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-all hover:rotate-90 ${dark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className={`p-8 overflow-y-auto flex-1 ${dark ? 'bg-slate-950' : 'bg-white'}`}>
          <div className="mb-10">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Application Notes</h3>
            <div className={`p-6 rounded-[24px] border leading-relaxed text-sm ${dark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
              {application.notes || "No additional notes provided for this application."}
            </div>
          </div>

          <div className={`pt-10 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex flex-col gap-6 mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>OpenAI Resume Co-pilot</h3>
                    <p className={`text-xs font-medium ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Deep contextual generation tailored to your persona.</p>
                  </div>
               </div>
               
               <div>
                 <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Steering Prompt</label>
                 <textarea 
                    value={experienceInput}
                    onChange={e => setExperienceInput(e.target.value)}
                    className={`w-full text-sm rounded-2xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand-primary border transition-all ${dark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                    placeholder="Briefly describe your relevant experience to help the AI craft better bullets..."
                 />
               </div>
               
               <button 
                  onClick={handleGenerateBullets}
                  disabled={isGenerating || !experienceInput}
                  className="w-full flex items-center justify-center gap-2 font-black bg-brand-primary hover:bg-brand-indigo text-white px-6 py-4 rounded-2xl transition-all shadow-xl shadow-brand-primary/20 disabled:opacity-50 active:scale-[0.98]"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  Generate Tailored Bullets
                </button>
            </div>

            {bullets.length > 0 && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <h3 className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Generated Insights</h3>
                {bullets.map((bullet, index) => (
                  <div key={index} className={`flex gap-4 group border p-6 rounded-[24px] transition-all hover:scale-[1.01] ${dark ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
                    <p className={`text-sm leading-relaxed flex-1 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{bullet}</p>
                    <button 
                      onClick={() => handleCopy(bullet, index)}
                      className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all ${copiedIndex === index ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-brand-primary hover:text-white opacity-0 group-hover:opacity-100'}`}
                    >
                      {copiedIndex === index ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

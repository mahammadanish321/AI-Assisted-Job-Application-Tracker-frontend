import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApplication, parseJobDescription, getProfile } from '../api';
import { Loader2, Plus, Sparkles, X, Palette, Wand2, CheckCircle2, ChevronRight, Briefcase, Building } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import toast from 'react-hot-toast';

export default function AddApplicationModal() {
  const { isDark } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const [jdText, setJdText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('');
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({ 
    queryKey: ['profile'], 
    queryFn: getProfile 
  });

  const { register, handleSubmit, setValue, reset, watch } = useForm();
  const selectedColor = watch('color', '#6366f1');

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application tracked successfully!');
      handleClose();
    },
    onError: () => {
      toast.error('Failed to save application.');
    }
  });

  const handleParse = async () => {
    if (!jdText) return;
    setIsParsing(true);
    try {
      const data = await parseJobDescription(jdText);
      setValue('company', data.company || '');
      setValue('role', data.role || '');
      if (data.location) setValue('location', data.location);
      if (data.salaryRange) setValue('salaryRange', data.salaryRange);
      setActiveProvider(data.provider || 'AI');
      setParsed(true);
      toast.success(`${data.provider || 'AI'} extraction complete!`);
    } catch (err) {
      console.error(err);
      toast.error('AI failed to parse job description.');
    } finally {
      setIsParsing(false);
    }
  };

  const onSubmit = (data: any) => {
    const applicationData = {
      ...data,
      jdLink: jdText,
      status: data.status || (profile?.boardColumns?.[0]?.name || 'Applied'),
    };
    createMutation.mutate(applicationData);
  };

  const handleClose = () => {
    setIsOpen(false);
    setJdText('');
    setParsed(false);
    reset();
  };

  const dark = isDark;
  const isPending = createMutation.status === 'pending';
  const inputStyle = `w-full p-3.5 border rounded-2xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all text-sm font-medium ${dark ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`;
  const labelStyle = `block text-[10px] font-black uppercase tracking-widest mb-2 ${dark ? 'text-slate-600' : 'text-slate-400'}`;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-indigo text-white font-black py-3 px-6 rounded-2xl shadow-xl shadow-brand-primary/20 transition-all active:scale-95 text-sm"
      >
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
        New Application
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={handleClose}>
          <div 
            className={`rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden border ${dark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-8 py-6 border-b flex justify-between items-center ${dark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h2 className={`text-xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
                    Add Application
                  </h2>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Powered by {activeProvider || 'AI Provider'}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className={`p-2 rounded-xl transition-all hover:rotate-90 ${dark ? 'bg-slate-800 text-slate-500 hover:text-white' : 'bg-slate-200 text-slate-400 hover:text-slate-600'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {!parsed ? (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <div>
                    <label className={labelStyle}>Job Description Content</label>
                    <textarea 
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      className={`${inputStyle} h-80 resize-none leading-relaxed overflow-y-auto`}
                      placeholder={`Paste the job description here. ${activeProvider || 'AI'} will perform a deep extraction of the company, role, and requirements for you.`}
                    />
                  </div>
                  <button 
                    onClick={handleParse}
                    disabled={isParsing || !jdText}
                    className="w-full group relative overflow-hidden bg-brand-primary hover:bg-brand-indigo disabled:bg-slate-800 disabled:text-slate-600 text-white font-black py-5 rounded-2xl transition-all flex justify-center items-center gap-3 shadow-2xl shadow-brand-primary/30"
                  >
                    {isParsing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                    {isParsing ? `Analyzing with ${activeProvider || 'AI'}...` : 'Magic Extract'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in slide-in-from-right-4 duration-400">
                  <div className="flex items-center gap-2 mb-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4" />
                    Extraction Successful
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <label className={labelStyle}>Company</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                        <input {...register('company', { required: true })} className={`${inputStyle} pl-12`} placeholder="Company Name" />
                      </div>
                    </div>
                    <div className="group">
                      <label className={labelStyle}>Job Role</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                        <input {...register('role', { required: true })} className={`${inputStyle} pl-12`} placeholder="e.g. Frontend Engineer" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelStyle}>Placement stage</label>
                      <select {...register('status')} className={inputStyle}>
                        {profile?.boardColumns?.map((col: any) => (
                          <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`${labelStyle} flex items-center justify-between`}>
                        Accent Color
                        <div className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-transparent" style={{ backgroundColor: selectedColor, borderColor: 'white' }} />
                      </label>
                      <div className={`flex items-center gap-3 border rounded-2xl px-4 py-3 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                         <Palette className="w-4 h-4 text-slate-500" />
                         <input type="color" {...register('color')} defaultValue="#6366f1" className="w-full h-8 border-none bg-transparent cursor-pointer rounded-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelStyle}>Salary Expectations</label>
                      <input {...register('salaryRange')} className={inputStyle} placeholder="e.g. $120k - $150k" />
                    </div>
                    <div>
                      <label className={labelStyle}>Location</label>
                      <input {...register('location')} className={inputStyle} placeholder="e.g. Remote, NY" />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Strategic Notes</label>
                    <textarea {...register('notes')} className={`${inputStyle} h-28 resize-none leading-relaxed pt-4`} placeholder="Any specific context or research about this company..." />
                  </div>
                  
                  <div className="pt-6 flex gap-4 border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={() => setParsed(false)} className={`px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${dark ? 'bg-slate-900 text-slate-500 hover:text-slate-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={isPending}
                      className="flex-1 bg-brand-primary hover:bg-brand-indigo disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-2xl shadow-brand-primary/20 flex justify-center items-center gap-3"
                    >
                      {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                      Finalize & Track <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

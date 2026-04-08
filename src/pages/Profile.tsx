import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getProfile, updateProfile, addResume, deleteResume } from '../api';
import { User, Globe, Trash2, FileText, Loader2, Save, Upload, LogOut, ExternalLink, Share2, Camera, X } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RESUME_TYPES = ['General', 'Software Engineer', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Data Science', 'Product', 'Design', 'Other'];

export default function Profile() {
  const { isDark } = useDarkMode();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [addingResume, setAddingResume] = useState(false);
  const [resumeForm, setResumeForm] = useState({ name: '', content: '', contentType: '', type: 'General' });
  const [showResumeForm, setShowResumeForm] = useState(false);

  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const [form, setForm] = useState<any>(null);

  if (profile && !form) {
    setForm({
      name: profile.name || '',
      bio: profile.bio || '',
      jobTitle: profile.jobTitle || '',
      avatar: profile.avatar || '',
      socialLinks: {
        linkedin: profile.socialLinks?.linkedin || '',
        github: profile.socialLinks?.github || '',
        twitter: profile.socialLinks?.twitter || '',
        portfolio: profile.socialLinks?.portfolio || '',
      }
    });
  }

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['profile'] }); 
      setSaving(false);
      toast.success('Profile updated successfully!');
    },
    onError: () => {
      setSaving(false);
      toast.error('Failed to update profile.');
    },
  });

  const addResumeMutation = useMutation({
    mutationFn: addResume,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['profile'] }); 
      setShowResumeForm(false); 
      setResumeForm({ name: '', content: '', contentType: '', type: 'General' }); 
      setAddingResume(false); 
      toast.success('Resume added successfully!');
    },
    onError: (err: any) => {
      setAddingResume(false);
      const msg = err.response?.data?.message || 'Failed to save resume. File might be too large.';
      toast.error(msg);
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Resume deleted.');
    },
  });

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch(err) { console.error(err); }
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const onResumeDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    // Check size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File is too large. Max 5MB.');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setResumeForm({ 
        name: file.name, 
        content: base64, 
        contentType: file.type,
        type: 'General' 
      });
      setShowResumeForm(true);
    };
    reader.readAsDataURL(file);
  }, []);


  const { getRootProps: getResumeRootProps, getInputProps: getResumeInputProps, isDragActive: isResumeDragActive } = useDropzone({
    onDrop: onResumeDrop,
    accept: { 'application/pdf': [], 'application/msword': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] },
    multiple: false
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Avatar must be less than 2MB.');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((f: any) => ({ ...f, avatar: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setForm((f: any) => ({ ...f, avatar: '' }));
  };

  const handleSave = () => {
    setSaving(true);
    updateMutation.mutate(form);
  };

  const handleAddResume = () => {
    if (!resumeForm.name || !resumeForm.content) return;
    setAddingResume(true);
    addResumeMutation.mutate(resumeForm);
  };

  const dark = isDark;
  const cardStyle = `rounded-[32px] border transition-all ${dark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`;
  const inputStyle = `w-full p-4 border rounded-2xl focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all ${dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 font-medium' : 'bg-slate-50 border-slate-200 text-slate-800 font-medium'}`;
  const labelStyle = `block text-xs font-black uppercase tracking-widest mb-3 ${dark ? 'text-slate-600' : 'text-slate-400'}`;

  if (isLoading || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" /> 
        <p className={`text-xs font-black tracking-widest uppercase ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Syncing Profile...</p>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto px-6 pb-32 pt-8 space-y-10 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Profile Settings</h1>
          <p className={`text-sm mt-2 font-bold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Refine your professional persona and assets.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${dark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-3 bg-brand-primary hover:bg-brand-indigo text-white font-black px-8 py-4 rounded-2xl transition-all shadow-2xl shadow-brand-primary/30 disabled:opacity-50 active:scale-95 text-sm uppercase tracking-widest">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-10">
          <section className={`${cardStyle} p-10`}>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-primary" />
              </div>
              <h2 className="font-black text-2xl tracking-tight">Professional Identity</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-10">
               {/* Avatar System */}
               <div className="flex flex-col items-center gap-6">
                  <div className="relative group">
                    <div className={`w-40 h-40 rounded-full border-4 overflow-hidden shadow-2xl transition-all group-hover:scale-105 ${dark ? 'border-slate-800 bg-slate-800' : 'border-white bg-slate-100'}`}>
                      {form.avatar ? (
                        <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className={`w-16 h-16 ${dark ? 'text-slate-700' : 'text-slate-300'}`} />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 w-10 h-10 bg-brand-primary hover:bg-brand-indigo text-white rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-90 ring-4 ring-offset-0 dark:ring-slate-900 ring-white"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                    />
                  </div>
                  {form.avatar && (
                    <button 
                      onClick={removeAvatar}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" /> Remove Photo
                    </button>
                  )}
               </div>

               <div className="flex-1 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className={labelStyle}>Full Name</label>
                      <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                        className={inputStyle}
                        placeholder="e.g. Alex Rivera" />
                    </div>
                    <div>
                      <label className={labelStyle}>Job Title</label>
                      <input value={form.jobTitle} onChange={e => setForm((f: any) => ({ ...f, jobTitle: e.target.value }))}
                        className={inputStyle}
                        placeholder="e.g. Senior Software Engineer" />
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelStyle}>Short Bio</label>
                    <textarea value={form.bio} onChange={e => setForm((f: any) => ({ ...f, bio: e.target.value }))}
                      className={`${inputStyle} h-32 resize-none leading-relaxed`}
                      placeholder="Share your technical expertise and career goals..." />
                  </div>
               </div>
            </div>
          </section>

          {/* Social Links */}
          <section className={`${cardStyle} p-10`}>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="font-black text-2xl tracking-tight">Social Presence</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: Globe, key: 'linkedin', label: 'LinkedIn' },
                { icon: Globe, key: 'github', label: 'GitHub' },
                { icon: Share2, key: 'twitter', label: 'Twitter' },
                { icon: Globe, key: 'portfolio', label: 'Portfolio' },
              ].map(({ icon: Icon, key, label }) => (
                <div key={key}>
                  <label className={labelStyle}>{label}</label>
                  <div className="group relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <input value={form.socialLinks[key]} onChange={e => setForm((f: any) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: e.target.value } }))}
                      className={`${inputStyle} pl-14 text-sm`}
                      placeholder={`https://...`} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Resumes */}
        <div className="space-y-10">
          <section className={`${cardStyle} p-10`}>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-rose-500" />
                </div>
                <h2 className="font-black text-2xl tracking-tight">Assets</h2>
              </div>
              <div className={`text-[10px] font-black px-3 py-1.5 rounded-full ${dark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                {profile?.resumes?.length || 0}/10
              </div>
            </div>

            {/* Dropzone */}
            {(profile?.resumes?.length || 0) < 10 && !showResumeForm && (
              <div 
                {...getResumeRootProps()} 
                className={`border-2 border-dashed rounded-[32px] p-10 text-center transition-all cursor-pointer mb-10 group ${
                  isResumeDragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-brand-primary/50'
                }`}
              >
                <input {...getResumeInputProps()} />
                <div className={`w-16 h-16 rounded-3xl mx-auto mb-6 flex items-center justify-center transition-all group-hover:scale-110 ${dark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <Upload className={`w-8 h-8 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
                <p className="text-base font-black tracking-tight mb-1">Drop Resume</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">PDF, DOCX Max 5MB</p>
              </div>
            )}

            {/* Resume Upload Form */}
            {showResumeForm && (
              <div className={`mb-10 p-8 rounded-[32px] border animate-in zoom-in-95 duration-200 ${dark ? 'bg-brand-primary/5 border-brand-primary/20 shadow-2xl shadow-brand-primary/5' : 'bg-blue-50/50 border-blue-100 shadow-xl shadow-blue-500/5'}`}>
                <div className="space-y-6">
                  <div>
                    <label className={labelStyle}>Document Label</label>
                    <input value={resumeForm.name} onChange={e => setResumeForm(f => ({ ...f, name: e.target.value }))}
                      className={inputStyle} placeholder="e.g. Tech Resume 2024" />
                  </div>
                  <div>
                    <label className={labelStyle}>Target Focus</label>
                    <select value={resumeForm.type} onChange={e => setResumeForm(f => ({ ...f, type: e.target.value }))}
                      className={inputStyle}>
                      {RESUME_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={handleAddResume} disabled={addingResume || !resumeForm.name}
                      className="flex-1 bg-brand-primary hover:bg-brand-indigo text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20">
                      Track
                    </button>
                    <button onClick={() => setShowResumeForm(false)} className={`flex-1 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all ${dark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                      Void
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resumes List */}
            <div className="space-y-6">
              {profile.resumes.map((r: any) => (
                <div key={r._id} className={`p-6 rounded-[32px] border transition-all hover:translate-x-2 ${dark ? 'bg-slate-800/40 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate uppercase tracking-tighter">{r.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{r.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => {
                        const win = window.open();
                        if (win) {
                          win.document.write(`<iframe src="${r.content}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                        }
                      }} 
                      className={`flex-1 flex items-center justify-center gap-2 font-black text-[10px] uppercase py-3 rounded-xl transition-all ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-sm'}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </button>
                    <button onClick={() => deleteResumeMutation.mutate(r._id)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 transition-all ${dark ? 'bg-slate-700/50 hover:bg-red-500/10' : 'bg-white border border-slate-200 hover:bg-red-50 shadow-sm'}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

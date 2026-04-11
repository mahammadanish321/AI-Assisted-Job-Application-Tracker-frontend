import { Draggable } from '@hello-pangea/dnd';
import { Building2, Calendar, Trash2, AlertCircle } from 'lucide-react';
import DetailViewModal from './DetailViewModal';
import { useState, useMemo } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { differenceInDays } from 'date-fns';

interface CardProps {
  application: any;
  index: number;
  onDelete: () => void;
}

export default function Card({ application, index, onDelete }: CardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { isDark } = useDarkMode();
  const dark = isDark;

  const isOverdue = useMemo(() => {
    if (application.status !== 'Applied') return false;
    const days = differenceInDays(new Date(), new Date(application.dateApplied));
    return days > 7;
  }, [application]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConfirming) {
      setIsConfirming(true);
      setTimeout(() => setIsConfirming(false), 3000);
    } else {
      onDelete();
      setIsConfirming(false);
    }
  };

  return (
    <>
      <Draggable draggableId={application._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setIsDetailOpen(true)}
            className={`rounded-2xl p-4 shadow-sm border transition-all cursor-pointer relative overflow-hidden group ${
              dark ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:shadow-md hover:border-blue-300'
            } ${
              snapshot.isDragging ? 'shadow-2xl ring-2 ring-brand-primary/50 rotate-2 z-50' : ''
            } ${isOverdue ? 'ring-1 ring-rose-500/30 bg-rose-500/[0.02]' : ''}`}
            onMouseLeave={() => setIsConfirming(false)}
          >
            {/* Left color bar */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5" 
              style={{ backgroundColor: application.color || '#cbd5e1' }}
            />

            {/* Top Badge (Overdue or Logo) */}
            <div className="absolute top-0 right-0 p-3 flex items-start justify-end gap-2">
              {application.companyLogo ? (
                <div className={`w-10 h-10 rounded-xl overflow-hidden shadow-sm border ${dark ? 'bg-white/10 border-slate-700' : 'bg-white border-slate-100'} p-1 flex items-center justify-center`}>
                  <img src={application.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : isOverdue && (
                <div className="py-1 px-3 bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl rounded-tr-xl flex items-center gap-1 animate-pulse shadow-lg shadow-rose-500/20">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Follow-up
                </div>
              )}
            </div>
            
            <div className="mb-3 pl-2 pr-10">
              <div className="flex items-start gap-2">
                <div 
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0" 
                  style={{ backgroundColor: application.color || '#cbd5e1' }} 
                />
                <h4 className={`font-black text-base mb-1 leading-tight tracking-tight line-clamp-2 ${dark ? 'text-white' : 'text-slate-900'}`}>{application.role}</h4>
              </div>
              <div className={`flex items-center text-xs gap-1.5 mt-2 font-bold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{application.company}</span>
              </div>
            </div>

            {/* Micro badges for Tech Stack / Location */}
            {(application.techStack || application.location) && (
              <div className="flex flex-wrap gap-1.5 mb-4 pl-2">
                {application.location && (
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${dark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    {application.location}
                  </span>
                )}
                {application.techStack && (
                  <div className="flex flex-wrap gap-1">
                    {application.techStack.split(',').slice(0, 2).map((tech: string, i: number) => (
                      <span key={i} className={`text-[8px] font-black px-2 py-0.5 rounded-md border border-blue-500/10 ${dark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        {tech.trim()}
                      </span>
                    ))}
                    {application.techStack.split(',').length > 2 && (
                       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${dark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                         +{application.techStack.split(',').length - 2}
                       </span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className={`flex items-center justify-between text-[10px] font-black uppercase tracking-widest mt-4 pt-4 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                isOverdue 
                  ? 'bg-rose-500/10 text-rose-500' 
                  : (dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500')
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{application.deadline ? `Due ${new Date(application.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : new Date(application.dateApplied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
              
              <button 
                onClick={handleDelete}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all h-8 ${
                  isConfirming 
                    ? 'bg-rose-500 text-white opacity-100' 
                    : `opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-rose-500`
                }`}
                title={isConfirming ? "Confirm Delete" : "Delete application"}
              >
                {isConfirming ? (
                   <span className="text-[9px] font-black tracking-tighter">Sure?</span>
                ) : (
                   <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </Draggable>
      
      {isDetailOpen && (
        <DetailViewModal application={application} onClose={() => setIsDetailOpen(false)} />
      )}
    </>
  );
}

import { Draggable } from '@hello-pangea/dnd';
import { Building2, Calendar } from 'lucide-react';
import DetailViewModal from './DetailViewModal';
import { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

interface CardProps {
  application: any;
  index: number;
}

export default function Card({ application, index }: CardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { isDark } = useDarkMode();
  const dark = isDark;

  return (
    <>
      <Draggable draggableId={application._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setIsDetailOpen(true)}
            className={`rounded-2xl p-5 shadow-sm border transition-all cursor-pointer relative overflow-hidden ${
              dark ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:shadow-md hover:border-blue-300'
            } ${
              snapshot.isDragging ? 'shadow-2xl ring-2 ring-brand-primary/50 rotate-2 z-50' : ''
            }`}
          >
            {/* Left color bar */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5" 
              style={{ backgroundColor: application.color || '#cbd5e1' }}
            />
            
            <div className="mb-3 pl-2">
              <div className="flex items-start gap-2">
                <div 
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0" 
                  style={{ backgroundColor: application.color || '#cbd5e1' }} 
                />
                <h4 className={`font-black text-base mb-1 leading-tight tracking-tight line-clamp-2 ${dark ? 'text-white' : 'text-slate-900'}`}>{application.role}</h4>
              </div>
              <div className={`flex items-center text-xs gap-1.5 mt-2 font-bold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">{application.company}</span>
              </div>
            </div>
            
            <div className={`flex items-center justify-between text-[10px] font-black uppercase tracking-widest mt-4 pt-4 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                <Calendar className="w-3 h-3" />
                <span>{new Date(application.dateApplied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
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

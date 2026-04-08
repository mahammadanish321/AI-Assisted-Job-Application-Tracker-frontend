import { useState, useRef, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import { Plus, MoreHorizontal, Trash2, Palette, Edit3, CircleDashed } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

interface ColumnProps {
  id: string;
  title: string;
  applications: any[];
  color?: string;
  index: number;
  onAddBefore: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<{ name: string; color: string }>) => void;
}

export default function Column({ id, title, applications, color, index, onAddBefore, onDelete, onUpdate }: ColumnProps) {
  const { isDark } = useDarkMode();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const menuRef = useRef<HTMLDivElement>(null);

  const PROFESSIONAL_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Slate', value: '#64748b' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateName = () => {
    if (editTitle.trim() && editTitle !== title) {
      onUpdate({ name: editTitle });
    }
    setIsEditing(false);
  };

  const dark = isDark;
  const accentColor = color || '#6366f1';

  return (
    <div className={`flex flex-col rounded-[32px] w-[340px] min-w-[340px] shrink-0 transition-all border group/col overflow-visible ${dark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
      
      {/* Header */}
      <div className="p-6 pb-2 relative">
        <div className="flex items-center justify-between mb-4">
          {/* LEFT: Plus Icon (Add Before) - Only show if not the first stage */}
          <div className="w-8 h-8 flex items-center justify-center">
            {index > 0 && (
              <button 
                onClick={onAddBefore}
                className={`p-1.5 rounded-lg opacity-0 group-hover/col:opacity-100 transition-all hover:bg-brand-primary/10 ${dark ? 'text-brand-primary' : 'text-brand-primary'}`}
                title="Add stage before"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-1 px-2 min-w-0 justify-center">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: accentColor, boxShadow: `0 0 15px ${accentColor}60` }} />
            
            {isEditing ? (
              <input 
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleUpdateName}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                className={`bg-transparent font-black text-base tracking-tight focus:outline-none w-full text-center ${dark ? 'text-white' : 'text-slate-900'}`}
              />
            ) : (
              <h3 className={`font-black text-sm tracking-widest truncate uppercase text-center ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            )}
          </div>
          
          {/* RIGHT: More Icon (Settings) */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1.5 rounded-lg opacity-0 group-hover/col:opacity-100 transition-all hover:bg-slate-200 dark:hover:bg-slate-800 ${showMenu ? 'opacity-100 bg-slate-200 dark:bg-slate-800' : ''} ${dark ? 'text-slate-200' : 'text-slate-900'}`}
            >
              <MoreHorizontal className="w-5 h-5 stroke-[3]" />
            </button>
            
            {showMenu && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <button 
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className={`w-full flex items-center gap-2 p-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${dark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Edit3 className="w-4 h-4" /> Rename
                </button>
                
                <div className={`px-3 py-2 mt-1 mb-1`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Change Color</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {PROFESSIONAL_COLORS.map((col) => (
                      <button
                        key={col.value}
                        title={col.name}
                        onClick={() => { onUpdate({ color: col.value }); setShowMenu(false); }}
                        className={`w-full aspect-square rounded-lg transition-transform hover:scale-110 active:scale-95 border-2 ${accentColor === col.value ? 'border-white ring-2 ring-brand-primary/20' : 'border-transparent'}`}
                        style={{ backgroundColor: col.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className={`my-1 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`} />
                <button 
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className={`w-full flex items-center gap-2 p-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${dark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <span className={`text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full ${dark ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
            {applications.length} Items
          </span>
        </div>
      </div>
      
      {/* Content Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`p-4 min-h-[500px] flex flex-col gap-5 transition-all duration-300 relative ${
              snapshot.isDraggingOver ? 'bg-brand-primary/5' : ''
            }`}
          >
            {applications.map((app, index) => (
              <Card key={app._id} application={app} index={index} />
            ))}
            {provided.placeholder}
            
            {applications.length === 0 && !snapshot.isDraggingOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none">
                <CircleDashed className={`w-12 h-12 ${dark ? 'text-white' : 'text-slate-900'}`} />
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, updateApplication, getProfile, updateProfile, deleteApplication } from '../api';
import Column from './Column';
import AddApplicationModal from './AddApplicationModal';
import { Loader2, Search, Download, BarChart3, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import toast from 'react-hot-toast';

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  const { isDark } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: applications = [], isLoading: isAppsLoading, isFetching: isAppsFetching } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
    staleTime: 1000 * 60,
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 1000 * 60 * 5,
  });

  const [localData, setLocalData] = useState<any[]>([]);
  const [columns, setColumns] = useState<{ name: string; color: string }[]>([]);

  useEffect(() => {
    if (!isAppsFetching || applications.length > 0) {
       setLocalData(applications);
    }
  }, [applications, isAppsFetching]);

  useEffect(() => {
    if (profile?.boardColumns) {
      setColumns(profile.boardColumns);
    }
  }, [profile]);
  
  // Statistics calculation
  const stats = useMemo(() => {
    const total = applications.length;
    const byStatus = applications.reduce((acc: any, app: any) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    return { total, byStatus };
  }, [applications]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return localData;
    const query = searchQuery.toLowerCase();
    return localData.filter(app => 
      app.company.toLowerCase().includes(query) || 
      app.role.toLowerCase().includes(query) ||
      (app.notes && app.notes.toLowerCase().includes(query))
    );
  }, [localData, searchQuery]);

  const updateAppMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateApplication(id, { status }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      const previousApps = queryClient.getQueryData(['applications']);
      return { previousApps };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['applications'], context.previousApps);
        setLocalData(context.previousApps as any[]);
      }
      toast.error('Sync failed. Reverting changes.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: deleteApplication,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      const previousApps = queryClient.getQueryData(['applications']);
      const newApps = (previousApps as any[]).filter(app => app._id !== id);
      queryClient.setQueryData(['applications'], newApps);
      setLocalData(newApps);
      return { previousApps };
    },
    onError: (_err, _id, context) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['applications'], context.previousApps);
        setLocalData(context.previousApps as any[]);
      }
      toast.error('Failed to delete application.');
    },
    onSuccess: () => {
      toast.success('Application removed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const saveProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast.error('Failed to sync board layout.');
    }
  });

  const syncBoard = useCallback((newCols: { name: string; color: string }[]) => {
    setColumns(newCols);
    saveProfileMutation.mutate({ boardColumns: newCols });
  }, [saveProfileMutation]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newLocalData = Array.from(localData);
    const itemIndex = newLocalData.findIndex(app => app._id === draggableId);
    if (itemIndex === -1) return;
    
    const movedItem = { ...newLocalData[itemIndex], status: destination.droppableId };
    newLocalData.splice(itemIndex, 1);
    
    const destApps = newLocalData.filter(app => app.status === destination.droppableId);
    
    if (destApps.length === 0 || destination.index >= destApps.length) {
      newLocalData.push(movedItem);
    } else {
      const itemAtTarget = destApps[destination.index];
      const targetIndex = newLocalData.findIndex(app => app._id === itemAtTarget._id);
      newLocalData.splice(targetIndex, 0, movedItem);
    }
    
    setLocalData(newLocalData);
    queryClient.setQueryData(['applications'], newLocalData);

    const newStatus = destination.droppableId;
    updateAppMutation.mutate({ id: draggableId, status: newStatus });
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return toast.error('No applications to export');
    const headers = ['Company', 'Role', 'Status', 'Date Applied', 'Salary', 'Notes'];
    const rows = applications.map((app: any) => [
      `"${app.company}"`,
      `"${app.role}"`,
      `"${app.status}"`,
      new Date(app.dateApplied).toLocaleDateString(),
      `"${app.salaryRange || ''}"`,
      `"${(app.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map((e: any[]) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Applications exported to CSV');
  };

  const handleAddBefore = (index: number) => {
    const newCols = [...columns];
    newCols.splice(index, 0, { name: `Stage ${columns.length + 1}`, color: '#6366f1' });
    syncBoard(newCols);
    toast.success('Stage added');
  };

  const handleDeleteColumn = async (index: number) => {
    if (columns.length <= 1) return toast.error('Board must have at least one stage');
    const stageToDelete = columns[index].name;
    const firstStage = columns[index === 0 ? 1 : 0].name;
    const appsToMove = localData.filter(app => app.status === stageToDelete);
    try {
      if (appsToMove.length > 0) {
        toast.loading(`Moving items to ${firstStage}...`, { id: 'reassigning' });
        for (const app of appsToMove) await updateApplication(app._id, { status: firstStage });
        toast.dismiss('reassigning');
      }
      const newCols = columns.filter((_, i) => i !== index);
      syncBoard(newCols);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Stage removed');
    } catch (err) {
      toast.error('Failed to reassign items');
      toast.dismiss('reassigning');
    }
  };

  const handleUpdateColumn = (index: number, updates: Partial<{ name: string; color: string }>) => {
    const newCols = [...columns];
    const oldName = newCols[index].name;
    newCols[index] = { ...newCols[index], ...updates };
    if (updates.name && updates.name !== oldName) {
      const appsToUpdate = localData.filter(app => app.status === oldName);
      appsToUpdate.forEach(app => updateAppMutation.mutate({ id: app._id, status: updates.name! }));
      setLocalData(prev => prev.map(app => app.status === oldName ? { ...app, status: updates.name } : app));
    }
    syncBoard(newCols);
  };

  const columnsWithData = useMemo(() => {
    return columns.map(col => ({
      ...col,
      apps: filteredData.filter(app => app.status === col.name)
    }));
  }, [columns, filteredData]);

  // Ref and state for scroll
  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);

  const scrollBoard = (direction: 'left' | 'right') => {
    if (scrollNode) {
      const scrollAmount = 400;
      scrollNode.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if ((isAppsLoading && applications.length === 0) || (isProfileLoading && !profile)) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  const dark = isDark;

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
        <div>
          <h2 className={`text-4xl font-black tracking-tighter flex items-center gap-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
            Status Board
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Refining your application lifecycle through customization.</p>
        </div>
        
        {/* Stats Section */}
        <div className={`flex flex-wrap items-center gap-4 p-4 rounded-2xl border shadow-sm transition-all ${
          dark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
        }`}>
           <div className={`flex items-center gap-2 px-3 border-r last:border-0 ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
             <BarChart3 className="w-4 h-4 text-brand-primary" />
             <span className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Insights</span>
           </div>
           <div className="flex flex-wrap gap-5">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total</span>
               <span className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{stats.total}</span>
             </div>
             {columns.slice(0, 3).map(col => (
               <div key={col.name} className="flex flex-col">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate max-w-[60px]">{col.name}</span>
                 <span className="text-sm font-black" style={{ color: col.color }}>{stats.byStatus[col.name] || 0}</span>
               </div>
             ))}
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-64 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 ${
                dark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <FilterX className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button 
            onClick={handleExportCSV}
            className={`group flex items-center gap-2 font-bold py-3 px-6 rounded-2xl border shadow-sm transition-all active:scale-95 text-sm ${
              dark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            Export
          </button>
          
          <AddApplicationModal />

          <div className="flex items-center gap-1 border-l pl-3 ml-1 border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => scrollBoard('left')}
              className={`p-2.5 rounded-xl border shadow-sm transition-all active:scale-90 ${
                dark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
              }`}
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollBoard('right')}
              className={`p-2.5 rounded-xl border shadow-sm transition-all active:scale-90 ${
                dark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
              }`}
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div 
          ref={(node) => setScrollNode(node)}
          className="status-board-container flex gap-8 h-full items-start overflow-x-auto pb-12 scroll-smooth"
        >
          {columnsWithData.map((col, idx) => (
            <Column 
              key={`${col.name}-${idx}`} 
              index={idx}
              id={col.name} 
              title={col.name} 
              applications={col.apps} 
              color={col.color}
              onAddBefore={() => handleAddBefore(idx)}
              onDelete={() => handleDeleteColumn(idx)}
              onUpdate={(updates) => handleUpdateColumn(idx, updates)}
              onDeleteTask={(id) => deleteAppMutation.mutate(id)}
            />
          ))}
        </div>
      </DragDropContext>

      <style dangerouslySetInnerHTML={{ __html: `.status-board-container::-webkit-scrollbar { display: none; } .status-board-container { scrollbar-width: none; }`}} />
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, updateApplication, getProfile, updateProfile, deleteApplication } from '../api';
import Column from './Column';
import AddApplicationModal from './AddApplicationModal';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  
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

  const updateAppMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateApplication(id, { status }),
    onMutate: async () => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      
      // Snapshot previous value
      const previousApps = queryClient.getQueryData(['applications']);
      
      // Note: We skip doing naive setLocalData optimistic updates here using .map() 
      // because it ruins the drop animation and causes drag-and-drop flickering.
      // The onDragEnd handler explicitly handles optimistic re-ordering safely.

      return { previousApps };
    },
    onError: (_err, _variables, context) => {
      // Rollback
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

    // Snapshot the new order
    const newLocalData = Array.from(localData);
    const itemIndex = newLocalData.findIndex(app => app._id === draggableId);
    if (itemIndex === -1) return;
    
    // Extract the item and change its status
    const movedItem = { ...newLocalData[itemIndex], status: destination.droppableId };
    newLocalData.splice(itemIndex, 1);
    
    // Find where it belongs based on drop point
    const destApps = newLocalData.filter(app => app.status === destination.droppableId);
    
    if (destApps.length === 0 || destination.index >= destApps.length) {
      newLocalData.push(movedItem);
    } else {
      const itemAtTarget = destApps[destination.index];
      const targetIndex = newLocalData.findIndex(app => app._id === itemAtTarget._id);
      newLocalData.splice(targetIndex, 0, movedItem);
    }
    
    // Synchronously update UI to prevent DND flicker
    setLocalData(newLocalData);
    queryClient.setQueryData(['applications'], newLocalData);

    const newStatus = destination.droppableId;
    updateAppMutation.mutate({ id: draggableId, status: newStatus });
  };

  const handleAddBefore = (index: number) => {
    const newCols = [...columns];
    newCols.splice(index, 0, { name: `Stage ${columns.length + 1}`, color: '#6366f1' });
    syncBoard(newCols);
    toast.success('Stage added');
  };


  const handleDeleteColumn = async (index: number) => {
    if (columns.length <= 1) {
      return toast.error('Board must have at least one stage');
    }

    const stageToDelete = columns[index].name;
    const firstStage = columns[index === 0 ? 1 : 0].name;

    const appsToMove = localData.filter(app => app.status === stageToDelete);
    
    try {
      if (appsToMove.length > 0) {
        toast.loading(`Moving items to ${firstStage}...`, { id: 'reassigning' });
        for (const app of appsToMove) {
          await updateApplication(app._id, { status: firstStage });
        }
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
      appsToUpdate.forEach(app => {
        updateAppMutation.mutate({ id: app._id, status: updates.name! });
      });
      setLocalData(prev => prev.map(app => 
        app.status === oldName ? { ...app, status: updates.name } : app
      ));
    }

    syncBoard(newCols);
  };

  const columnsWithData = useMemo(() => {
    return columns.map(col => ({
      ...col,
      apps: localData.filter(app => app.status === col.name)
    }));
  }, [columns, localData]);

  if ((isAppsLoading && applications.length === 0) || (isProfileLoading && !profile)) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            Status Board
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Refining your application lifecycle through customization.</p>
        </div>
        <div className="flex gap-3">
          <AddApplicationModal />
        </div>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="status-board-container flex gap-8 h-full items-start overflow-x-auto pb-12 scrollbar-hide">
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

      <style dangerouslySetInnerHTML={{ __html: `
        .status-board-container::-webkit-scrollbar { display: none; }
        .status-board-container { scrollbar-width: none; }
      `}} />
    </div>
  );
}

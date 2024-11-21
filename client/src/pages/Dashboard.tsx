import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitMerge, Plus, Archive, LogOut, Inbox } from 'lucide-react';
import { tasks } from '../lib/api';
import { removeStoredToken } from '../lib/utils';
import { TaskCard } from '../components/TaskCard';
import { TaskForm } from '../components/TaskForm';
import { Task, Status, Priority } from '../types';
import { EditTaskDialog } from '../components/EditTaskDialog';

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>('TODO');
  const [showArchived, setShowArchived] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: allTasks = [], isLoading, error: tasksError } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await tasks.getAll();
      if (response.error) throw new Error(response.error);
      return response.data.tasks;
    },
    staleTime: 1000 * 60,
    retry: 2,
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      priority: Priority;
      isRecurring: boolean;
      recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    }) => {
      const response = await tasks.create(data);
      if (response.error) throw new Error(response.error);
      return response.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowTaskForm(false);
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await tasks.update(id, data);
      if (response.error) throw new Error(response.error);
      return response.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTaskToEdit(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const response = await tasks.updateStatus(id, status);
      if (response.error) throw new Error(response.error);
      return response.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: Priority }) => {
      const response = await tasks.updatePriority(id, priority);
      if (response.error) throw new Error(response.error);
      return response.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await tasks.archive(id);
      if (response.error) throw new Error(response.error);
      return response.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await tasks.delete(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    priority: Priority;
    isRecurring: boolean;
    recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  }) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in mutation's onError
    }
  };

  const handleStatusChange = async (taskId: string, status: Status) => {
    try {
      await updateStatusMutation.mutateAsync({ id: taskId, status });
    } catch (error) {
      // Error is handled in mutation's onError
    }
  };

  const handlePriorityChange = async (taskId: string, priority: Priority) => {
    try {
      await updatePriorityMutation.mutateAsync({ id: taskId, priority });
    } catch (error) {
      // Error is handled in mutation's onError
    }
  };

  const handleArchive = async (taskId: string) => {
    try {
      await archiveMutation.mutateAsync(taskId);
    } catch (error) {
      // Error is handled in mutation's onError
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToEdit(task);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteMutation.mutateAsync(taskId);
    } catch (error) {
      // Error is handled in mutation's onError
    }
  };

  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
    try {
      await updateMutation.mutateAsync({ id: taskId, data });
    } catch (error) {
      // Error is handled in mutation's onError
    }
  };

  const handleLogout = () => {
    removeStoredToken();
    navigate('/login');
  };

  const filteredTasks = allTasks.filter((task: Task) => {
    if (showArchived) {
      return task.status === 'ARCHIVED';
    }
    return task.status === selectedStatus;
  });

  const columns: Status[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-green-400 flex items-center justify-center">
        <div className="text-center">
          <GitMerge size={48} className="animate-spin mx-auto mb-4" />
          <p className="font-mono">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="min-h-screen bg-gray-950 text-red-400 flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-lg mb-4">Error loading tasks</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-mono"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-green-400">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <GitMerge size={32} className="text-green-400" />
            <div>
              <h1 className="text-xl font-mono">$ merge</h1>
              <p className="text-sm font-mono text-gray-500">
                {showArchived ? '~/stash' : '~/tasks'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-mono"
            >
              <Plus size={16} />
              <span>$ touch task</span>
            </button>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center space-x-2 px-4 py-2 rounded font-mono ${
                showArchived
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {showArchived ? (
                <>
                  <Inbox size={16} />
                  <span>$ cd tasks</span>
                </>
              ) : (
                <>
                  <Archive size={16} />
                  <span>$ cd stash</span>
                </>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 focus:outline-none"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {!showArchived && (
          <div className="grid grid-cols-4 gap-4">
            {columns.map((status) => (
              <div key={status} className="bg-gray-900 rounded-lg p-4">
                <h2 className="font-mono text-green-400 mb-4 text-lg border-b border-gray-800 pb-2">
                  $ ls {status.toLowerCase().replace('_', '-')}
                </h2>
                <div className="space-y-4">
                  {allTasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => handleEditTask(task.id)}
                        onStatusChange={handleStatusChange}
                        onPriorityChange={handlePriorityChange}
                        onArchive={handleArchive}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  {allTasks.filter((task) => task.status === status).length === 0 && (
                    <div className="text-gray-500 font-mono text-sm p-4 border border-gray-800 rounded bg-gray-900/50">
                      $ no tasks found in {status.toLowerCase().replace('_', '-')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showArchived && (
          <div className="bg-gray-900 rounded-lg p-4">
            <h2 className="font-mono text-green-400 mb-4 text-lg border-b border-gray-800 pb-2">
              $ ls archived
            </h2>
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleEditTask(task.id)}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onArchive={handleArchive}
                  onDelete={handleDeleteTask}
                />
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-gray-500 font-mono text-sm p-4 border border-gray-800 rounded bg-gray-900/50">
                  $ no tasks found in stash
                </div>
              )}
            </div>
          </div>
        )}

        {showTaskForm && (
          <TaskForm
            onSubmit={handleCreateTask}
            onClose={() => setShowTaskForm(false)}
            isLoading={createMutation.isPending}
          />
        )}

        {taskToEdit && (
          <EditTaskDialog
            task={taskToEdit}
            onClose={() => setTaskToEdit(null)}
            onSubmit={(data) => handleUpdateTask(taskToEdit.id, data)}
          />
        )}
      </div>
    </div>
  );
}

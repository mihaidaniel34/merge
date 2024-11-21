import React from 'react';
import { CheckCircle2, Circle, Trash2, Loader2 } from 'lucide-react';
import { Task } from '../lib/api';
import { cn } from '../lib/utils';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  isLoading: boolean;
  loadingTaskId?: string;
}

export function TaskList({
  tasks,
  onToggleTask,
  onDeleteTask,
  isLoading,
  loadingTaskId,
}: TaskListProps) {
  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-green-400" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "flex items-center justify-between bg-gray-800 p-3 rounded",
            task.completed && "opacity-50"
          )}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleTask(task.id, !task.completed)}
              disabled={loadingTaskId === task.id}
              className="text-green-400 hover:text-green-500 focus:outline-none"
            >
              {task.completed ? (
                <CheckCircle2 size={20} />
              ) : (
                <Circle size={20} />
              )}
            </button>
            <span
              className={cn(
                "font-mono text-green-400",
                task.completed && "line-through"
              )}
            >
              {task.title}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {loadingTaskId === task.id && (
              <Loader2 className="animate-spin text-green-400" size={18} />
            )}
            <button
              onClick={() => onDeleteTask(task.id)}
              disabled={loadingTaskId === task.id}
              className="text-red-400 hover:text-red-500 focus:outline-none"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

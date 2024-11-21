import React from 'react';
import { MoreVertical, Flag, RefreshCw } from 'lucide-react';
import { Task, Status, Priority } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange: (taskId: string, status: Status) => void;
  onPriorityChange: (taskId: string, priority: Priority) => void;
  onArchive: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onStatusChange,
  onPriorityChange,
  onArchive,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.TODO:
        return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
      case Status.IN_PROGRESS:
        return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
      case Status.IN_REVIEW:
        return 'text-purple-400 border-purple-400/20 bg-purple-400/10';
      case Status.DONE:
        return 'text-green-400 border-green-400/20 bg-green-400/10';
      case Status.ARCHIVED:
        return 'text-gray-400 border-gray-400/20 bg-gray-400/10';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
      case Priority.MEDIUM:
        return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
      case Priority.HIGH:
        return 'text-red-400 border-red-400/20 bg-red-400/10';
    }
  };

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-green-400/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <h3 className="font-mono text-green-400 truncate">{task.title}</h3>
          {task.description && (
            <p className="text-gray-400 text-sm font-mono line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm flex-wrap">
            <div className={`flex items-center px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 border border-gray-700`}>
              <span className="font-mono">{task.status.toLowerCase().replace('_', ' ')}</span>
            </div>
            <div className={`flex items-center px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
              <Flag size={14} className="mr-1" />
              <span className="font-mono">{task.priority.toLowerCase()}</span>
            </div>
            {task.isRecurring && (
              <div className="flex items-center bg-blue-400/10 text-blue-400 border border-blue-400/20 px-2 py-0.5 rounded-md">
                <RefreshCw size={14} className="mr-1" />
                <span className="font-mono">
                  {task.recurrencePattern?.toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 z-10">
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-700">
                  Status
                </div>

                <div className="p-2 space-y-1">
                  {Object.values(Status)
                    .filter((status) => status !== Status.ARCHIVED)
                    .map((status) => (
                      <div
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(task.id, status);
                          setShowMenu(false);
                        }}
                        className={`inline-flex items-center px-2 py-0.5 rounded-md border ${getStatusColor(status)} hover:bg-gray-700/50 transition-colors cursor-pointer w-full text-sm font-mono`}
                      >
                        $ mv --{status.toLowerCase().replace('_', '-')}
                      </div>
                    ))}
                </div>

                <div className="px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-700 mt-2">
                  Priority
                </div>

                <div className="p-2 space-y-1">
                  {Object.values(Priority).map((priority) => (
                    <div
                      key={priority}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPriorityChange(task.id, priority);
                        setShowMenu(false);
                      }}
                      className={`inline-flex items-center px-2 py-0.5 rounded-md border ${getPriorityColor(priority)} hover:bg-gray-700/50 transition-colors cursor-pointer w-full text-sm font-mono`}
                    >
                      <Flag size={14} className="mr-1" />
                      $ flag --{priority.toLowerCase()}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700 mt-2">
                  <div className="p-2 space-y-1">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                        setShowMenu(false);
                      }}
                      className="inline-flex items-center px-2 py-0.5 rounded-md border border-blue-400/20 bg-blue-400/10 text-blue-400 hover:bg-gray-700/50 transition-colors cursor-pointer w-full text-sm font-mono"
                    >
                      $ nano task.md
                    </div>
                    
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive(task.id);
                        setShowMenu(false);
                      }}
                      className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-600/20 bg-gray-600/10 text-gray-400 hover:bg-gray-700/50 transition-colors cursor-pointer w-full text-sm font-mono"
                    >
                      $ git stash
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('$ rm -rf task\nAre you sure you want to delete this task?')) {
                          onDelete(task.id);
                        }
                        setShowMenu(false);
                      }}
                      className="inline-flex items-center px-2 py-0.5 rounded-md border border-red-400/20 bg-red-400/10 text-red-400 hover:bg-gray-700/50 transition-colors cursor-pointer w-full text-sm font-mono"
                    >
                      $ rm -rf task
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

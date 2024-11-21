import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface CreateTaskProps {
  onCreateTask: (title: string) => Promise<void>;
  isLoading: boolean;
}

export function CreateTask({ onCreateTask, isLoading }: CreateTaskProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await onCreateTask(title);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="$ new-task --title 'Your task here'"
            className="w-full bg-gray-800 text-green-400 placeholder-gray-500 font-mono px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className={cn(
            "bg-green-600 hover:bg-green-700 text-white font-mono py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center",
            (isLoading || !title.trim()) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <PlusCircle size={18} />
          )}
        </button>
      </div>
    </form>
  );
}

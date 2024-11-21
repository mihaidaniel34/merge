import React, { useState } from 'react';
import { Task, Status, Priority } from '../types';
import { X } from 'lucide-react';

interface EditTaskDialogProps {
  task: Task;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
}

export const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  task,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    isRecurring: task.isRecurring || false,
    recurrencePattern: task.recurrencePattern || 'DAILY',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      description: formData.description || undefined,
      recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-green-400 font-mono text-lg">$ nano task.md</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 font-mono text-sm mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-300 font-mono focus:outline-none focus:border-green-400/50"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 font-mono text-sm mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-300 font-mono focus:outline-none focus:border-green-400/50 h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-mono text-sm mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-300 font-mono focus:outline-none focus:border-green-400/50"
            >
              {Object.values(Priority).map((priority) => (
                <option key={priority} value={priority}>
                  $ flag --{priority.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isRecurring"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 rounded text-green-400 focus:ring-0 focus:ring-offset-0"
            />
            <label
              htmlFor="isRecurring"
              className="text-gray-400 font-mono text-sm select-none"
            >
              Enable recurrence
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="block text-gray-400 font-mono text-sm mb-1">
                Recurrence Pattern
              </label>
              <select
                name="recurrencePattern"
                value={formData.recurrencePattern}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-300 font-mono focus:outline-none focus:border-green-400/50"
              >
                <option value="DAILY">$ cron --daily</option>
                <option value="WEEKLY">$ cron --weekly</option>
                <option value="MONTHLY">$ cron --monthly</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 rounded font-mono text-gray-400 hover:bg-gray-800 transition-colors"
            >
              $ exit
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-400/10 border border-green-400/20 rounded font-mono text-green-400 hover:bg-green-400/20 transition-colors"
            >
              $ git commit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

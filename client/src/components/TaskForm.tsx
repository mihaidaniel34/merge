import React, { useState } from 'react';
import { X, Flag, RefreshCw } from 'lucide-react';
import { Priority } from '../types';

interface TaskFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    priority: Priority;
    isRecurring: boolean;
    recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  }) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onClose,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    isRecurring: false,
    recurrencePattern: undefined as 'DAILY' | 'WEEKLY' | 'MONTHLY' | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      description: formData.description || undefined,
      recurrencePattern: formData.isRecurring ? formData.recurrencePattern : undefined
    });
    onClose();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-green-400">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-green-400 font-mono text-lg">$ touch task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
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
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-green-400 font-mono focus:outline-none focus:border-green-400"
              required
              disabled={isLoading}
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
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-green-400 font-mono focus:outline-none focus:border-green-400 h-24 resize-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-400 font-mono text-sm mb-1">
              Priority
            </label>
            <div className="flex gap-4">
              {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((priority) => (
                <label
                  key={priority}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={handleChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <div
                    className={`flex items-center px-3 py-1 rounded font-mono text-sm ${
                      formData.priority === priority
                        ? priority === 'LOW'
                          ? 'bg-green-400 text-black'
                          : priority === 'MEDIUM'
                          ? 'bg-yellow-400 text-black'
                          : 'bg-red-400 text-black'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <Flag size={14} className="mr-1" />
                    {priority.toLowerCase()}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="hidden"
                disabled={isLoading}
              />
              <div
                className={`flex items-center px-3 py-1 rounded font-mono text-sm ${
                  formData.isRecurring
                    ? 'bg-blue-400 text-black'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <RefreshCw size={14} className="mr-1" />
                recurring
              </div>
            </label>

            <select
              name="recurrencePattern"
              value={formData.recurrencePattern}
              onChange={handleChange}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-green-400 focus:outline-none focus:border-green-400"
              disabled={isLoading}
            >
              <option value="">--select interval--</option>
              <option value="DAILY">$ cron --daily</option>
              <option value="WEEKLY">$ cron --weekly</option>
              <option value="MONTHLY">$ cron --monthly</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-mono py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            $ create
          </button>
        </form>
      </div>
    </div>
  );
};

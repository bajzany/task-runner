import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import CustomerApiClient from '../clients/CustomerApiClient';

type FormData = {
  name: string;
  priority: number;
};

export const CreateTaskModal: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await CustomerApiClient.createTask(data);
      setOpen(false);
      reset();
      if (onCreated) onCreated(); // refresh if needed
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        Create Task
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-md w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Name</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority (1-10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
                  {...register('priority', {
                    required: 'Priority is required',
                    min: 1,
                    max: 10,
                  })}
                />
                {errors.priority && (
                  <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useEffect, useState } from 'react';
import {useParams, useNavigate, Link} from 'react-router';
import CustomerApiClient, { Task, TaskStatusLog } from '../clients/CustomerApiClient';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<TaskStatusLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(taskId: string) {
    try {
      setLoading(true);
      const [taskData, historyData] = await Promise.all([
        CustomerApiClient.getTask(taskId),
        CustomerApiClient.getTaskHistory(taskId),
      ]);
      setTask(taskData);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!task) return;
    if (!window.confirm('Really cancel this task?')) return;
    setActionLoading(true);
    try {
      await CustomerApiClient.cancelTask(task.id);
      await loadData(task.id);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRestart() {
    if (!task) return;
    if (!window.confirm('Restart this task?')) return;
    setActionLoading(true);
    try {
      await CustomerApiClient.restartTask(task.id);
      await loadData(task.id);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    if (!window.confirm('Delete this task permanently?')) return;
    setActionLoading(true);
    try {
      await CustomerApiClient.deleteTask(task.id);
      navigate('/');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center text-gray-500">Loading task details...</div>;
  }

  if (!task) {
    return <div className="text-center text-red-500">Task not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow p-6 rounded mt-6">
      <div className="mb-6 flex justify-between items-center">
        <Link className="text-blue-600 hover:underline text-sm flex items-center gap-1" to={'/'}>
          ← Back
        </Link>
        <button
          onClick={() => loadData(task.id)}
          className="text-sm bg-green-100 px-3 py-1 rounded hover:bg-green-200"
        >
          Reload
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-blue-700">Task Detail</h1>

      <div className="mb-6 space-y-2 text-sm">
        <p><strong>ID:</strong> {task.id}</p>
        <p><strong>Name:</strong> {task.name}</p>
        <p><strong>Status:</strong> {task.status}</p>
        <p><strong>Progress:</strong> {task.progress}%</p>
        <p><strong>Priority:</strong> {task.priority}</p>
        {task.error_msg && (
          <p className="text-red-600"><strong>Error:</strong> {task.error_msg}</p>
        )}
      </div>
      <div className="flex gap-4 mb-6 flex-wrap">
        {task.status === 'in_progress' && (
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleRestart}
          disabled={actionLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Restart
        </button>
        <button
          onClick={handleDelete}
          disabled={actionLoading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Status History</h2>
      <ul className="space-y-2 text-sm">
        {history.map((log) => (
          <li key={log.id} className="border rounded p-3 shadow-sm bg-gray-50">
            <p><strong>Status:</strong> {log.new_status}</p>
            <p><strong>Reason:</strong> {log.reason}</p>
            <p className="text-gray-500">
              <strong>Time:</strong> {new Date(log.changed_at).toLocaleString()}
            </p>
          </li>
        ))}
        {history.length === 0 && (
          <p className="text-gray-400">No history available.</p>
        )}
      </ul>
    </div>
  );
}

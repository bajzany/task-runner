import React, { useEffect, useState } from 'react';
import CustomerApiClient, { PaginationData, Task } from '../clients/CustomerApiClient';
import { Link } from 'react-router';
import {CreateTaskModal} from "./CreateTaskModal";

const ITEMS_PER_PAGE = 20;

export const TaskTable: React.FC = () => {
  const [taskPaginationData, setTaskPaginationData] = useState<PaginationData<Task>>({
    data: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  async function loadData(page: number) {
    try {
      setLoading(true);
      const data = await CustomerApiClient.getTasks(page, ITEMS_PER_PAGE);
      setTaskPaginationData(data);
    } catch (e) {
      console.error('error', e);
    } finally {
      setLoading(false);
    }
  }

  const tasks = taskPaginationData.data;
  const totalPages = Math.ceil(taskPaginationData.total / ITEMS_PER_PAGE);

  return (
    <div className="bg-white shadow-md rounded p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Task List</h2>
        <CreateTaskModal onCreated={() => loadData(currentPage)}/>
      </div>
      <div className="hidden md:block overflow-x-auto min-h-[800px]">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Progress</th>
            <th className="px-4 py-2 text-left">Priority</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
          </thead>
          <tbody>
          {loading
            ? Array.from({length: ITEMS_PER_PAGE}).map((_, index) => (
              <tr key={index} className="border-t animate-pulse">
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"/>
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"/>
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"/>
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"/>
                </td>
                <td className="px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"/>
                </td>
              </tr>
            ))
            : tasks.map((task) => (
              <tr key={task.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{task.name}</td>
                <td className="px-4 py-2">{task.status}</td>
                <td className="px-4 py-2">{task.progress}%</td>
                <td className="px-4 py-2">{task.priority}</td>
                <td className="px-4 py-2">
                  <Link className="text-blue-600 hover:underline" to={`/${task.id}`}>
                    Detail →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-4">
        {loading
          ? Array.from({length: 5}).map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded p-4 shadow-sm bg-gray-50 animate-pulse space-y-2"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2"/>
              <div className="h-4 bg-gray-200 rounded w-3/4"/>
              <div className="h-4 bg-gray-200 rounded w-2/3"/>
            </div>
          ))
          : tasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 rounded p-4 shadow-sm bg-gray-50"
            >
              <p className="font-semibold text-blue-600">{task.name}</p>
              <p><strong>Status:</strong> {task.status}</p>
              <p><strong>Progress:</strong> {task.progress}%</p>
              <p><strong>Priority:</strong> {task.priority}</p>
              <Link className="mt-2 inline-block text-sm text-blue-600 hover:underline" to={`/${task.id}`}>
                Detail →
              </Link>
            </div>
          ))}
      </div>
      <div className="flex justify-between items-center mt-6">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}
        >
          ⬅ Prev
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === totalPages}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

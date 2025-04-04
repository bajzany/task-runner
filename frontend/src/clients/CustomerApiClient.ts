export type Status = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  id: string;
  name: string;
  status: Status;
  progress: number;
  priority: number;
  error_msg: string;
}

export interface TaskStatsData {
  total: number;
  completed: number;
  failed: number;
  cancelled: number;
  pending: number;
  in_progress: number;
  avg_duration_sec: number;
  max_duration_sec: number;
  min_duration_sec: number;
  avg_priority: number;
}

export interface PaginationData<DATA_TYPE> {
  data: DATA_TYPE[];
  total: number
}

export interface TaskStatusLog {
  id: string;
  task_id: string;
  new_status: string;
  reason: string;
  changed_at: string;
}

export interface CreateTaskData {
  name: string;
  priority: number
}

const baseUrl = process.env.REACT_APP_API_URL!

class TaskApiClient {
  private readonly baseUrl: string = baseUrl;

  async getStats(): Promise<TaskStatsData> {
    const res = await fetch(`${this.baseUrl}/tasks/stats`);
    if (!res.ok) {
      throw new Error(`Failed to fetch task stats (${res.status})`);
    }
    return res.json();
  }

  async getTask(id: string): Promise<Task> {
    const res = await fetch(`${this.baseUrl}/tasks/${id}`);
    if (!res.ok) throw new Error(`Failed to load task ${id}`);
    return res.json();
  }

  async getTaskHistory(id: string): Promise<TaskStatusLog[]> {
    const res = await fetch(`${this.baseUrl}/tasks/${id}/history`);
    if (!res.ok) throw new Error(`Failed to load task history`);
    return res.json();
  }

  async getTasks(page: number, pageSize: number): Promise<PaginationData<Task>> {
    const res = await fetch(`${this.baseUrl}/tasks?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error('Failed to fetch paginated tasks');
    return res.json();
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    const res = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to create task: ${res.status} ${body}`);
    }

    return res.json();
  }

  async cancelTask(id: string) {
    const res = await fetch(`${this.baseUrl}/tasks/${id}/cancel`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to cancel task');
  }

  async restartTask(id: string) {
    const res = await fetch(`${this.baseUrl}/tasks/${id}/restart`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to restart task');
  }

  async deleteTask(id: string) {
    const res = await fetch(`${this.baseUrl}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
  }
}

const client = new TaskApiClient()

export default client

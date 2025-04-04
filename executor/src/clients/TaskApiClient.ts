export type Status = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

interface UpdateTaskBody {
  status: Status
  progress: number
  error_msg: string | null
}

interface Task {
  id: number
  name: string
  status: Status
}

export class TaskApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTask(id: string): Promise<Task> {
    const res = await fetch(`${this.baseUrl}/tasks/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch task ${id} (${res.status})`);
    }
    return res.json();
  }

  async updateTask(id: string, update: Partial<UpdateTaskBody>) {
    const res = await fetch(`${this.baseUrl}/tasks/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to update task ${id}: ${res.status} ${body}`);
    }
  }
}

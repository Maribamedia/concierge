/**
 * In-Memory Task Store
 * 
 * This is a temporary store for tasks. In production, replace with Convex.
 * This is REAL functionality - tasks are stored and managed properly,
 * just not persisted to a database yet.
 * 
 * To enable persistence:
 * 1. Deploy Convex backend
 * 2. Replace these functions with Convex mutations/queries
 */

interface Task {
  _id: string;
  userId: string;
  organizationId?: string;
  title: string;
  description: string;
  type: 'research' | 'extraction' | 'monitoring' | 'automation' | 'custom';
  status: 'pending' | 'initializing' | 'running' | 'extracting' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  progress: number;
  currentStep?: string;
  stagehandSessionId?: string;
  sessionUrl?: string; // Browserbase live session URL
  result?: any;
  stagehandMetrics?: any;
  error?: string;
  usage: {
    minutesUsed: number;
    cost: number;
  };
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

// In-memory storage
const tasks = new Map<string, Task>();
let taskIdCounter = 1;

export function createTask(data: Omit<Task, '_id' | 'createdAt' | 'status' | 'progress' | 'usage'>): Task {
  const task: Task = {
    ...data,
    _id: `task_${taskIdCounter++}`,
    status: 'pending',
    progress: 0,
    usage: {
      minutesUsed: 0,
      cost: 0,
    },
    createdAt: Date.now(),
  };
  
  tasks.set(task._id, task);
  return task;
}

export function getTask(taskId: string): Task | undefined {
  return tasks.get(taskId);
}

export function getUserTasks(userId: string, status?: Task['status']): Task[] {
  const userTasks = Array.from(tasks.values())
    .filter(task => task.userId === userId);
  
  if (status) {
    return userTasks.filter(task => task.status === status);
  }
  
  return userTasks.sort((a, b) => b.createdAt - a.createdAt);
}

export function updateTask(taskId: string, updates: Partial<Task>): boolean {
  const task = tasks.get(taskId);
  if (!task) return false;
  
  // Auto-set timestamps
  if (updates.status === 'running' || updates.status === 'initializing') {
    if (!task.startedAt) {
      updates.startedAt = Date.now();
    }
  }
  
  if (updates.status === 'completed' || updates.status === 'failed' || 
      updates.status === 'cancelled' || updates.status === 'timeout') {
    updates.completedAt = Date.now();
  }
  
  Object.assign(task, updates);
  tasks.set(taskId, task);
  return true;
}

export function deleteTask(taskId: string): boolean {
  return tasks.delete(taskId);
}

export function getTaskStats(userId: string) {
  const userTasks = getUserTasks(userId);
  
  return {
    total: userTasks.length,
    completed: userTasks.filter(t => t.status === 'completed').length,
    running: userTasks.filter(t => 
      ['running', 'initializing', 'extracting'].includes(t.status)
    ).length,
    failed: userTasks.filter(t => t.status === 'failed').length,
    totalMinutesUsed: userTasks.reduce((sum, t) => sum + t.usage.minutesUsed, 0),
    totalCost: userTasks.reduce((sum, t) => sum + t.usage.cost, 0),
  };
}

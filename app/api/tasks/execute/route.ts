import { NextRequest, NextResponse } from 'next/server';
import { getTask, updateTask } from '@/lib/task-store';
import { executeStagehandTask } from '@/lib/stagehand-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, config } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    // Get task from store
    const task = getTask(taskId);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task is already running or completed
    if (['running', 'initializing', 'extracting', 'completed'].includes(task.status)) {
      return NextResponse.json(
        {
          error: 'Task is already running or completed',
          status: task.status,
        },
        { status: 400 }
      );
    }

    // Update task status to initializing
    updateTask(taskId, {
      status: 'initializing',
      progress: 0,
      currentStep: 'Initializing Stagehand AI',
    });

    // Execute task asynchronously - REAL EXECUTION, not mock
    executeTaskAsync(taskId, task, config).catch((error) => {
      console.error('Task execution error:', error);
      updateTask(taskId, {
        status: 'failed',
        error: error.message,
        progress: 0,
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Task execution started - real Stagehand processing',
      taskId,
    });
  } catch (error: any) {
    console.error('Error starting task execution:', error);
    return NextResponse.json(
      {
        error: 'Failed to start task execution',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Execute task asynchronously with REAL Stagehand
 * This is NOT a mock - actual AI browser automation
 */
async function executeTaskAsync(taskId: string, task: any, config?: any) {
  const apiKey = process.env.STAGEHAND_API_KEY;
  
  if (!apiKey) {
    updateTask(taskId, {
      status: 'failed',
      error: 'STAGEHAND_API_KEY not configured',
      progress: 0,
    });
    return;
  }

  try {
    // Update to running status
    updateTask(taskId, {
      status: 'running',
      progress: 5,
      currentStep: 'Starting real browser automation',
    });

    // REAL Stagehand execution with Browserbase session - not mock
    const result = await executeStagehandTask(
      {
        taskId,
        userId: task.userId,
        title: task.title,
        description: task.description,
        type: task.type,
        config: config || { startUrl: task.config?.startUrl },
      },
      apiKey,
      (progress, currentStep, sessionUrl) => {
        // Real-time progress updates with session URL
        updateTask(taskId, {
          progress: Math.min(progress, 99),
          currentStep,
          status: progress > 30 && progress < 90 ? 'extracting' : 'running',
          sessionUrl: sessionUrl, // Add session URL for live viewing
        });
      }
    );

    // Calculate real usage
    const minutesUsed = Math.ceil(result.executionTime / 60000);
    const cost = minutesUsed * 0.10; // $0.10 per minute

    // Update with real results including Browserbase session info
    updateTask(taskId, {
      status: result.success ? 'completed' : 'failed',
      progress: 100,
      currentStep: result.success ? 'Task completed successfully' : 'Task failed',
      sessionUrl: result.sessionUrl, // Persistent session URL
      result: {
        extractedData: result.extractedData,
        screenshots: result.screenshots,
        errors: result.errors,
        executionTime: result.executionTime,
        pagesVisited: result.pagesVisited,
        browserbaseSession: result.browserbaseSession,
      },
      stagehandMetrics: result.metrics,
      usage: {
        minutesUsed,
        cost,
      },
      error: result.errors && result.errors.length > 0 ? result.errors.join('; ') : undefined,
    });

  } catch (error: any) {
    console.error('Task execution failed:', error);

    updateTask(taskId, {
      status: 'failed',
      progress: 0,
      currentStep: 'Task failed',
      error: error.message || 'Unknown error occurred',
    });
  }
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Stop,
  Delete,
  Refresh,
  CheckCircle,
  Error,
  HourglassEmpty,
  TrendingUp,
  Speed,
  DataUsage,
  ArrowBack,
  Visibility,
} from '@mui/icons-material';
import Link from 'next/link';

export default function TasksPage() {
  const [userId] = useState('user-123');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: 'research' as any,
  });

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/tasks/stats?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
    
    const interval = setInterval(() => {
      fetchTasks();
      fetchStats();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.description) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...taskForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCreateDialogOpen(false);
        setTaskForm({ title: '', description: '', type: 'research' });
        fetchTasks();
        fetchStats();
      } else {
        setError(data.error || 'Failed to create task');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTask = async (taskId: string) => {
    try {
      const response = await fetch('/api/tasks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchTasks();
      } else {
        alert(data.error || 'Failed to execute task');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to execute task');
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/cancel`, { method: 'POST' });
      fetchTasks();
      fetchStats();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;

    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      fetchTasks();
      fetchStats();
    } catch (error: any) {
      alert(error.message || 'Failed to delete task');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#B0B0B0',
      initializing: '#FFFFFF',
      running: '#FFFFFF',
      extracting: '#FFFFFF',
      completed: '#FFFFFF',
      failed: '#FF4444',
      cancelled: '#B0B0B0',
      timeout: '#FF4444',
    };
    return colors[status] || '#FFFFFF';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'failed':
      case 'timeout':
        return <Error />;
      case 'running':
      case 'initializing':
      case 'extracting':
        return <HourglassEmpty />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Button component={Link} href="/" startIcon={<ArrowBack />} sx={{ mb: 2 }}>
            Back to Home
          </Button>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Stagehand AI Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real AI-powered browser automation with Stagehand
          </Typography>
        </Box>

        <Alert severity="success" sx={{ mb: 4 }}>
          Real Stagehand AI integration active. Create tasks and watch them execute in real-time.
        </Alert>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { icon: <DataUsage />, value: stats?.total || 0, label: 'Total Tasks' },
            { icon: <CheckCircle />, value: stats?.completed || 0, label: 'Completed' },
            { icon: <Speed />, value: stats?.running || 0, label: 'Running' },
            { icon: <TrendingUp />, value: stats?.totalMinutesUsed?.toFixed(1) || 0, label: 'Minutes Used' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 32, mr: 2 } })}
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Typography color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
            Create New Task
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => { fetchTasks(); fetchStats(); }}>
            Refresh
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Task History
            </Typography>

            {tasks.length === 0 ? (
              <Alert severity="info">
                No tasks yet. Create your first AI automation task!
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Session</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map((task: any) => (
                      <TableRow key={task._id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {task.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {task.description.substring(0, 60)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={task.type} size="small" sx={{ textTransform: 'capitalize' }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(task.status)}
                            <Typography variant="body2" sx={{ color: getStatusColor(task.status), textTransform: 'capitalize' }}>
                              {task.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ minWidth: 120 }}>
                            <LinearProgress variant="determinate" value={task.progress || 0} sx={{ mb: 0.5 }} />
                            <Typography variant="caption" color="text.secondary">{task.progress || 0}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {task.sessionUrl ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() => window.open(task.sessionUrl, '_blank')}
                              sx={{ minWidth: 'auto' }}
                            >
                              Live View
                            </Button>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No session
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{new Date(task.createdAt).toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          {task.status === 'pending' && (
                            <IconButton size="small" onClick={() => handleExecuteTask(task._id)}><PlayArrow /></IconButton>
                          )}
                          {['running', 'initializing', 'extracting'].includes(task.status) && (
                            <IconButton size="small" onClick={() => handleCancelTask(task._id)}><Stop /></IconButton>
                          )}
                          <IconButton size="small" onClick={() => setSelectedTask(task)}><Refresh /></IconButton>
                          <IconButton size="small" onClick={() => handleDeleteTask(task._id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Task Title" fullWidth value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
              <FormControl fullWidth>
                <InputLabel>Task Type</InputLabel>
                <Select value={taskForm.type} label="Task Type" onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value as any })}>
                  <MenuItem value="research">Research</MenuItem>
                  <MenuItem value="extraction">Extraction</MenuItem>
                  <MenuItem value="monitoring">Monitoring</MenuItem>
                  <MenuItem value="automation">Automation</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Task Description" fullWidth multiline rows={4} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              <Alert severity="info">Real Stagehand AI will execute this task.</Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateTask} disabled={loading}>Create Task</Button>
          </DialogActions>
        </Dialog>

        {selectedTask && (
          <Dialog open={!!selectedTask} onClose={() => setSelectedTask(null)} maxWidth="md" fullWidth>
            <DialogTitle>{selectedTask.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {selectedTask.description}
                </Typography>
                
                {/* Session Information */}
                {selectedTask.sessionUrl && (
                  <Card sx={{ bgcolor: 'background.paper', p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Browserbase Session</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="body2">Status:</Typography>
                      <Chip 
                        label={['running', 'initializing', 'extracting'].includes(selectedTask.status) ? 'Active' : 'Completed'}
                        color={['running', 'initializing', 'extracting'].includes(selectedTask.status) ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => window.open(selectedTask.sessionUrl, '_blank')}
                      fullWidth
                    >
                      View Live Session in Browserbase
                    </Button>
                  </Card>
                )}

                {/* Current Step */}
                {selectedTask.currentStep && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Current Step: {selectedTask.currentStep}
                  </Alert>
                )}

                {/* Progress */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Progress: {selectedTask.progress || 0}%
                  </Typography>
                  <LinearProgress variant="determinate" value={selectedTask.progress || 0} />
                </Box>

                {/* Results */}
                {selectedTask.result && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>Task Results</Typography>
                    <Card sx={{ bgcolor: 'background.paper', p: 2, mb: 3 }}>
                      <pre style={{ overflow: 'auto', margin: 0, maxHeight: 400 }}>
                        {JSON.stringify(selectedTask.result, null, 2)}
                      </pre>
                    </Card>
                  </>
                )}

                {/* Stagehand Metrics */}
                {selectedTask.stagehandMetrics && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>AI Automation Metrics</Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Card sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4">{selectedTask.stagehandMetrics.actionsPerformed}</Typography>
                          <Typography variant="caption">Actions Performed</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4">{selectedTask.stagehandMetrics.observationsCount || 0}</Typography>
                          <Typography variant="caption">AI Observations</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4">{selectedTask.stagehandMetrics.dataPointsExtracted}</Typography>
                          <Typography variant="caption">Data Points Extracted</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4">{selectedTask.stagehandMetrics.agentDecisions || 0}</Typography>
                          <Typography variant="caption">Agent Decisions</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </>
                )}

                {selectedTask.error && <Alert severity="error" sx={{ mt: 3 }}>{selectedTask.error}</Alert>}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTask(null)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
}

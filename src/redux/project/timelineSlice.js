import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import timelineApi from '../project/timelineApi';  // Đảm bảo đúng đường dẫn của file API
import dayjs from 'dayjs'; // Thư viện để xử lý ngày tháng
// Initial state
const initialState = {
  phases: [],
  currentPhase: {},
  tasks: [],
  currentTask: {},
  subtasks: [],
  taskStatuses: [],
  loading: false,
  error: null,
};

// Thực hiện các tác vụ bất đồng bộ bằng createAsyncThunk
export const getAllPhasesByProjectId = createAsyncThunk(
  'timeline/getAllPhasesByProjectId',
  async (projectId) => {
    const response = await timelineApi.getAllPhasesByProjectId(projectId);
    return response;
  }
);

export const getPhaseById = createAsyncThunk(
  'timeline/getPhaseById',
  async (phaseId) => {
    const response = await timelineApi.getPhaseById(phaseId);
      return response;
  }
);

export const createPhase = createAsyncThunk(
  'timeline/createPhase',
  async (data) => {
    const response = await timelineApi.createPhase(data);
    return response;
  }
);

export const updatePhase = createAsyncThunk(
  'timeline/updatePhase',
  async (data) => {
    const response = await timelineApi.updatePhase(data);
    return response;
  }
);

export const endPhase = createAsyncThunk(
  'timeline/endPhase',
  async (data) => {
    const response = await timelineApi.endPhase(data);
    return response;
  }
);

export const cancelPhase = createAsyncThunk(
  'timeline/cancelPhase',
  async (phaseId) => {
    const response = await timelineApi.cancelPhase(phaseId);
    return response;
  }
);
export const getTasksOfProject = createAsyncThunk(
  'timeline/getTasksOfProject',
  async (projectId) => {
    return await timelineApi.getTasksOfProject(projectId);
  }
);
export const getTasksOfPhase = createAsyncThunk(
  'timeline/getTasksOfPhase',
  async (phaseId) => {
    const response = await timelineApi.getTasksOfPhase(phaseId);
      return response;
  }
);

export const getSubtasksOfTask = createAsyncThunk(
  'timeline/getSubtasksOfTask',
  async (taskId) => {
    const response = await timelineApi.getSubtasksOfTask(taskId);
    return response;
  }
);

export const addTaskToPhase = createAsyncThunk(
  'timeline/addTaskToPhase',
  async ({ phaseId, taskData }) => {
    const response = await timelineApi.addTaskToPhase(phaseId, taskData);
      return response;
  }
);
export const getTaskById = createAsyncThunk(
  'timeline/getTaskById',
  async (taskId) => {
    const response = await timelineApi.getTaskById(taskId);
    return response;
  }
);
export const updateTaskOfPhase = createAsyncThunk(
  'timeline/updateTaskOfPhase',
  async ({ taskId, taskData }) => {
    const response = await timelineApi.updateTaskOfPhase(taskId, taskData);
      return response;
  }
);

export const cancelTaskOfPhase = createAsyncThunk(
  'timeline/cancelTaskOfPhase',
  async (taskId) => {
    const response = await timelineApi.cancelTaskOfPhase(taskId);
    return response;
  }
);

export const getAllTaskStatuses = createAsyncThunk(
  'timeline/getAllTaskStatuses',
  async (phaseId) => {
    const response = await timelineApi.getAllTaskStatuses(phaseId);
    return response;
  }
);

export const addTaskStatus = createAsyncThunk(
  'timeline/addTaskStatus',
  async (statusData) => {
    const response = await timelineApi.addTaskStatus(statusData);
      return response;
  }
);

export const updateTaskStatus = createAsyncThunk(
  'timeline/updateTaskStatus',
  async (statusData) => {
    const response = await timelineApi.updateTaskStatus(statusData);
      return response;
  }
);

export const deleteTaskStatus = createAsyncThunk(
  'timeline/deleteTaskStatus',
  async (statusId) => {
    const response = await timelineApi.deleteTaskStatus(statusId);
    return response;
  }
);

// Tạo slice với các action và reducer
const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Phases
    builder
      .addCase(getAllPhasesByProjectId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPhasesByProjectId.fulfilled, (state, action) => {
        state.loading = false;
        state.phases = action.payload;
        let activePhase = null;
        const now = dayjs();

        const ongoingOrFuturePhases = state.phases
          .filter(p => !p.phase.endTime || dayjs(p.phase.endTime).isAfter(now))
          .sort((a, b) => dayjs(a.phase.startTime).valueOf() - dayjs(b.phase.startTime).valueOf()); // Sort by start time

        if (ongoingOrFuturePhases.length > 0) {
          // Find the earliest one that has started or is the next upcoming one
          activePhase = ongoingOrFuturePhases.find(p => dayjs(p.phase.startTime).isBefore(now)) || ongoingOrFuturePhases[0];
        }

        // If no ongoing or future phases, find the most recently ended one
        if (!activePhase && state.phases.length > 0) {
          activePhase = [...state.phases].sort((a, b) => {
            const endTimeA = a.phase.endTime ? dayjs(a.phase.endTime).valueOf() : -Infinity;
            const endTimeB = b.phase.endTime ? dayjs(b.phase.endTime).valueOf() : -Infinity;
            return endTimeB - endTimeA; // Sort descending by end time
          })[0];
        }
        state.currentPhase = activePhase || null; // Set the active phase
      })
      .addCase(getAllPhasesByProjectId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Phase
      .addCase(getPhaseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPhaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPhase = action.payload;
      })
      .addCase(getPhaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create and Update Phase
      .addCase(createPhase.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPhase.fulfilled, (state, action) => {
        state.loading = false;
        state.phases.push(action.payload);
      })
      .addCase(createPhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePhase.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePhase.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPhase = action.payload;
        const index = state.phases.findIndex((phase) => phase.id === action.payload.id);
        if (index !== -1) {
          state.phases[index] = action.payload;
        }
      })
      .addCase(updatePhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // End Phase
      .addCase(endPhase.pending, (state) => {
        state.loading = true;
      })
      .addCase(endPhase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.phases.findIndex((phase) => phase.id === action.payload.id);
        if (index !== -1) {
          state.phases[index] = action.payload;
        }
      })
      .addCase(endPhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Phase
      .addCase(cancelPhase.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelPhase.fulfilled, (state, action) => {
        state.loading = false;
        state.phases = state.phases.filter((phase) => phase.id !== action.payload.id);
      })
      .addCase(cancelPhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Tasks and subtasks
      .addCase(getTasksOfProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTasksOfProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getTasksOfProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTasksOfPhase.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTasksOfPhase.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getTasksOfPhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTaskById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSubtasksOfTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSubtasksOfTask.fulfilled, (state, action) => {
        state.loading = false;
        state.subtasks = action.payload;
      })
      .addCase(getSubtasksOfTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTaskToPhase.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTaskToPhase.fulfilled, (state, action) => {
        state.loading = false;
        if(action.payload.parentTask){
          state.subtasks.push(action.payload);
        }else{
          state.tasks.push(action.payload);
        }
      })
      .addCase(addTaskToPhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTaskOfPhase.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTaskOfPhase.fulfilled, (state, action) => {
        state.loading = false;
        if(action.payload.parentTask){
          const index = state.subtasks.findIndex(
            (status) => status.id === action.payload.id
          );
          if (index !== -1) {
            state.subtasks[index] = action.payload;
          }
        }else{
          const index = state.tasks.findIndex(
            (status) => status.id === action.payload.id
          );
          if (index !== -1) {
            state.tasks[index] = action.payload;
          }
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTaskOfPhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelTaskOfPhase.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelTaskOfPhase.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(
          (status) => status.id !== action.payload.id
        );
      })
      .addCase(cancelTaskOfPhase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Task status
      .addCase(getAllTaskStatuses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllTaskStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.taskStatuses = action.payload;
      })
      .addCase(getAllTaskStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTaskStatus.fulfilled, (state, action) => {
        state.taskStatuses.push(action.payload);
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.taskStatuses.findIndex(
          (status) => status.id === action.payload.id
        );
        if (index !== -1) {
          state.taskStatuses[index] = action.payload;
        }
      })
      .addCase(deleteTaskStatus.fulfilled, (state, action) => {
        state.taskStatuses = state.taskStatuses.filter(
          (status) => status.id !== action.payload.id
        );
      });
  },
});

export default timelineSlice.reducer;

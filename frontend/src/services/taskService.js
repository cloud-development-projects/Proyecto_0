// services/taskService.js
import { apiService } from './apiService';

export const taskService = {
  async getTasks() {
    return await apiService.call('/tasks');
  },

  async createTask(taskData) {
    return await apiService.call('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        texto_tarea: taskData.texto_tarea,
        id_categoria: parseInt(taskData.id_categoria) || 1,
        fecha_finalizacion: taskData.fecha_finalizacion || null,
        id_estado: taskData.id_estado
      })
    });
  },

  async updateTaskStatus(taskId, statusId) {
    return await apiService.call(`/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ id_estado: statusId })
    });
  },

  async deleteTask(taskId) {
    return await apiService.call(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }
};
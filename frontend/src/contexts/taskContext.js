// contexts/TaskContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { categoryService } from '../services/categoryService';
import { useAuth } from './authContext';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getTasks(),
        categoryService.getCategories()
      ]);
      
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (error) {
      if (error.message === 'Token expired') {
        logout();
      } else {
        console.error('Failed to load data:', error);
        alert('Backend endpoints for tasks and categories not implemented yet');
      }
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      return { success: true };
    } catch (error) {
      if (error.message === 'Token expired') {
        logout();
      }
      return { success: false, error: error.message };
    }
  };

  const updateTaskStatus = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const newStatus = task.id_estado === 3 ? 1 : task.id_estado + 1;
      
      await taskService.updateTaskStatus(taskId, newStatus);
      
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            id_estado: newStatus,
            estado: { 
              descripcion: newStatus === 1 ? 'Sin Empezar' : newStatus === 2 ? 'Empezada' : 'Finalizada' 
            }
          };
        }
        return t;
      }));
      
      return { success: true };
    } catch (error) {
      if (error.message === 'Token expired') {
        logout();
      }
      return { success: false, error: error.message };
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return { success: true, category: newCategory };
    } catch (error) {
      if (error.message === 'Token expired') {
        logout();
      }
      return { success: false, error: error.message };
    }
  };

  const value = {
    tasks,
    categories,
    loading,
    addTask,
    updateTaskStatus,
    addCategory,
    loadData
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
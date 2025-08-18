// components/Dashboard/AddTaskModal.js
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTask } from '../../contexts/taskContext';
import CreateCategoryForm from './createCategoryForm';

const AddTaskModal = ({ onClose }) => {
  const { categories, addTask } = useTask();
  const [newTask, setNewTask] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState(1);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const taskData = {
      texto_tarea: newTask,
      id_categoria: parseInt(newTaskCategory) || 1,
      fecha_finalizacion: newTaskDueDate || null,
      id_estado: newTaskStatus
    };

    const result = await addTask(taskData);
    
    if (result.success) {
      handleClose();
    } else {
      alert('Error al crear tarea: ' + result.error);
    }
  };

  const handleClose = () => {
    setNewTask('');
    setNewTaskCategory('');
    setNewTaskDueDate('');
    setNewTaskStatus(1);
    setShowCreateCategory(false);
    onClose();
  };

  const handleCategoryCreated = (categoryId) => {
    setNewTaskCategory(categoryId.toString());
    setShowCreateCategory(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Tarea</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Descripción *</label>
            <textarea
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="¿Qué necesitas hacer?"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Fecha de vencimiento</label>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Categoría</label>
            <div className="space-y-3">
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={() => setShowCreateCategory(!showCreateCategory)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Crear nueva categoría</span>
              </button>

              {showCreateCategory && (
                <CreateCategoryForm
                  onCategoryCreated={handleCategoryCreated}
                  onCancel={() => setShowCreateCategory(false)}
                />
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Estado inicial</label>
            <select
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={1}>Sin Empezar</option>
              <option value={2}>Empezada</option>
              <option value={3}>Finalizada</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newTask.trim()}
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Crear Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
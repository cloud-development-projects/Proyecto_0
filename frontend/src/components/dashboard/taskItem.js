// components/Dashboard/TaskItem.js
import React from 'react';
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useTask } from '../../contexts/taskContext';

const TaskItem = ({ task }) => {
  const { updateTaskStatus } = useTask();

  const getStatusIcon = (estadoId) => {
    switch (estadoId) {
      case 1: return <Circle className="w-5 h-5 text-gray-400" />;
      case 2: return <Clock className="w-5 h-5 text-yellow-600" />;
      case 3: return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (estadoId) => {
    switch (estadoId) {
      case 1: return 'bg-gray-100 text-gray-700';
      case 2: return 'bg-yellow-100 text-yellow-700';
      case 3: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusToggle = async () => {
    const result = await updateTaskStatus(task.id);
    if (!result.success) {
      alert('Error al actualizar tarea: ' + result.error);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <button
            onClick={handleStatusToggle}
            className="mt-1 hover:scale-110 transition-transform"
          >
            {getStatusIcon(task.id_estado)}
          </button>
          
          <div className="flex-1">
            <h3 className={`text-lg font-medium ${
              task.id_estado === 3 ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.texto_tarea}
            </h3>
            
            <div className="flex items-center space-x-4 mt-3">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${task.categoria?.color}20`,
                  color: task.categoria?.color || '#6366f1'
                }}
              >
                {task.categoria?.nombre || 'Sin categoría'}
              </span>
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.id_estado)}`}>
                {task.estado?.descripcion || 'Sin estado'}
              </span>
            </div>
            
            <div className="flex items-center text-gray-500 text-sm mt-2">
              <Calendar className="w-4 h-4 mr-2" />
              Creada: {new Date(task.fecha_creacion).toLocaleDateString('es-ES')}
              {task.fecha_finalizacion && (
                <span className="ml-4">
                  Vence: {new Date(task.fecha_finalizacion).toLocaleDateString('es-ES')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
// components/Dashboard/TaskList.js
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTask } from '../../contexts/taskContext';
import TaskItem from './taskItem';

const TaskList = ({ selectedCategory, selectedStatus }) => {
  const { tasks } = useTask();

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = selectedCategory === 'all' || task.id_categoria === parseInt(selectedCategory);
    const statusMatch = selectedStatus === 'all' || task.id_estado === parseInt(selectedStatus);
    return categoryMatch && statusMatch;
  });

  return (
    <div className="lg:col-span-3">
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">¡Todo listo!</h3>
            <p className="text-gray-600">No hay tareas que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
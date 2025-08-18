// components/Dashboard/Header.js
import React from 'react';
import { Plus, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/authContext';
import { useTask } from '../../contexts/taskContext';

const Header = ({ onAddTask }) => {
  const { user, logout } = useAuth();
  const { tasks } = useTask();

  const pendingTasksCount = tasks.filter(t => t.id_estado !== 3).length;

  return (
    <div className="bg-white rounded-3xl p-6 mb-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Hola, {user?.nombre_usuario}!
            </h1>
            <p className="text-gray-600">
              Tienes {pendingTasksCount} tareas pendientes
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            REAL DATA
          </span>
          <button
            onClick={onAddTask}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Tarea</span>
          </button>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-2xl transition-all duration-300 transform hover:scale-105"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
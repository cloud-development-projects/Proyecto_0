// components/Dashboard/FilterSidebar.js
import React from 'react';
import { Filter } from 'lucide-react';
import { useTask } from '../../contexts/taskContext';

const FilterSidebar = ({ 
  selectedCategory, 
  selectedStatus, 
  onCategoryChange, 
  onStatusChange 
}) => {
  const { categories } = useTask();

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: '1', label: 'Sin Empezar' },
    { value: '2', label: 'En Progreso' },
    { value: '3', label: 'Completadas' }
  ];

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtros
        </h2>
        
        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-gray-700 mb-3 font-medium">Categorías</h3>
          <div className="space-y-2">
            <button
              onClick={() => onCategoryChange('all')}
              className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                selectedCategory === 'all' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id.toString())}
                className={`w-full text-left px-4 py-2 rounded-xl transition-all flex items-center ${
                  selectedCategory === cat.id.toString() 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-gray-700 mb-3 font-medium">Estado</h3>
          <div className="space-y-2">
            {statusOptions.map(status => (
              <button
                key={status.value}
                onClick={() => onStatusChange(status.value)}
                className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                  selectedStatus === status.value 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
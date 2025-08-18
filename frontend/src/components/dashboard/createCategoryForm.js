// components/Dashboard/CreateCategoryForm.js
import React, { useState } from 'react';
import { useTask } from '../../contexts/taskContext';

const CreateCategoryForm = ({ onCategoryCreated, onCancel }) => {
  const { addCategory } = useTask();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const categoryData = {
      nombre: newCategoryName,
      descripcion: newCategoryDescription
    };

    const result = await addCategory(categoryData);
    
    if (result.success) {
      onCategoryCreated(result.category.id);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } else {
      alert('Error al crear categoría: ' + result.error);
    }
  };

  const handleCancel = () => {
    setNewCategoryName('');
    setNewCategoryDescription('');
    onCancel();
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-gray-600 mb-1 text-sm">Nombre de categoría</label>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ej: Trabajo, Personal..."
            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1 text-sm">Descripción (opcional)</label>
          <input
            type="text"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            placeholder="Descripción de la categoría..."
            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={!newCategoryName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Crear
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategoryForm;
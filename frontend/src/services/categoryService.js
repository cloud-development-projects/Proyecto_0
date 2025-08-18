// services/categoryService.js
import { apiService } from './apiService';

export const categoryService = {
  async getCategories() {
    return await apiService.call('/categories');
  },

  async createCategory(categoryData) {
    return await apiService.call('/categories', {
      method: 'POST',
      body: JSON.stringify({
        nombre: categoryData.nombre,
        descripcion: categoryData.descripcion
      })
    });
  },

  async updateCategory(categoryId, categoryData) {
    return await apiService.call(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  },

  async deleteCategory(categoryId) {
    return await apiService.call(`/categories/${categoryId}`, {
      method: 'DELETE'
    });
  }
};
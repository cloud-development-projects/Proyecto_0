import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, User, Filter, CheckCircle2, Circle, Clock, LogOut, Eye, EyeOff, Trash2, Edit, X } from 'lucide-react';

const TodoApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [newTask, setNewTask] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState(1);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskData, setEditTaskData] = useState({ texto_tarea: '', id_categoria: '', fecha_finalizacion: '', id_estado: 1 });
  
  // New state for editing categories
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState({ nombre: '', descripcion: '' });

  // Sidebar categories - only categories used in tasks
  const sidebarCategories = useMemo(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) return [];
    
    const usedCategoryIds = [...new Set(
      tasks
        .filter(task => task.id_categoria !== null && task.id_categoria !== undefined)
        .map(task => task.id_categoria)
    )];
    
    return Array.isArray(categories) 
      ? categories.filter(cat => usedCategoryIds.includes(cat.id))
      : [];
  }, [tasks, categories]);

  // Modal categories - all available categories
  const taskModalCategories = useMemo(() => {
    return Array.isArray(categories) ? categories : [];
  }, [categories]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'all' && sidebarCategories.length > 0) {
      const categoryExists = sidebarCategories.some(cat => cat.id.toString() === selectedCategory);
      if (!categoryExists) {
        setSelectedCategory('all');
      }
    }
  }, [sidebarCategories, selectedCategory]);

  const API_BASE = 'http://localhost:8080/api';

  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      if (response.status === 401) {
        logout();
        throw new Error('Token expired');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Credenciales inválidas');
      }

      const data = await response.json();
      const userInfo = parseJWTPayload(data.token);

      const userData = {
        id: userInfo.uid || data.id,
        nombre_usuario: userInfo.username || data.username,
        imagen_perfil: data.profile_img
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      loadData();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerData.username,
          password: registerData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error al registrar usuario (${response.status})`);
      }

      alert('Usuario registrado exitosamente. Por favor inicia sesión.');
      setShowLogin(true);
      setRegisterData({ username: '', password: '', confirmPassword: '' });
    } catch (error) {
      alert('Error en registro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const parseJWTPayload = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return {};
    }
  };

  const logout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(console.error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setTasks([]);
    setCategories([]);
  };

  const loadData = async () => {
    try {
      const [tasksData, categoriesData] = await Promise.all([
        apiCall('/protected/tasks'),
        apiCall('/protected/categories')
      ]);

      let tasksArray = Array.isArray(tasksData) ? tasksData : 
                      Array.isArray(tasksData?.tasks) ? tasksData.tasks : [];
      
      let categoriesArray = Array.isArray(categoriesData) ? categoriesData : 
                           Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
      
      // Map categories
      categoriesArray = categoriesArray.map(cat => ({
        id: cat.id,
        nombre: cat.name || cat.nombre,
        descripcion: cat.description || cat.descripcion,
        color: cat.color || '#6366f1'
      }));

      // Map tasks
      tasksArray = tasksArray.map(task => ({
        id: task.id,
        texto_tarea: task.task_text || task.texto_tarea,
        id_categoria: task.category_id !== undefined ? task.category_id : 
                     task.category?.id !== undefined ? task.category.id : task.id_categoria,
        id_estado: task.state_id !== undefined ? task.state_id : 
                  task.state?.id !== undefined ? task.state.id : task.id_estado,
        fecha_creacion: task.creation_date || task.fecha_creacion,
        fecha_finalizacion: task.end_date || task.fecha_finalizacion,
        categoria: task.category ? {
          id: task.category.id,
          nombre: task.category.name,
          descripcion: task.category.description,
          color: task.category.color || '#6366f1'
        } : null,
        estado: task.state ? {
          id: task.state.id,
          descripcion: task.state.description === 'Not Started' ? 'Sin Empezar' :
                      task.state.description === 'Started' ? 'En Progreso' :
                      task.state.description === 'Finished' ? 'Completada' : task.state.description
        } : null
      }));
      
      setTasks(tasksArray);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to load data:', error);
      if (!error.message.includes('Token expired')) {
        alert('Error al cargar datos: ' + error.message);
      }
    }
  };

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

  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    const categoryMatch = selectedCategory === 'all' || task.id_categoria === parseInt(selectedCategory);
    const statusMatch = selectedStatus === 'all' || task.id_estado === parseInt(selectedStatus);
    return categoryMatch && statusMatch;
  }) : [];

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        let formattedEndDate = null;
        if (newTaskDueDate) {
          const date = new Date(newTaskDueDate);
          if (!isNaN(date.getTime())) {
            formattedEndDate = date.toISOString().split('T')[0];
          }
        }
        
        const taskData = {
          task_text: newTask,
          category_id: newTaskCategory && newTaskCategory !== '' ? parseInt(newTaskCategory) : null,
          end_date: formattedEndDate,
          state_id: newTaskStatus
        };
        
        await apiCall('/protected/tasks', {
          method: 'POST',
          body: JSON.stringify(taskData)
        });
        
        await loadData();
        
        setNewTask('');
        setNewTaskCategory('');
        setNewTaskDueDate('');
        setNewTaskStatus(1);
        setShowAddTask(false);
      } catch (error) {
        console.error('Error creating task:', error);
        alert('Error al crear tarea: ' + error.message);
      }
    }
  };

  const updateTask = async () => {
    if (editTaskData.texto_tarea.trim() && editingTask) {
      try {
        let formattedEndDate = null;
        if (editTaskData.fecha_finalizacion) {
          const date = new Date(editTaskData.fecha_finalizacion);
          if (!isNaN(date.getTime())) {
            formattedEndDate = date.toISOString().split('T')[0];
          }
        }
        
        const taskData = {
          task_text: editTaskData.texto_tarea,
          category_id: parseInt(editTaskData.id_categoria) || null,
          end_date: formattedEndDate,
          state_id: editTaskData.id_estado
        };
        
        await apiCall(`/protected/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify(taskData)
        });
        
        await loadData();
        
        setEditingTask(null);
        setEditTaskData({ texto_tarea: '', id_categoria: '', fecha_finalizacion: '', id_estado: 1 });
      } catch (error) {
        alert('Error al actualizar tarea: ' + error.message);
      }
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await apiCall(`/protected/tasks/${taskId}`, {
          method: 'DELETE'
        });
        
        setTasks(Array.isArray(tasks) ? tasks.filter(t => t.id !== taskId) : []);
      } catch (error) {
        alert('Error al eliminar tarea: ' + error.message);
      }
    }
  };

  const createCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const categoryData = {
          name: newCategoryName,
          description: newCategoryDescription
        };
        
        const response = await apiCall('/protected/categories', {
          method: 'POST',
          body: JSON.stringify(categoryData)
        });
        
        const newCategory = response.category || response;
        const mappedCategory = {
          id: newCategory.id,
          nombre: newCategory.name || newCategory.nombre,
          descripcion: newCategory.description || newCategory.descripcion,
          color: newCategory.color || '#6366f1'
        };
        
        const updatedCategories = Array.isArray(categories) ? [...categories, mappedCategory] : [mappedCategory];
        setCategories(updatedCategories);
        
        setNewTaskCategory(mappedCategory.id.toString());
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowCreateCategory(false);
      } catch (error) {
        console.error('Error creating category:', error);
        alert('Error al crear categoría: ' + error.message);
      }
    }
  };

  // New function to update category
  const updateCategory = async () => {
    if (editCategoryData.nombre.trim() && editingCategory) {
      try {
        const categoryData = {
          name: editCategoryData.nombre,
          description: editCategoryData.descripcion
        };
        
        await apiCall(`/protected/categories/${editingCategory.id}`, {
          method: 'PUT',
          body: JSON.stringify(categoryData)
        });
        
        await loadData();
        
        setEditingCategory(null);
        setEditCategoryData({ nombre: '', descripcion: '' });
      } catch (error) {
        alert('Error al actualizar categoría: ' + error.message);
      }
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Las tareas asociadas quedarán sin categoría.')) {
      try {
        await apiCall(`/protected/categories/${categoryId}`, {
          method: 'DELETE'
        });
        
        setCategories(Array.isArray(categories) ? categories.filter(c => c.id !== categoryId) : []);
        
        setTasks(Array.isArray(tasks) ? tasks.map(task => 
          task.id_categoria === categoryId 
            ? { ...task, id_categoria: null, categoria: null }
            : task
        ) : []);
      } catch (error) {
        alert('Error al eliminar categoría: ' + error.message);
      }
    }
  };

  // New function to start editing category
  const startEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryData({
      nombre: category.nombre,
      descripcion: category.descripcion || ''
    });
  };

  const toggleTaskStatus = async (taskId) => {
    try {
      const task = Array.isArray(tasks) ? tasks.find(t => t.id === taskId) : null;
      if (!task) {
        alert('Tarea no encontrada');
        return;
      }
      
      const newStatus = task.id_estado === 3 ? 1 : task.id_estado + 1;
      
      let formattedEndDate = null;
      if (task.fecha_finalizacion) {
        const date = new Date(task.fecha_finalizacion);
        if (!isNaN(date.getTime())) {
          formattedEndDate = date.toISOString().split('T')[0];
        }
      }
      
      await apiCall(`/protected/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          task_text: task.texto_tarea,
          category_id: task.id_categoria,
          end_date: formattedEndDate,
          state_id: newStatus
        })
      });

      setTasks(Array.isArray(tasks) ? tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            id_estado: newStatus,
            estado: { 
              id: newStatus,
              descripcion: newStatus === 1 ? 'Sin Empezar' : newStatus === 2 ? 'En Progreso' : 'Completada' 
            }
          };
        }
        return t;
      }) : []);
    } catch (error) {
      alert('Error al actualizar tarea: ' + error.message);
    }
  };

  const isTaskOverdue = (task) => {
    if (!task.fecha_finalizacion || task.id_estado === 3) return false;
    const today = new Date();
    const dueDate = new Date(task.fecha_finalizacion);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    
    let formattedDate = '';
    if (task.fecha_finalizacion) {
      const date = new Date(task.fecha_finalizacion);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }
    
    setEditTaskData({
      texto_tarea: task.texto_tarea,
      id_categoria: task.id_categoria?.toString() || '',
      fecha_finalizacion: formattedDate,
      id_estado: task.id_estado
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {showLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className="text-gray-600">
              {showLogin ? 'Ingresa tus credenciales' : 'Regístrate para comenzar'}
            </p>
          </div>

          {showLogin ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Usuario</label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Tu nombre de usuario"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                onClick={login}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 font-medium"
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Usuario</label>
                <input
                  type="text"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Elige un nombre de usuario"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Crea una contraseña"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirma tu contraseña"
                />
              </div>
              <button
                onClick={register}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 font-medium"
              >
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {showLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 mb-6 border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={user.imagen_perfil}
                alt={user.nombre_usuario}
                className="w-10 h-10 rounded-full"
              />

              <div>
                <h1 className="text-2xl font-bold text-gray-900">¡Hola, {user?.nombre_usuario}!</h1>
                <p className="text-gray-600">Tienes {Array.isArray(filteredTasks) ? filteredTasks.filter(t => t.id_estado !== 3).length : 0} tareas pendientes</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddTask(true)}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
              </h2>
              
              {/* Category Filter */}
              {sidebarCategories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-gray-700 mb-3 font-medium">Categorías</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                        selectedCategory === 'all' 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Todas
                    </button>
                    {sidebarCategories.map(cat => (
                      <div key={cat.id} className="flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedCategory(cat.id.toString())}
                          className={`flex-1 text-left px-4 py-2 rounded-xl transition-all flex items-center ${
                            selectedCategory === cat.id.toString() 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: cat.color || '#6366f1' }}
                          />
                          {cat.nombre}
                        </button>
                        <button
                          onClick={() => startEditCategory(cat)}
                          className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                          title="Editar categoría"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Filter */}
              <div>
                <h3 className="text-gray-700 mb-3 font-medium">Estado</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Todos' },
                    { value: '1', label: 'Sin Empezar' },
                    { value: '2', label: 'En Progreso' },
                    { value: '3', label: 'Completadas' }
                  ].map(status => (
                    <button
                      key={status.value}
                      onClick={() => setSelectedStatus(status.value)}
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

              {/* New user message */}
              {Array.isArray(tasks) && tasks.length === 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-blue-700 text-sm">
                    ¡Bienvenido! Crea tu primera tarea para comenzar a organizar tu día.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-3">
            {/* Active Filters - Compact Display */}
            {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-700">
                    {selectedCategory !== 'all' && (
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sidebarCategories.find(cat => cat.id.toString() === selectedCategory)?.color || '#6366f1' }}
                        />
                        <span>
                          {sidebarCategories.find(cat => cat.id.toString() === selectedCategory)?.nombre || 'Categoría desconocida'}
                        </span>
                        {sidebarCategories.find(cat => cat.id.toString() === selectedCategory)?.descripcion && (
                          <span className="text-gray-500">
                            - {sidebarCategories.find(cat => cat.id.toString() === selectedCategory).descripcion}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {selectedStatus !== 'all' && (
                      <span className="text-gray-600">
                        {selectedStatus === '1' ? 'Sin Empezar' :
                         selectedStatus === '2' ? 'En Progreso' :
                         selectedStatus === '3' ? 'Completadas' : 'Estado desconocido'}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {Array.isArray(filteredTasks) && filteredTasks.map(task => {
                const isOverdue = isTaskOverdue(task);
                return (
                <div 
                  key={task.id} 
                  className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-1 hover:scale-110 transition-transform"
                      >
                        {getStatusIcon(task.id_estado)}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-lg font-medium ${task.id_estado === 3 ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.texto_tarea}
                          </h3>
                          {isOverdue && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              VENCIDA
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{ 
                              backgroundColor: `${task.categoria?.color || '#6366f1'}20`,
                              color: task.categoria?.color || '#6366f1'
                            }}
                          >
                            {task.categoria?.nombre || 'Sin categoría'}
                          </span>
                          
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.id_estado)}`}>
                            {task.estado?.descripcion || 
                             (task.id_estado === 1 ? 'Sin Empezar' : 
                              task.id_estado === 2 ? 'En Progreso' : 
                              task.id_estado === 3 ? 'Completada' : 'Sin estado')}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm mt-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          Creada: {task.fecha_creacion ? task.fecha_creacion.split("T")[0] : "Fecha no disponible"}
                          {task.fecha_finalizacion && (
                            <span className={`ml-4 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                              Vence: {task.fecha_finalizacion.split("T")[0]}
                              {isOverdue && " ⚠️"}
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => startEditTask(task)}
                        className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                        title="Editar tarea"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )})}

              {(!Array.isArray(filteredTasks) || filteredTasks.length === 0) && (
                <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-lg text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {!Array.isArray(tasks) ? '¡Cargando...' : '¡Todo listo!'}
                  </h3>
                  <p className="text-gray-600">
                    {!Array.isArray(tasks) 
                      ? 'Cargando tus tareas...' 
                      : 'No hay tareas que coincidan con los filtros seleccionados.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Tarea</h2>
            
            <div className="space-y-6">
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

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Fecha de vencimiento</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Categoría</label>
                <div className="space-y-3">
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {taskModalCategories.map(cat => (
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
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                      <div>
                        <label className="block text-gray-600 mb-1 text-sm">Nombre de categoría</label>
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Ej: Trabajo, Personal..."
                          className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                          type="button"
                          onClick={createCategory}
                          disabled={!newCategoryName.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Crear
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateCategory(false);
                            setNewCategoryName('');
                            setNewCategoryDescription('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setNewTask('');
                  setNewTaskCategory('');
                  setNewTaskDueDate('');
                  setNewTaskStatus(1);
                  setShowCreateCategory(false);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={addTask}
                disabled={!newTask.trim()}
                className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Editar Tarea</h2>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setEditTaskData({ texto_tarea: '', id_categoria: '', fecha_finalizacion: '', id_estado: 1 });
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Descripción *</label>
                <textarea
                  value={editTaskData.texto_tarea}
                  onChange={(e) => setEditTaskData({...editTaskData, texto_tarea: e.target.value})}
                  placeholder="¿Qué necesitas hacer?"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Fecha de vencimiento</label>
                <input
                  type="date"
                  value={editTaskData.fecha_finalizacion}
                  onChange={(e) => setEditTaskData({...editTaskData, fecha_finalizacion: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Categoría</label>
                <select
                  value={editTaskData.id_categoria}
                  onChange={(e) => setEditTaskData({...editTaskData, id_categoria: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoría</option>
                  {taskModalCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Estado</label>
                <select
                  value={editTaskData.id_estado}
                  onChange={(e) => setEditTaskData({...editTaskData, id_estado: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={1}>Sin Empezar</option>
                  <option value={2}>En Progreso</option>
                  <option value={3}>Completada</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setEditingTask(null);
                  setEditTaskData({ texto_tarea: '', id_categoria: '', fecha_finalizacion: '', id_estado: 1 });
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={updateTask}
                disabled={!editTaskData.texto_tarea.trim()}
                className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Editar Categoría</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setEditCategoryData({ nombre: '', descripcion: '' });
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Nombre *</label>
                <input
                  type="text"
                  value={editCategoryData.nombre}
                  onChange={(e) => setEditCategoryData({...editCategoryData, nombre: e.target.value})}
                  placeholder="Nombre de la categoría"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Descripción</label>
                <textarea
                  value={editCategoryData.descripcion}
                  onChange={(e) => setEditCategoryData({...editCategoryData, descripcion: e.target.value})}
                  placeholder="Descripción de la categoría (opcional)"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setEditCategoryData({ nombre: '', descripcion: '' });
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={updateCategory}
                disabled={!editCategoryData.nombre.trim()}
                className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoApp;
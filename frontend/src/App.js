import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, Filter, CheckCircle2, Circle, Clock, LogOut, Eye, EyeOff } from 'lucide-react';

const TodoApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Enable auth
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' }); // Changed field names
  const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '' }); // Changed field names
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
      
      const loadInitialData = async () => {
        try {
          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          };

          const [tasksResponse, categoriesResponse] = await Promise.all([
            fetch('http://localhost:8080/api/tasks', config),
            fetch('http://localhost:8080/api/categories', config)
          ]);

          if (tasksResponse.status === 401 || categoriesResponse.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
            return;
          }

          const tasksData = await tasksResponse.json();
          const categoriesData = await categoriesResponse.json();
          
          setTasks(tasksData);
          setCategories(categoriesData);
        } catch (error) {
          console.error('Failed to load data:', error);
          alert('Backend endpoints for tasks and categories not implemented yet');
        }
      };
      
      loadInitialData();
    }
  }, []); 

  // API base URL  
  const API_BASE = 'http://localhost:8080/api'; // Moved to apiCall function

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
          username: loginData.username, // Using correct field names
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
        id: userInfo.uid,
        nombre_usuario: userInfo.username,
        imagen_perfil: null
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      loadData(); // Load real data from backend
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
          username: registerData.username, // Using correct field names
          password: registerData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al registrar usuario');
      }

      // Registration successful
      alert('Usuario registrado exitosamente. Por favor inicia sesión.');
      setShowLogin(true);
      setRegisterData({ username: '', password: '', confirmPassword: '' });
    } catch (error) {
      alert(error.message);
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
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const [tasksResponse, categoriesResponse] = await Promise.all([
        fetch('http://localhost:8080/api/tasks', config),
        fetch('http://localhost:8080/api/categories', config)
      ]);

      if (tasksResponse.status === 401 || categoriesResponse.status === 401) {
        logout();
        return;
      }

      const tasksData = await tasksResponse.json();
      const categoriesData = await categoriesResponse.json();
      
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Backend endpoints for tasks and categories not implemented yet');
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

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = selectedCategory === 'all' || task.id_categoria === parseInt(selectedCategory);
    const statusMatch = selectedStatus === 'all' || task.id_estado === parseInt(selectedStatus);
    return categoryMatch && statusMatch;
  });

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const token = localStorage.getItem('token');
        const taskData = {
          texto_tarea: newTask,
          id_categoria: parseInt(newTaskCategory) || 1,
          fecha_finalizacion: newTaskDueDate || null,
          id_estado: newTaskStatus
        };
        
        const response = await fetch('http://localhost:8080/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error creating task');
        }
        
        const newTaskResponse = await response.json();
        setTasks([...tasks, newTaskResponse]);
        
        setNewTask('');
        setNewTaskCategory('');
        setNewTaskDueDate('');
        setNewTaskStatus(1);
        setShowAddTask(false);
      } catch (error) {
        alert('Error al crear tarea: ' + error.message);
      }
    }
  };

  const createCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const token = localStorage.getItem('token');
        const categoryData = {
          nombre: newCategoryName,
          descripcion: newCategoryDescription
        };
        
        const response = await fetch('http://localhost:8080/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(categoryData)
        });

        if (response.status === 401) {
          logout();
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error creating category');
        }
        
        const newCategoryResponse = await response.json();
        setCategories([...categories, newCategoryResponse]);
        
        setNewTaskCategory(newCategoryResponse.id.toString());
        
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowCreateCategory(false);
      } catch (error) {
        alert('Error al crear categoría: ' + error.message);
      }
    }
  };

  const toggleTaskStatus = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const task = tasks.find(t => t.id === taskId);
      const newStatus = task.id_estado === 3 ? 1 : task.id_estado + 1;
      
      const response = await fetch(`http://localhost:8080/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_estado: newStatus })
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error updating task');
      }

      setTasks(tasks.map(t => {
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
    } catch (error) {
      alert('Error al actualizar tarea: ' + error.message);
    }
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
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">¡Hola, {user?.nombre_usuario}!</h1>
                <p className="text-gray-600">Tienes {filteredTasks.filter(t => t.id_estado !== 3).length} tareas pendientes</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                REAL DATA
              </span>
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
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id.toString())}
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
            </div>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <div 
                  key={task.id} 
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
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
                        <h3 className={`text-lg font-medium ${task.id_estado === 3 ? 'line-through text-gray-500' : 'text-gray-900'}`}>
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
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Tarea</h2>
            
            <div className="space-y-6">
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

                  {/* Create Category Form */}
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
            </div>
            
            {/* Action Buttons */}
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
    </div>
  );
};

export default TodoApp;

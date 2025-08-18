// components/Auth/RegisterForm.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/authContext';

const RegisterForm = () => {
  const { register, loading } = useAuth();
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(registerData);
    
    if (result.success) {
      alert('Usuario registrado exitosamente. Por favor inicia sesión.');
      setRegisterData({ username: '', password: '', confirmPassword: '' });
    } else {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-2">Usuario</label>
        <input
          type="text"
          value={registerData.username}
          onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Elige un nombre de usuario"
          required
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
          required
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
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 font-medium"
      >
        {loading ? 'Registrando...' : 'Crear Cuenta'}
      </button>
    </form>
  );
};

export default RegisterForm;
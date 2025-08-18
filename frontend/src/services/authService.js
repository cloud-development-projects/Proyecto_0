// services/authService.js - DEBUG VERSION
import { apiService } from './apiService';

const parseJWTPayload = (token) => {
  console.log('🔍 Parsing JWT token:', token?.substring(0, 50) + '...');
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const parsed = JSON.parse(jsonPayload);
    console.log('✅ JWT payload parsed:', parsed);
    return parsed;
  } catch (error) {
    console.error('❌ Error parsing JWT:', error);
    return {};
  }
};

export const authService = {
  async login(credentials) {
    console.log('🌐 Making login request to backend...');
    console.log('📤 Request payload:', credentials);
    
    const response = await fetch(`${apiService.API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      })
    });

    console.log('📥 Backend response status:', response.status);
    console.log('📥 Backend response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend error response:', errorData);
      throw new Error(errorData.error || 'Credenciales inválidas');
    }

    const data = await response.json();
    console.log('🎉 Backend success response:', data);
    
    // Check what the backend actually returns
    if (!data.token) {
      console.error('❌ No token in response!', data);
      throw new Error('No token received from server');
    }
    
    const userInfo = parseJWTPayload(data.token);
    
    // Check if JWT parsing worked
    if (!userInfo.uid && !userInfo.username) {
      console.error('❌ Failed to extract user info from JWT:', userInfo);
      console.log('🔍 Raw JWT payload structure:', userInfo);
      
      // Fallback: try to use response data directly if available
      const userData = {
        id: data.user?.id || data.id || 1,
        nombre_usuario: data.user?.username || data.username || credentials.username,
        imagen_perfil: null
      };
      console.log('🔧 Using fallback userData:', userData);
      return { token: data.token, user: userData };
    }
    
    const userData = {
      id: userInfo.uid || userInfo.id || userInfo.user_id,
      nombre_usuario: userInfo.username || userInfo.nombre_usuario,
      imagen_perfil: null
    };

    console.log('👤 Final user data:', userData);
    return { token: data.token, user: userData };
  },

  async register(userData) {
    console.log('🌐 Making register request to backend...');
    console.log('📤 Request payload:', { username: userData.username, password: '[REDACTED]' });
    
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    const response = await fetch(`${apiService.API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        password: userData.password
      })
    });

    console.log('📥 Register response status:', response.status);
    console.log('📥 Register response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Register error response:', errorData);
      throw new Error(errorData.error || 'Error al registrar usuario');
    }

    const result = await response.json();
    console.log('✅ Register success response:', result);
    return result;
  },

  async logout() {
    console.log('🌐 Making logout request to backend...');
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${apiService.API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('📥 Logout response status:', response.status);
      } catch (error) {
        console.error('❌ Logout error:', error);
      }
    }
  }
};
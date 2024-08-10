import axios from 'axios';

export const checkAuth = async () => {
  try {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token) {
      return { isAuthenticated: false, userId: null };
    }
    
    const response = await axios.get('/checkAuth', {
      headers: {
        Authorization: token,
        'x-refresh-token': refreshToken
      }
    });
    if (response.data.token && response.data.refreshToken) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return {
      isAuthenticated: response.data.isAuthenticated,
      userId: response.data.userId
    };
  } catch (error) {
    return { isAuthenticated: false, userId: null };
  }
};

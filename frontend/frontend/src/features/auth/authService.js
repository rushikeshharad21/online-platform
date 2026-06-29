import apiClient from '../../utils/apiClient';

// LOGIN
const login = async (userData) => {
  const response = await apiClient.post('/auth/login', userData);

  const data = response?.data;

  if (!data) {
    throw new Error("Invalid response from server.");
  }

  const token = data.token || data.accessToken;

  if (!token) {
    throw new Error("No token received from server.");
  }

  const userToStore = {
    ...data,
    token,
  };

  localStorage.setItem('user', JSON.stringify(userToStore));

  return userToStore;
};

// REGISTER
const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);

  const data = response?.data;

  if (!data) {
    throw new Error("Invalid response from server.");
  }

  const token = data.token || data.accessToken;

  if (token) {
    localStorage.setItem(
      'user',
      JSON.stringify({ ...data, token })
    );
  }

  return data;
};

// LOGOUT
const logout = () => {
  localStorage.removeItem('user');
};

const authService = { register, login, logout };

export default authService;
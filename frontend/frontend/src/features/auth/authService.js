import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });

  // रिस्पॉन्समध्ये डेटा आहे का हे तपासा
  if (response.data) {
    // 🟢 'Expert' बदल: टोकनची खात्री करा. 
    // बॅकएंड रिस्पॉन्समध्ये टोकन कोणत्या नावाने आहे (token/accessToken/jwt) 
    // ते ओळखून ते वेगळे काढून सेव्ह करा.
    const token = response.data.token || response.data.accessToken;

    if (token) {
      // पूर्ण युजर ऑब्जेक्टमध्ये 'token' की जोडणे अत्यंत आवश्यक आहे
      const userToStore = { ...response.data, token };
      localStorage.setItem('user', JSON.stringify(userToStore));
      return userToStore;
    } else {
      // जर टोकनच नसेल तर ही मोठी त्रुटी आहे
      console.error("Login Error: टोकन रिस्पॉन्समध्ये सापडले नाही.");
      throw new Error("No token received from server.");
    }
  }
};

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });

  if (response.data) {
    const token = response.data.token || response.data.accessToken;
    if (token) {
      localStorage.setItem('user', JSON.stringify({ ...response.data, token }));
    }
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const authService = { register, login, logout };
export default authService;
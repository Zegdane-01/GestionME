export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('userData');
  return !!token && !!userData;
};
export const login = (token, userData) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('userData', JSON.stringify(userData));
};
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  window.location.href = '/login'; // Adaptez selon votre route de login
};
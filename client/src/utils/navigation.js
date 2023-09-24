export const renderLink = (link, token, role) => {
  if ((link.path === '/signup' && token) || (link.path === '/login' && token)) {
    return false;
  } else if (link.path === '/account') {
    return token;
  } else if (link.path === '/schedule') {
    return token && role === 'admin';
  }
  return true;
};

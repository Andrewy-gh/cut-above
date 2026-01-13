export const renderLink = (link, user, role) => {
  if ((link.path === '/signup' && user) || (link.path === '/login' && user)) {
    return false;
  } else if (link.path === '/account') {
    return user;
  } else if (link.path === '/addschedule' || link.path === '/dashboard') {
    return user && role === 'admin';
  }
  return true;
};

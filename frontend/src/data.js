import haircut from './assets/images/hair-spies-ClilMdu189E-unsplash.jpg';
import beard from './assets/images/allef-vinicius-IvQeAVeJULw-unsplash.jpg';
import shave from './assets/images/christoffer-engstrom-1ouGlRChSbY-unsplash.jpg';

export const links = [
  { id: 1, name: 'Home', path: '/' },
  { id: 2, name: 'Booking', path: '/reserve' },
  { id: 3, name: 'Add Schedule', path: '/add' },
  { id: 4, name: 'Register', path: '/register' },
  { id: 5, name: 'Login', path: '/login', loggedIn: false },
  { id: 6, name: 'Profile', path: '/profile' },
  { id: 7, name: 'Schedule', path: '/schedule' },
];

export const services = [
  {
    id: 1,
    name: 'Haircut',
    image: haircut,
    description: `Experience the best in men's grooming with our expert haircut service. Our skilled barbers will give you a precision cut that is tailored to your unique style and preferences. Come visit us and leave feeling confident and refreshed!`,
  },
  {
    id: 2,
    name: 'Beard Trim',
    image: beard,
    description: `Transform your look with our professional beard trim service. Our experienced barbers will help you achieve the perfect style for your beard, whether you want a classic or modern look. Come visit us and leave with a fresh and polished look that is sure to turn heads.`,
  },
  {
    id: 3,
    name: 'Straight Razor Shave',
    image: shave,
    description: `Experience the ultimate in relaxation and grooming with our professional shave service. We take the time to ensure that your skin is properly prepared and moisturized, leaving you feeling refreshed and rejuvenated. Come visit us and indulge in the ultimate shave experience.`,
  },
];

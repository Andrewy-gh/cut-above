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
  { id: 8, name: 'Appointments', path: '/appointments' },
];

export const roles = [
  { id: 1, title: 'Client', data: 'client' },
  { id: 2, title: 'Employee', data: 'employee' },
  { id: 3, title: 'Admin', data: 'admin' },
];

export const services = [
  {
    id: 1,
    name: 'Haircut',
    image: haircut,
    duration: 30,
    description: `Experience the best in men's grooming with our expert haircut service. Our skilled barbers will give you a precision cut that is tailored to your unique style and preferences. Come visit us and leave feeling confident and refreshed!`,
  },
  {
    id: 2,
    name: 'Beard Trim',
    image: beard,
    duration: 15,
    description: `Transform your look with our professional beard trim service. Our experienced barbers will help you achieve the perfect style for your beard, whether you want a classic or modern look. Come visit us and leave with a fresh and polished look that is sure to turn heads.`,
  },
  {
    id: 3,
    name: 'Straight Razor Shave',
    image: shave,
    duration: 15,
    description: `Experience the ultimate in relaxation and grooming with our professional shave service. We take the time to ensure that your skin is properly prepared and moisturized, leaving you feeling refreshed and rejuvenated. Come visit us and indulge in the ultimate shave experience.`,
  },
  {
    id: 4,
    name: 'Cut and Shave Package',
    image: beard,
    duration: 45,
    description: `Experience our haircut and beard grooming package. A precision haircut and the option for a beard trim or full shave. You'll leave feeling like a new man, with a fresh and polished appearance that enhances your natural good looks.`,
  },
  {
    id: 5,
    name: 'The Full Package',
    image: beard,
    duration: 60,
    description: `Our full package service is the ultimate indulgence in grooming. Our skilled barbers will provide you with a precision haircut, a beard trim or full shave, and a soothing shoulder massage to help you relax and unwind. You'll leave feeling like a VIP with the confidence to take on the world. `,
  },
];

import haircut from '../assets/images/haircut.webp';
import beard from '../assets/images/beard.webp';
import shave from '../assets/images/shave.webp';

export const navigation = [
  { id: 1, name: 'Home', path: '/' },
  { id: 2, name: 'Booking', path: '/bookings' },
  { id: 3, name: 'Sign Up', path: '/signup' },
  { id: 4, name: 'Login', path: '/login' },
  { id: 5, name: 'Account', path: '/account' },
  { id: 6, name: 'Dashboard', path: '/dashboard' },
];

export const services = [
  {
    id: 1,
    name: 'Haircut',
    duration: 30,
    image: haircut,
    description: `Our skilled barbers will give you a precision cut that is tailored to your unique style and preferences. Come visit us and leave feeling confident and refreshed!`,
  },
  {
    id: 2,
    name: 'Beard Trim',
    duration: 15,
    image: beard,
    description: `Transform your look with our professional beard trim service. Our experienced barbers will help you achieve the perfect style for your beard, whether you want a classic or modern look.`,
  },
  {
    id: 3,
    name: 'Straight Razor Shave',
    duration: 15,
    image: shave,
    description: `We take the time to ensure that your skin is properly prepared and moisturized, leaving you feeling refreshed and rejuvenated.`,
  },
  {
    id: 4,
    name: 'Cut and Shave Package',
    duration: 45,
    image: haircut,
    description: `A precision haircut and the option for a beard trim or full shave. You'll leave feeling like a new man, with a fresh and polished appearance that enhances your natural good looks.`,
  },
  {
    id: 5,
    name: 'The Full Package',
    duration: 60,
    image: beard,
    description: `Our full package service is the ultimate indulgence in grooming. Our skilled barbers will provide you with a precision haircut, a beard trim or full shave, and a soothing shoulder massage to help you relax and unwind. You'll leave feeling like a VIP with the confidence to take on the world. `,
  },
];

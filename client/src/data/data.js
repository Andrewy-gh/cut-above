import haircut from '../assets/images/haircut.webp';
import beard from '../assets/images/beard.webp';
import shave from '../assets/images/shave.webp';
import andre from '../assets/images/andre.webp';
import obi from '../assets/images/obi.webp';
import salah from '../assets/images/salah.webp';

export const navigation = [
  { id: 1, name: 'Home', path: '/' },
  { id: 2, name: 'Booking', path: '/bookings' },
  { id: 3, name: 'Sign Up', path: '/signup' },
  { id: 4, name: 'Login', path: '/login' },
  { id: 5, name: 'Account', path: '/account' },
  { id: 6, name: 'Schedule', path: '/schedule' },
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

export const employees = [
  {
    id: '64a60e878bdf8a4ac0f98209',
    firstName: 'Andre',
    image: andre,
    profile:
      'Andre has honed his skills and techniques to deliver top-notch grooming services. In his free time, Andre enjoys exploring the outdoors and staying active. He loves hiking, running, and playing sports, and is always up for a new adventure.',
  },
  {
    id: '64a60f1a8bdf8a4ac0f98210',
    firstName: 'Obi',
    image: obi,
    profile:
      'Meet Obi, our skilled and talented barber who is dedicated to providing his clients with top-notch grooming services. He loves to travel and discover new cultures, and is always planning his next adventure. ',
  },
  {
    id: '64a60fcec756d17d2dea4592',
    firstName: 'Salah',
    image: salah,
    profile:
      'With a natural talent for hair cutting and styling, Salah takes pride in helping his clients achieve the perfect look. In his free time, Salah enjoys painting and drawing, and is always attending concerts.  He is a big fan of classic rock and jazz.',
  },
];

import andre from '@/assets/images/andre.webp';
import obi from '@/assets/images/obi.webp';
import salah from '@/assets/images/salah.webp';
import type { EmployeeProfile } from '@/types';

export const teamMembers: EmployeeProfile[] = [
  {
    id: 'andre',
    firstName: 'Andre',
    image: andre,
    profile:
      'Andre has honed his skills and techniques to deliver top-notch grooming services. In his free time, Andre enjoys exploring the outdoors and staying active. He loves hiking, running, and playing sports, and is always up for a new adventure.',
  },
  {
    id: 'obi',
    firstName: 'Obi',
    image: obi,
    profile:
      'Meet Obi, our skilled and talented barber who is dedicated to providing clients with top-notch grooming services. He loves to travel and discover new cultures, and is always planning his next adventure.',
  },
  {
    id: 'salah',
    firstName: 'Salah',
    image: salah,
    profile:
      'With a natural talent for hair cutting and styling, Salah takes pride in helping clients achieve the perfect look. In his free time, Salah enjoys painting and drawing, and is always attending concerts. He is a big fan of classic rock and jazz.',
  },
];

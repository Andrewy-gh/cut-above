import ContactUs from '../components/home/ContactUs';
import Services from '../components/home/Services';
import TeamMembers from '../components/home/TeamMembers';
import Hero from '../components/home/Hero';
import { employees } from '../data/data';

export default function Home() {
  return (
    <div style={{ marginBottom: '4rem' }}>
      <Hero />
      <Services />
      <TeamMembers employees={employees} />
      <ContactUs />
    </div>
  );
}

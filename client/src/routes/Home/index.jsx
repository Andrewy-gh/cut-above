import Hero from './Hero';
import Services from './Services';
import ContactUs from './ContactUs';
import TeamMembers from './TeamMembers';

export default function Home() {
  return (
    <div className="mb-16">
      <Hero />
      <Services />
      <TeamMembers />
      <ContactUs />
    </div>
  );
}

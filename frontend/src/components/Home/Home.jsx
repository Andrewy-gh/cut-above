import ContactUs from './ContactUs';
import Hero from './Hero';
import Services from './Services';
import EmployeeShowcase from '../../features/employees/EmployeeShowcase';

const Home = () => {
  return (
    <main>
      <Hero />
      <Services />
      <EmployeeShowcase />
      <ContactUs />
    </main>
  );
};

export default Home;

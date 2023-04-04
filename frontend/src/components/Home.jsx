import { Link } from 'react-router-dom';
function Home(props) {
  return (
    <>
      <div>This is the Home Page!</div>
      <Link to="/login">Click here to log in</Link>
    </>
  );
}

export default Home;

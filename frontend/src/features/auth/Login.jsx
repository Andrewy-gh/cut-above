import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';
import { useLoginMutation } from './authApiSlice';
import { useNavigate } from 'react-router-dom';

function Login(props) {
  const [user, setUser] = useState('andy.yu617@gmail.com');
  const [password, setPassword] = useState('pw');
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login({ email: user, password }).unwrap();
      dispatch(
        setCredentials({
          user,
          accessToken: userData.accessToken,
        })
      );
      setUser('');
      setPassword('');
      navigate('/welcome');
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserInput = (e) => setUser(e.target.value);
  const handlePwdChange = (e) => setPassword(e.target.value);
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email:</label>
      <input value={user} onChange={handleUserInput} />
      <label htmlFor="password">Password:</label>
      <input value={password} onChange={handlePwdChange} />
      <button>Sign In</button>
    </form>
  );
}

export default Login;

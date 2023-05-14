import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, responsiveFontSizes } from '@mui/material';
import Box from '@mui/material/Box';
import Admin from './components/Admin/Admin';
import Home from './components/Home/Home';
import Footer from './components/Footer';
import Register from './features/register/Register';
import Login from './features/auth/Login';
import RequireAuth from './features/auth/RequireAuth';
import Welcome from './features/auth/Welcome';
import Appointments from './features/appointments/Appointments';
import AddSchedule from './features/schedule/AddSchedule';
import Schedule from './features/schedule/Schedule';
import UserList from './features/user/UserList';
import BookingPage from './components/BookingPage/BookingPage';
import NavBar from './components/NavBar';
import { theme } from './styles/styles';
import Notification from './features/notification/Notification';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={responsiveFontSizes(theme)}>
        <CssBaseline />
        <Notification />
        <Box
          sx={{
            minHeight: '100vh',
            minHeight: '100dvh',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
          }}
        >
          <NavBar />
          <Routes>
            <Route index element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/reserve" element={<BookingPage />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route path="/add" element={<AddSchedule />} />
              <Route path="/profile" element={<Welcome />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/user-list" element={<UserList />} />
            </Route>
          </Routes>
          <Footer />
        </Box>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

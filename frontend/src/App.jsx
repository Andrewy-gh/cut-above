import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, responsiveFontSizes } from '@mui/material';
import Home from './components/Home/Home';
import Login from './features/auth/Login';
import RequireAuth from './features/auth/RequireAuth';
import Welcome from './features/auth/Welcome';
import AddSchedule from './features/schedule/AddSchedule';
import Appointments from './features/appointments/Appointments';
import Schedule from './features/schedule/Schedule';
import BookingPage from './features/schedule/BookingPage';
import NavBar from './components/NavBar';
import { theme } from './styles/styles';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={responsiveFontSizes(theme)}>
        <CssBaseline />
        <NavBar />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/add" element={<AddSchedule />} />
          <Route path="/reserve" element={<BookingPage />} />
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/appointments" element={<Appointments />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

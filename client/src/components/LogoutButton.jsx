import { Button } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export default function LogoutButton() {
  const { handleLogout } = useAuth();

  return (
    <Button variant="contained" onClick={handleLogout}>
      Logout
    </Button>
  );
}

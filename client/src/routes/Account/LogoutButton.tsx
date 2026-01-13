import { Button } from '@mui/material';

// @ts-expect-error TS(2307): Cannot find module '@/hooks/useAuth' or its corres... Remove this comment to see the full error message
import { useAuth } from '@/hooks/useAuth';

export default function LogoutButton() {
  const { handleLogout } = useAuth();

  return (
    <Button variant="contained" onClick={handleLogout}>
      Logout
    </Button>
  );
}

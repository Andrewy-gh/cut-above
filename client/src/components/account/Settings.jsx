import ChangeEmail from './ChangeEmail';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';

export default function Settings() {
  return (
    <div
      style={{
        width: 'min(40ch, 100% - 2rem)',
        marginInline: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      <h1 style={{ marginTop: '1rem', textAlign: 'center' }}>
        Account settings
      </h1>
      <div>
        <h3 style={{ textAlign: 'center' }}>Update Email</h3>
        <ChangeEmail />
      </div>
      <div>
        <h3 style={{ textAlign: 'center' }}>Update Password</h3>

        <ChangePassword />
      </div>
      <div style={{ marginInline: 'auto' }}>
        <h3 style={{ textAlign: 'center' }}>Delete Account</h3>
        <DeleteAccount />
      </div>
    </div>
  );
}

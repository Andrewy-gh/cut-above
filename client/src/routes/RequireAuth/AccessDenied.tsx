import { Link } from 'react-router';

interface AccessDeniedProps {
  requiredRole?: string;
}

export default function AccessDenied({ requiredRole }: AccessDeniedProps) {
  const roleLabel = requiredRole ? `${requiredRole} ` : '';
  return (
    <main className="container-lg" aria-live="polite">
      <h1>Not allowed.</h1>
      <p>This page is restricted to {roleLabel}accounts.</p>
      <p>
        <Link to="/">
          Return <u>home</u>
        </Link>
      </p>
    </main>
  );
}


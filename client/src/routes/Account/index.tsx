import { Link } from 'react-router';
import LogoutButton from './LogoutButton';

import { useAuth } from '@/hooks/useAuth';
import styles from './styles.module.css';

interface AccountAction {
  title: string;
  description: string;
  to: string;
}

export default function Account() {
  const { displayName, role } = useAuth();
  const isAdmin = role === 'admin';

  const primaryActions: AccountAction[] = [
    {
      title: 'Account settings',
      description:
        'Update your profile details, email, password, and account preferences.',
      to: 'settings',
    },
    ...(!isAdmin
      ? [
          {
            title: 'View your appointments',
            description:
              'Review upcoming visits, revisit past bookings, and jump into changes when needed.',
            to: 'appointments',
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: 'Schedule Dashboard',
            description:
              'Monitor active schedule coverage, inspect appointment load, and manage the calendar.',
            to: '../dashboard',
          },
          {
            title: 'Add a new schedule',
            description:
              'Create fresh schedule blocks so the team can publish more appointment availability.',
            to: '../addschedule',
          },
        ]
      : []),
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.page_header}>
          <div>
            <h1 className={styles.page_title}>
              {displayName ? `Welcome ${displayName}` : 'Welcome'}
              <span className={styles.page_title_suffix}> to the Account page</span>
            </h1>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.cards_grid}>
          {primaryActions.map((action) => (
            <article key={action.title} className={styles.action_card}>
              <h3 className={styles.action_title}>{action.title}</h3>
              <p className={styles.action_description}>{action.description}</p>
              <Link to={action.to} className={styles.action_link}>
                {action.title}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.logout_row}>
        <h2 className={styles.logout_title}>Sign out when you&apos;re done</h2>
        <div className={styles.logout_action}>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

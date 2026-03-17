import { Link } from 'react-router';
import ChangeEmail from './ChangeEmail';
import ChangePassword from './ChangePassword';

import styles from './styles.module.css';

export default function Settings() {
  return (
    <main className={styles.page}>
      <Link to="/account" className={styles.back_link}>
        <span className={styles.back_arrow}>&larr;</span> Account
      </Link>

      <header className={styles.page_header}>
        <h1 className={styles.page_title}>Account settings</h1>
      </header>

      <section className={styles.cards_grid}>
        <article className={styles.setting_card}>
          <div className={styles.card_header}>
            <h2 className={styles.card_title}>Update Email</h2>
            <p className={styles.card_copy}>
              Change the address used for sign-in and account notifications.
            </p>
          </div>
          <div className={styles.form_shell}>
            <ChangeEmail />
          </div>
        </article>

        <article className={styles.setting_card}>
          <div className={styles.card_header}>
            <h2 className={styles.card_title}>Update Password</h2>
            <p className={styles.card_copy}>
              Refresh your password and keep the account secure.
            </p>
          </div>
          <div className={styles.form_shell}>
            <ChangePassword />
          </div>
        </article>
      </section>
    </main>
  );
}

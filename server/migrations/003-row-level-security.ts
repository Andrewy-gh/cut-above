import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE users FORCE ROW LEVEL SECURITY;

    CREATE POLICY users_select ON users
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND (
          role = 'employee'
          OR email = nullif(current_setting('app.auth_email', true), '')
        )
      )
      OR EXISTS (
        SELECT 1
        FROM appointments a
        WHERE (
          a.client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
          OR a.employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
        )
        AND (a.client_id = users.id OR a.employee_id = users.id)
      )
    );

    CREATE POLICY users_insert ON users
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND role = 'client'
      )
    );

    CREATE POLICY users_update ON users
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    );

    CREATE POLICY users_delete ON users
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE appointments FORCE ROW LEVEL SECURITY;

    CREATE POLICY appointments_select ON appointments
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR current_setting('app.current_user_role', true) = 'public'
      OR client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    );

    CREATE POLICY appointments_insert ON appointments
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'client'
        AND client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      )
    );

    CREATE POLICY appointments_update ON appointments
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    );

    CREATE POLICY appointments_delete ON appointments
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR client_id = nullif(current_setting('app.current_user_id', true), '')::uuid
      OR employee_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    );

    ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE schedules FORCE ROW LEVEL SECURITY;

    CREATE POLICY schedules_select ON schedules
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('public', 'client', 'employee', 'admin', 'service')
    );

    CREATE POLICY schedules_insert ON schedules
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    CREATE POLICY schedules_update ON schedules
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    CREATE POLICY schedules_delete ON schedules
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
    ALTER TABLE password_reset_tokens FORCE ROW LEVEL SECURITY;

    CREATE POLICY password_reset_tokens_select ON password_reset_tokens
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
      OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid
    );

    CREATE POLICY password_reset_tokens_insert ON password_reset_tokens
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    );

    CREATE POLICY password_reset_tokens_update ON password_reset_tokens
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    );

    CREATE POLICY password_reset_tokens_delete ON password_reset_tokens
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
      OR (
        current_setting('app.current_user_role', true) = 'public'
        AND user_id = nullif(current_setting('app.auth_user_id', true), '')::uuid
      )
    );

    ALTER TABLE email_outbox ENABLE ROW LEVEL SECURITY;
    ALTER TABLE email_outbox FORCE ROW LEVEL SECURITY;

    CREATE POLICY email_outbox_insert ON email_outbox
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('public', 'client', 'employee', 'admin', 'service')
    );

    CREATE POLICY email_outbox_select ON email_outbox
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('public', 'client', 'employee', 'admin', 'service')
    );

    CREATE POLICY email_outbox_update ON email_outbox
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    CREATE POLICY email_outbox_delete ON email_outbox
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    ALTER TABLE email_deliveries ENABLE ROW LEVEL SECURITY;
    ALTER TABLE email_deliveries FORCE ROW LEVEL SECURITY;

    CREATE POLICY email_deliveries_select ON email_deliveries
    FOR SELECT
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    CREATE POLICY email_deliveries_insert ON email_deliveries
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    CREATE POLICY email_deliveries_update ON email_deliveries
    FOR UPDATE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    )
    WITH CHECK (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );

    CREATE POLICY email_deliveries_delete ON email_deliveries
    FOR DELETE
    USING (
      current_setting('app.current_user_role', true) IN ('admin', 'service')
    );
  `);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    DROP POLICY IF EXISTS email_deliveries_delete ON email_deliveries;
    DROP POLICY IF EXISTS email_deliveries_update ON email_deliveries;
    DROP POLICY IF EXISTS email_deliveries_insert ON email_deliveries;
    DROP POLICY IF EXISTS email_deliveries_select ON email_deliveries;
    ALTER TABLE email_deliveries NO FORCE ROW LEVEL SECURITY;
    ALTER TABLE email_deliveries DISABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS email_outbox_delete ON email_outbox;
    DROP POLICY IF EXISTS email_outbox_update ON email_outbox;
    DROP POLICY IF EXISTS email_outbox_select ON email_outbox;
    DROP POLICY IF EXISTS email_outbox_insert ON email_outbox;
    ALTER TABLE email_outbox NO FORCE ROW LEVEL SECURITY;
    ALTER TABLE email_outbox DISABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS password_reset_tokens_delete ON password_reset_tokens;
    DROP POLICY IF EXISTS password_reset_tokens_update ON password_reset_tokens;
    DROP POLICY IF EXISTS password_reset_tokens_insert ON password_reset_tokens;
    DROP POLICY IF EXISTS password_reset_tokens_select ON password_reset_tokens;
    ALTER TABLE password_reset_tokens NO FORCE ROW LEVEL SECURITY;
    ALTER TABLE password_reset_tokens DISABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS schedules_delete ON schedules;
    DROP POLICY IF EXISTS schedules_update ON schedules;
    DROP POLICY IF EXISTS schedules_insert ON schedules;
    DROP POLICY IF EXISTS schedules_select ON schedules;
    ALTER TABLE schedules NO FORCE ROW LEVEL SECURITY;
    ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS appointments_delete ON appointments;
    DROP POLICY IF EXISTS appointments_update ON appointments;
    DROP POLICY IF EXISTS appointments_insert ON appointments;
    DROP POLICY IF EXISTS appointments_select ON appointments;
    ALTER TABLE appointments NO FORCE ROW LEVEL SECURITY;
    ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS users_delete ON users;
    DROP POLICY IF EXISTS users_update ON users;
    DROP POLICY IF EXISTS users_insert ON users;
    DROP POLICY IF EXISTS users_select ON users;
    ALTER TABLE users NO FORCE ROW LEVEL SECURITY;
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  `);
}

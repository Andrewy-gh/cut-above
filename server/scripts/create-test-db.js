import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const containerName = process.env.DB_CONTAINER ?? 'cutabove-db';
const dbName = process.env.DB_NAME ?? 'cutabove_test';
const dbUser = process.env.DB_USER ?? 'postgres';
const dbNameLiteral = dbName.replace(/'/g, "''");
const dbNameIdentifier = dbName.replace(/"/g, '""');

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const waitForPostgres = async () => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await execAsync(`docker exec -i ${containerName} pg_isready -U ${dbUser}`);
      return;
    } catch (error) {
      if (attempt === 30) {
        throw error;
      }
      await wait(1000);
    }
  }
};

const databaseExists = async () => {
  const { stdout } = await execAsync(
    `docker exec -i ${containerName} psql -U ${dbUser} -tAc "SELECT 1 FROM pg_database WHERE datname='${dbNameLiteral}'"`
  );
  return stdout.trim() === '1';
};

try {
  await waitForPostgres();

  if (await databaseExists()) {
    process.exit(0);
  }

  await execAsync(
    `docker exec -i ${containerName} psql -U ${dbUser} -c "CREATE DATABASE \\"${dbNameIdentifier}\\""`
  );
} catch (error) {
  const stderr = error?.stderr ? String(error.stderr) : '';
  if (stderr) {
    process.stderr.write(stderr);
  } else {
    process.stderr.write(String(error));
  }
  process.exit(1);
}

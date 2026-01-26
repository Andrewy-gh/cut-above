const setDefaultEnv = (key: string, value: string) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
};

// Test-only defaults; .env.test or CI env can override these.
setDefaultEnv('NODE_ENV', 'test');
setDefaultEnv('SESSION_SECRET', 'test-session-secret');
setDefaultEnv('EMAIL_SERVICE', 'smtp');
setDefaultEnv('EMAIL_USER', 'sender@example.com');
setDefaultEnv('PROD_CLIENT_URL', 'http://localhost:3000');

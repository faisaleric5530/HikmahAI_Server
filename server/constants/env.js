require('dotenv').config();
const { cleanEnv, str, port } = require('envalid');

const env = cleanEnv(process.env, {
  PORT: port({ default: 4000 }),
  NODE_ENV: str({ default: 'development' }),

  DB_NAME: str(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_HOST: str({ default: 'localhost' }),
  DB_PORT: port({ default: 5432 }),
  DB_SCHEMA: str({ default: 'hikmah' }),

  JWT_SECRET: str(),
  JWT_EXPIRY: str({ default: '7d' }),
  JWT_ISSUER: str({ default: 'hikmah-ai-backend' }),

  AI_PROVIDER: str({ choices: ['openai', 'claude'], default: 'openai' }),

  OPENAI_API_KEY: str({ default: '' }),
  OPENAI_MODEL: str({ default: 'gpt-4o-mini' }),

  ANTHROPIC_API_KEY: str({ default: '' }),
  CLAUDE_MODEL: str({ default: 'claude-sonnet-5' }),
});

module.exports = { env };

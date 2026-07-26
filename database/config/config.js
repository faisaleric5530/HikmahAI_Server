require('dotenv').config();

const schema = process.env.DB_SCHEMA || 'hikmah';

const hooks = {
  afterConnect: async (connection) => {
    await connection.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await connection.query(`SET search_path TO "${schema}", public`);
  },
};

const base = process.env.DATABASE_URL
  ? {
      use_env_variable: 'DATABASE_URL',
      dialect: 'postgres',
      logging: false,
      dialectOptions:
        process.env.DB_SSL === 'false'
          ? {}
          : { ssl: { require: true, rejectUnauthorized: false } },
      hooks,
    }
  : {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      dialectOptions:
        process.env.DB_SSL === 'true'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
      hooks,
    };

module.exports = {
  development: base,
  test: base,
  production: base,
};

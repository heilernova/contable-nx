import { generateSchema } from './generate-schema';
import { Pool } from 'pg';
// import { rmSync, writeFileSync } from "node:fs";

const main = async () => {
  process.loadEnvFile('.env');
  const schema = await generateSchema({ includeData: true });

  const pool = new Pool();
  await pool.query(schema);
  await pool.end();

};

main()
.then(() => {
  console.log('Database schema installed successfully.');
  process.exit(0);
})
.catch((err) => {
  console.error('Error installing database schema:', err);
  process.exit(1);
});
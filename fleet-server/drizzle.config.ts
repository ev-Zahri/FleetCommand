import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dbCredentials: {
        url: process.env.DATABASE_URL ?? "postgres://postgres:zahri@localhost:5432/fleet_db",
    },
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
});
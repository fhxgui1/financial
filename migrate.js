import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Creating financial_users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS financial_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Adding user_id to financial_categories...');
    await sql`ALTER TABLE financial_categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES financial_users(id) ON DELETE CASCADE;`;
    
    console.log('Adding user_id to financial_transactions...');
    await sql`ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES financial_users(id) ON DELETE CASCADE;`;
    
    console.log('Adding user_id to financial_budgets...');
    await sql`ALTER TABLE financial_budgets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES financial_users(id) ON DELETE CASCADE;`;
    
    console.log('Migration done successfully!');
  } catch(e) {
    console.error('Migration failed:', e);
  }
}

migrate();

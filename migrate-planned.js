import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Creating planned_purchases table...');
    await sql`
      CREATE TABLE IF NOT EXISTS planned_purchases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES financial_users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        max_value DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Creating planned_purchase_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS planned_purchase_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        planned_purchase_id UUID REFERENCES planned_purchases(id) ON DELETE CASCADE,
        category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        value DECIMAL(10,2) NOT NULL DEFAULT 0,
        purchased BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('Migration done successfully!');
  } catch(e) {
    console.error('Migration failed:', e);
  }
}

migrate();

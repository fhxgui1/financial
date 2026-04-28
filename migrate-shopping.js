import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function migrate() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Creating financial_shopping_list table...');
    await sql`
      CREATE TABLE IF NOT EXISTS financial_shopping_list (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES financial_users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        planned_date DATE NOT NULL,
        category_id UUID REFERENCES financial_categories(id) ON DELETE CASCADE,
        is_purchased BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('Migration for shopping list done successfully!');
  } catch(e) {
    console.error('Migration failed:', e);
  }
}

migrate();

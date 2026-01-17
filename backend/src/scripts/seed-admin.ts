/**
 * Seed script to create an admin user
 * Run with: npx ts-node src/scripts/seed-admin.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, UserRole } from '../models/User.model';
import { connectDatabase, disconnectDatabase } from '../config/database';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234';
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME || 'Admin';
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME || 'User';

async function seedAdmin() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`[SUCCESS] Admin user already exists: ${ADMIN_EMAIL}`);
      console.log('   To create a new admin, use a different email or delete the existing one.');
      await disconnectDatabase();
      process.exit(0);
    }

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      role: UserRole.ADMIN,
      isActive: true,
    });

    console.log('[SUCCESS] Admin user created successfully!');
    console.log('');
    console.log('Admin Credentials:');
    console.log('  Email:', admin.email);
    console.log('  Password:', ADMIN_PASSWORD);
    console.log('  Role:', admin.role);
    console.log('');
    console.log('[WARNING] IMPORTANT: Change the password after first login!');

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error creating admin user:', error);
    await disconnectDatabase();
    process.exit(1);
  }
}

seedAdmin();

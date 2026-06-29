import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const truckDetails = pgTable('truck_details', {
  id: integer('id').primaryKey(),
  mileage: text('mileage').notNull(),
  price: text('price').notNull(),
  windowStickerUrl: text('window_sticker_url'),
  carfaxReportUrl: text('carfax_report_url'),
});

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  message: text('message'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  sender: text('sender').notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  isRead: integer('is_read').default(0),
});

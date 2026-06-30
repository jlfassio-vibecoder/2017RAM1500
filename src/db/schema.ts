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
  kbbReportUrl: text('kbb_report_url'),
  smogReportUrl: text('smog_report_url'),
  subtitle: text('subtitle'),
  msrp: text('msrp'),
  sellersNoteIntro: text('sellers_note_intro'),
  peaceOfMindText: text('peace_of_mind_text'),
  maintenanceText: text('maintenance_text'),
  utilityTowingText: text('utility_towing_text'),
  luxuryOptionsText: text('luxury_options_text'),
  ctaText: text('cta_text'),
  mechanicalIntegrityIntro: text('mechanical_integrity_intro'),
  mechanicalItem1Title: text('mechanical_item_1_title'),
  mechanicalItem1Text: text('mechanical_item_1_text'),
  mechanicalItem2Title: text('mechanical_item_2_title'),
  mechanicalItem2Text: text('mechanical_item_2_text'),
  mechanicalItem3Title: text('mechanical_item_3_title'),
  mechanicalItem3Text: text('mechanical_item_3_text'),
  marketValuationIntro: text('market_valuation_intro'),
  marketDealerReality: text('market_dealer_reality'),
  marketKbbValue: text('market_kbb_value'),
  marketThisTruck: text('market_this_truck'),
  highlight1Title: text('highlight_1_title'),
  highlight1Text: text('highlight_1_text'),
  highlight2Title: text('highlight_2_title'),
  highlight2Text: text('highlight_2_text'),
  highlight3Title: text('highlight_3_title'),
  highlight3Text: text('highlight_3_text'),
  highlight4Title: text('highlight_4_title'),
  highlight4Text: text('highlight_4_text'),
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

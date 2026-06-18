import { pgTable, uuid, text, timestamp, integer, boolean, json, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: varchar('role', { length: 20 }).notNull(), // 'client' | 'freelancer' | 'admin'
  clerkId: text('clerk_id').notNull().unique(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active' | 'suspended'
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const freelancers = pgTable('freelancers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  skills: json('skills').$type<string[]>(),
  bio: text('bio'),
  hourlyRate: integer('hourly_rate'),
  location: text('location'),
  reputationScore: integer('reputation_score').default(0),
  portfolio: json('portfolio').$type<any[]>(),
});

export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  company: text('company'),
  location: text('location'),
});

export const gigs = pgTable('gigs', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  budget: integer('budget').notNull(),
  milestones: json('milestones').$type<any[]>(),
  status: varchar('status', { length: 20 }).notNull(), // 'draft'|'open'|'in_progress'|'completed'|'cancelled'|'disputed'
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const proposals = pgTable('proposals', {
  id: uuid('id').defaultRandom().primaryKey(),
  freelancerId: uuid('freelancer_id').references(() => freelancers.id).notNull(),
  gigId: uuid('gig_id').references(() => gigs.id).notNull(),
  bidAmount: integer('bid_amount').notNull(),
  deliveryDays: integer('delivery_days').notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // 'pending'|'accepted'|'rejected'|'withdrawn'|'countered'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  reviewerId: uuid('reviewer_id').references(() => users.id).notNull(),
  revieweeId: uuid('reviewee_id').references(() => users.id).notNull(),
  gigId: uuid('gig_id').references(() => gigs.id).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  weightedScore: integer('weighted_score'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  receiverId: uuid('receiver_id').references(() => users.id).notNull(),
  gigId: uuid('gig_id').references(() => gigs.id).notNull(),
  content: text('content').notNull(),
  fileUrl: text('file_url'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  gigId: uuid('gig_id').references(() => gigs.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  freelancerId: uuid('freelancer_id').references(() => freelancers.id).notNull(),
  amount: integer('amount').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  gateway: varchar('gateway', { length: 20 }).notNull(),
  escrowStatus: varchar('escrow_status', { length: 20 }).notNull(), // 'held'|'released'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  payload: json('payload').notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const disputes = pgTable('disputes', {
  id: uuid('id').defaultRandom().primaryKey(),
  gigId: uuid('gig_id').references(() => gigs.id).notNull(),
  raisedBy: uuid('raised_by').references(() => users.id).notNull(),
  reason: text('reason').notNull(),
  evidence: json('evidence').$type<string[]>(),
  status: varchar('status', { length: 20 }).notNull(),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adminLogs = pgTable('admin_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 50 }).notNull(),
  targetId: uuid('target_id').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  freelancerId: uuid('freelancer_id').references(() => freelancers.id).notNull(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' | 'confirmed' | 'cancelled' | 'completed'
  meetingLink: text('meeting_link'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

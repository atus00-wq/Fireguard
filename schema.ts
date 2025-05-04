import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  isDefault: boolean("is_default").default(false),
  userId: integer("user_id").references(() => users.id),
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).pick({
  name: true,
  phone: true,
  address: true,
  isDefault: true,
  userId: true,
});

export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  imageData: text("image_data"), // Base64 encoded image
  confidence: text("confidence").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, canceled
  emergencyContactId: integer("emergency_contact_id").references(() => emergencyContacts.id),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  userId: true,
  latitude: true, 
  longitude: true,
  imageData: true,
  confidence: true,
  status: true,
  emergencyContactId: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sensitivity: text("sensitivity").notNull().default("medium"), // low, medium, high
  notificationsEnabled: boolean("notifications_enabled").default(true),
  locationEnabled: boolean("location_enabled").default(true),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  sensitivity: true,
  notificationsEnabled: true,
  locationEnabled: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

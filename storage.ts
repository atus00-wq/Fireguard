import { users, type User, type InsertUser, 
         type Alert, type InsertAlert, 
         type EmergencyContact, type InsertEmergencyContact,
         type Settings, type InsertSettings } from "@shared/schema";

// Extend the storage interface with CRUD methods for our data
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Alert management
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlertsByUser(userId: number): Promise<Alert[]>;
  updateAlertStatus(id: number, status: string): Promise<Alert | undefined>;
  
  // Emergency contacts management
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  getEmergencyContacts(userId: number): Promise<EmergencyContact[]>;
  getEmergencyContact(id: number): Promise<EmergencyContact | undefined>;
  updateEmergencyContact(id: number, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined>;
  deleteEmergencyContact(id: number): Promise<boolean>;
  
  // Settings management
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private alerts: Map<number, Alert>;
  private emergencyContacts: Map<number, EmergencyContact>;
  private settings: Map<number, Settings>;
  
  private userCurrentId: number;
  private alertCurrentId: number;
  private contactCurrentId: number;
  private settingsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.alerts = new Map();
    this.emergencyContacts = new Map();
    this.settings = new Map();
    
    this.userCurrentId = 1;
    this.alertCurrentId = 1;
    this.contactCurrentId = 1;
    this.settingsCurrentId = 1;
    
    // Initialize with a default user
    this.createUser({
      username: "demo",
      password: "password123"
    });
    
    // Initialize with default emergency contact
    this.createEmergencyContact({
      name: "Local Fire Department",
      phone: "911",
      address: "123 Emergency St",
      isDefault: true,
      userId: 1
    });
    
    // Initialize with default settings
    this.createSettings({
      userId: 1,
      sensitivity: "medium",
      notificationsEnabled: true,
      locationEnabled: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Alert methods
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertCurrentId++;
    const now = new Date();
    
    const alert: Alert = { 
      ...insertAlert, 
      id,
      timestamp: now
    };
    
    this.alerts.set(id, alert);
    return alert;
  }
  
  async getAlertsByUser(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async updateAlertStatus(id: number, status: string): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, status };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  // Emergency contact methods
  async createEmergencyContact(insertContact: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = this.contactCurrentId++;
    const contact: EmergencyContact = { ...insertContact, id };
    
    // If this is the default contact, update other contacts
    if (contact.isDefault) {
      for (const [existingId, existingContact] of this.emergencyContacts.entries()) {
        if (existingContact.userId === contact.userId && existingContact.isDefault) {
          this.emergencyContacts.set(existingId, { ...existingContact, isDefault: false });
        }
      }
    }
    
    this.emergencyContacts.set(id, contact);
    return contact;
  }
  
  async getEmergencyContacts(userId: number): Promise<EmergencyContact[]> {
    return Array.from(this.emergencyContacts.values())
      .filter(contact => contact.userId === userId);
  }
  
  async getEmergencyContact(id: number): Promise<EmergencyContact | undefined> {
    return this.emergencyContacts.get(id);
  }
  
  async updateEmergencyContact(id: number, contactUpdate: Partial<InsertEmergencyContact>): Promise<EmergencyContact | undefined> {
    const contact = this.emergencyContacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact = { ...contact, ...contactUpdate };
    
    // If this is being set as default, update other contacts
    if (contactUpdate.isDefault) {
      for (const [existingId, existingContact] of this.emergencyContacts.entries()) {
        if (existingId !== id && existingContact.userId === contact.userId && existingContact.isDefault) {
          this.emergencyContacts.set(existingId, { ...existingContact, isDefault: false });
        }
      }
    }
    
    this.emergencyContacts.set(id, updatedContact);
    return updatedContact;
  }
  
  async deleteEmergencyContact(id: number): Promise<boolean> {
    return this.emergencyContacts.delete(id);
  }
  
  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values())
      .find(setting => setting.userId === userId);
  }
  
  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.settingsCurrentId++;
    const settings: Settings = { ...insertSettings, id };
    this.settings.set(id, settings);
    return settings;
  }
  
  async updateSettings(settingsUpdate: Partial<InsertSettings>): Promise<Settings | undefined> {
    const userId = settingsUpdate.userId;
    if (!userId) return undefined;
    
    const existingSettings = Array.from(this.settings.values())
      .find(setting => setting.userId === userId);
    
    if (!existingSettings) {
      return this.createSettings(settingsUpdate as InsertSettings);
    }
    
    const updatedSettings = { ...existingSettings, ...settingsUpdate };
    this.settings.set(existingSettings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();

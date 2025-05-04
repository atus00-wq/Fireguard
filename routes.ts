import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAlertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for sending fire alerts
  app.post('/api/alerts', async (req, res) => {
    try {
      // Validate request body
      const alertData = insertAlertSchema
        .omit({ userId: true, emergencyContactId: true })
        .parse(req.body);
      
      // Store the alert
      const alert = await storage.createAlert({
        ...alertData,
        userId: 1, // Default user ID since we don't have auth in this demo
        emergencyContactId: null,
      });
      
      // In a real application, we would send the alert to emergency services here
      
      res.status(200).json({
        message: 'Alert sent successfully',
        alert: alert
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Invalid alert data',
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: 'Failed to send alert'
        });
      }
    }
  });

  // API route for getting a user's emergency contacts
  app.get('/api/emergency-contacts', async (req, res) => {
    try {
      const contacts = await storage.getEmergencyContacts(1); // Default user ID
      res.status(200).json(contacts);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      res.status(500).json({
        message: 'Failed to fetch emergency contacts'
      });
    }
  });

  // API route for adding a new emergency contact
  app.post('/api/emergency-contacts', async (req, res) => {
    try {
      const contactData = req.body;
      contactData.userId = 1; // Default user ID
      
      const contact = await storage.createEmergencyContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      console.error('Error creating emergency contact:', error);
      res.status(500).json({
        message: 'Failed to create emergency contact'
      });
    }
  });

  // API route for getting user settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings(1); // Default user ID
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({
        message: 'Failed to fetch settings'
      });
    }
  });

  // API route for updating user settings
  app.put('/api/settings', async (req, res) => {
    try {
      const settingsData = req.body;
      settingsData.userId = 1; // Default user ID
      
      const settings = await storage.updateSettings(settingsData);
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({
        message: 'Failed to update settings'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

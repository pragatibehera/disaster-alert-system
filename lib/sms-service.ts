// lib/sms-service.ts
// SMS Service for DisasterAlert using Twilio API

// For hackathon purposes, you can use Twilio's free trial
// Sign up at https://www.twilio.com/try-twilio and get:
// - Account SID
// - Auth Token
// - Twilio phone number

interface SMSConfig {
    accountSid: string;
    authToken: string;
    fromNumber: string; // Your Twilio phone number
  }
  
  interface SMSMessage {
    to: string;
    body: string;
  }
  
  interface SMSResponse {
    success: boolean;
    messageId?: string;
    error?: string;
  }
  
  class SMSService {
    private config: SMSConfig | null = null;
    private isMockMode: boolean = true;
  
    constructor() {
      // Check if environment variables are available
      if (
        process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID &&
        process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN &&
        process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER
      ) {
        this.config = {
          accountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
          authToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN,
          fromNumber: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
        };
        this.isMockMode = false;
      } else {
        console.warn("Twilio credentials not found. Using mock SMS service.");
      }
    }
  
    /**
     * Send SMS alert to a phone number
     * @param phoneNumber - Phone number with country code (e.g., +12345678900)
     * @param message - SMS message content
     * @returns Promise with SMS response
     */
    async sendAlert(phoneNumber: string, message: string): Promise<SMSResponse> {
      // For hackathon demo, we'll use a mock service if not configured
      if (this.isMockMode) {
        return this.mockSendSMS({ to: phoneNumber, body: message });
      }
  
      // Format phone number if needed
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
  
      try {
        // Configure SMS request to Twilio
        const smsMessage: SMSMessage = {
          to: formattedPhone,
          body: message,
        };
  
        // In a real implementation, you would call Twilio API here
        // For hackathon purposes, this is simplified
        const response = await this.sendSMSViaTwilio(smsMessage);
        return response;
      } catch (error) {
        console.error("Failed to send SMS:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  
    /**
     * Format phone number to E.164 format
     * @param phoneNumber - Raw phone number input
     * @returns Formatted phone number
     */
    private formatPhoneNumber(phoneNumber: string): string {
      // Strip all non-numeric characters
      let cleaned = phoneNumber.replace(/\D/g, '');
  
      // Add + prefix if not present
      if (!phoneNumber.startsWith('+')) {
        // Default to US if no country code
        if (cleaned.length === 10) {
          cleaned = `+1${cleaned}`;
        } else {
          cleaned = `+${cleaned}`;
        }
      } else {
        cleaned = `+${cleaned}`;
      }
  
      return cleaned;
    }
  
    /**
     * Send SMS via Twilio API
     * @param message - SMS message data
     * @returns Promise with SMS response
     */
    private async sendSMSViaTwilio(message: SMSMessage): Promise<SMSResponse> {
      if (!this.config) {
        return {
          success: false,
          error: 'Twilio not configured',
        };
      }
  
      // For hackathon purposes, this would be where you'd
      // integrate with Twilio's API
      // Example implementation using Twilio SDK:
  
      /*
      const twilio = require('twilio');
      const client = twilio(this.config.accountSid, this.config.authToken);
      
      const response = await client.messages.create({
        body: message.body,
        from: this.config.fromNumber,
        to: message.to
      });
      
      return {
        success: true,
        messageId: response.sid
      };
      */
  
      // For now, we'll mock a successful response
      return {
        success: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      };
    }
  
    /**
     * Mock SMS sending for hackathon demo
     * @param message - SMS message data 
     * @returns Mock SMS response
     */
    private mockSendSMS(message: SMSMessage): Promise<SMSResponse> {
      return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
          console.log('📱 MOCK SMS SENT:', {
            to: message.to,
            message: message.body,
            timestamp: new Date().toISOString()
          });
  
          resolve({
            success: true,
            messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          });
        }, 800);
      });
    }
  
    /**
     * Send disaster alert SMS with standard formatting
     * @param phoneNumber - Recipient's phone number
     * @param disasterType - Type of disaster (flood, earthquake, etc.)
     * @param location - Location of the disaster
     * @param severity - Severity level (high, medium, low)
     * @param instructions - Safety instructions
     * @returns Promise with SMS response
     */
    async sendDisasterAlert(
      phoneNumber: string,
      disasterType: string,
      location: string,
      severity: string,
      instructions?: string
    ): Promise<SMSResponse> {
      // Format standard alert message
      const severityText = severity.toUpperCase();
      const message = `🚨 DISASTER ALERT: ${severityText} ${disasterType} in ${location}. ${instructions || 'Seek safe shelter immediately. Follow local emergency instructions.'}`;
  
      return this.sendAlert(phoneNumber, message);
    }
  
    /**
     * Send safety tips based on disaster type
     * @param phoneNumber - Recipient's phone number
     * @param disasterType - Type of disaster
     * @returns Promise with SMS response
     */
    async sendSafetyTips(
      phoneNumber: string,
      disasterType: string
    ): Promise<SMSResponse> {
      // Get safety tips based on disaster type
      const tips = this.getSafetyTipsForDisaster(disasterType);
      
      // Format message
      const message = `🔔 SAFETY TIPS for ${disasterType}: ${tips.join(' ')}`;
      
      return this.sendAlert(phoneNumber, message);
    }
  
    /**
     * Get safety tips for specific disaster type
     * @param disasterType - Type of disaster
     * @returns Array of safety tips
     */
    private getSafetyTipsForDisaster(disasterType: string): string[] {
      const type = disasterType.toLowerCase();
      
      if (type.includes('flood')) {
        return [
          "Move to higher ground.",
          "Avoid walking through flowing water.",
          "Do not drive through flooded areas.",
        ];
      } else if (type.includes('fire') || type.includes('wildfire')) {
        return [
          "Evacuate immediately if ordered.",
          "Prepare important documents and medications.",
          "Close all windows and doors before leaving.",
        ];
      } else if (type.includes('earthquake')) {
        return [
          "Drop, cover, and hold on.",
          "Stay away from windows and exterior walls.",
          "If outdoors, move to open areas away from buildings.",
        ];
      } else if (type.includes('hurricane') || type.includes('cyclone')) {
        return [
          "Follow evacuation orders immediately.",
          "Secure or bring inside outdoor objects.",
          "Stay away from windows during the storm.",
        ];
      } else if (type.includes('tornado')) {
        return [
          "Seek shelter in basement or interior room.",
          "Stay away from windows and doors.",
          "If outdoors, lie flat in a nearby ditch.",
        ];
      } else {
        return [
          "Stay informed through emergency channels.",
          "Follow instructions from local authorities.",
          "Prepare an emergency kit with essentials.",
        ];
      }
    }
  }
  
  // Export singleton instance
  export const smsService = new SMSService();
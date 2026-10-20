import { EmailDispatchPayload } from '../types';

export interface EmailDispatchRecord extends EmailDispatchPayload {
  id: string;
  sentAt: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  deliveryReceiptId: string;
}

const STORAGE_KEY = 'my3_email_dispatches';

export const emailService = {
  /**
   * Dispatches architectural blueprint packages and 3D renders to clients or permit offices
   */
  async sendBlueprintPackage(payload: EmailDispatchPayload): Promise<EmailDispatchRecord> {
    // Simulate brief enterprise SMTP / SendGrid dispatch latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const record: EmailDispatchRecord = {
      ...payload,
      id: `email-${Date.now()}`,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'DELIVERED',
      deliveryReceiptId: `rcpt_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    try {
      const existing = this.getDispatchedEmails();
      existing.unshift(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save email dispatch history:', e);
    }

    return record;
  },

  getDispatchedEmails(): EmailDispatchRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load email dispatches:', e);
    }
    return [];
  },

  generateClientPitchEmailTemplate(params: {
    clientName: string;
    projectName: string;
    style: string;
    sqft: number;
    floors: number;
    estimatedCost: number;
  }): string {
    return `Subject: MY3 Desings — Architectural Presentation & Floor Plans for ${params.projectName}

Dear ${params.clientName},

We are thrilled to present the initial architectural design package for ${params.projectName}.
Our AI-accelerated architectural studio has synthesized the complete multi-floor layout according to your project requirements:

📐 Project Specifications:
• Architectural Style: ${params.style}
• Gross Floor Area: ${params.sqft.toLocaleString()} sq ft (${params.floors} Levels)
• Estimated Construction Cost: $${params.estimatedCost.toLocaleString()} USD
• Structural Feasibility: Verified for IRC 2024 Building Code compliance

Enclosed in your client portal:
1. 2D Vector CAD Blueprints (Floor 1 & Floor 2 with complete dimensioning)
2. Interactive 3D WebGL Studio Walkthrough
3. High-Resolution Photorealistic Renderings

Please review the attached drawings and let us know your preferred revisions via the "Talk to Your Plan" AI Assistant.

Best regards,
MY3 Desings Architectural Engineering Team`;
  }
};

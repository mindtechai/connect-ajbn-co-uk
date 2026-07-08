// src/services/meshService.ts
import { createLink } from '@meshconnect/web-link-sdk';

export class MeshService {
  private static instance: MeshService;
  private connection: any;

  private constructor() {
    this.connection = createLink({
      renderType: 'overlay',
      theme: 'system',
      language: 'system',
      displayFiatCurrency: 'USD',
      onIntegrationConnected: (payload) => {
        console.log('Mesh integration connected:', payload);
      },
    });
  }

  static getInstance(): MeshService {
    if (!MeshService.instance) {
      MeshService.instance = new MeshService();
    }
    return MeshService.instance;
  }

  async getLinkToken(userId: string): Promise<string> {
    // Call your Supabase Edge Function
    const response = await fetch('/api/mesh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to get link token');
    }

    const data = await response.json();
    return data.linkToken;
  }

  async openMemberDeposit(userId: string) {
    try {
      const linkToken = await this.getLinkToken(userId);
      this.connection.openLink(linkToken);
    } catch (error) {
      console.error('Failed to open Mesh connection:', error);
      throw error;
    }
  }
}

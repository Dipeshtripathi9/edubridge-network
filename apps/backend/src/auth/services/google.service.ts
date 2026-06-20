import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleProfile {
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

@Injectable()
export class GoogleService {
  private readonly client: OAuth2Client;

  constructor(private readonly config: ConfigService) {
    this.client = new OAuth2Client(this.config.get<string>('google.clientId'));
  }

  /** Verify a Google ID token (sent from the frontend) and return the profile. */
  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.config.get<string>('google.clientId'),
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }
      return {
        providerUserId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified ?? false,
        name: payload.name,
        picture: payload.picture,
      };
    } catch {
      throw new UnauthorizedException('Failed to verify Google token');
    }
  }
}

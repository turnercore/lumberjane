// User from supabase: Email	Phone	Provider	Created	Last Sign In	User UID	

import { UUID } from "crypto";

export type UUID = UUID;

export type User = {
    id: UUID;
    email: string;
    phone: string;
    provider: string;
    created_at: Date;
    last_sign_in: Date;
};

type authType = 'none' | 'bearer'

export type JwtToken = {
    info: {
        key?: UUID;
        id: UUID;
        formatResponse: boolean;
        user: UUID;
        name: string;
        description?: string;
        method: string;
        authType: authType;
        auth?: Array<{ key: string; value: string }>
        headers?: Array<{ key: string; value: string }>;
        endpoint: string;
        ai_enabled: boolean;
        ai_key?: UUID;
    };
    restrictions: Array<Object>; // You may want to define a specific type for restrictions
    request: string;
    expectedResponse?: string;
    log: {
        enabled: boolean;
        log_level: string;
        log_response: boolean;
    };
    };

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE';

export type UserProfile = {
    id?: UUID;
    name?: string;
    email?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    website?: string;
};

export type KeyId = UUID

export type Key = {
    id?: KeyId;
    name?: string;
    value?: string; // This field will store the encrypted key in the format `iv:encryptedkey`
    decryptedValue?: string; // This field will be used for the decrypted value for display purposes, but won't be stored in the database
    description?: string;
    userId?: User.id;
    createdAt?: Date;
    isSecret?: boolean;
};

// Restrictions for JWT use
export type RestrictionType = 'headerTags' | 'ipAddresses' | 'timeOfDay' | 'expirationDate';

export interface Restriction {
  type: RestrictionType;
  rule: {
    [key: string]: any;
  }
}

export interface HeaderRestriction extends Restriction {
  type: 'headerTags';
  rule: {
    tagName: string;
    tagValue: string;
  };
}

export interface IpRestriction extends Restriction {
  type: 'ipAddresses';
  rule: {
    ipRange: string;
  };
}

export interface TimeRestriction extends Restriction {
  type: 'timeOfDay';
  rule: {
    startTime: string;
    endTime: string;
  };
}

export interface ExpirationRestriction extends Restriction {
  type: 'expirationDate';
  rule: {
    expirationDate: Date;
  };
}

export interface ServerError {
    message: string;
    status: number;
}

export interface StandardResponse {
    error?: {
      message: string;
      status: number;
    };
    data?: any;
  };

export interface TokenFormFields {
  name: string;
  description?: string;
  authType: AuthType;
  endpoint: string;
  request?: string;
  expectedResponse?: string;
  method: RequestMethod; // If this is always "POST", you can define it as a string literal type
  logEnabled: boolean;
  logResponse: boolean;
  key?: UUID;
  aiEnabled: boolean;
  openAIKey?: UUID;
  restrictions?: Restriction[];
  headers?: Array<{ key: string; value: string }>;
  auth?: Array<{ key: string; value: string }>;
  logLevel?: string;
};

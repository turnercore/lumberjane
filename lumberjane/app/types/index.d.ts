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

export type JwtToken = {
    info: {
        key: UUID;
        id: UUID;
        user: UUID;
        name: string;
        description?: string;
        method: string;
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

export type JwtTokenRequest = {
    name: string;
    description?: string;
    endpoint: string;
    request: string;
    expectedResponse?: string;
    method: string; // If this is always "POST", you can define it as a string literal type
    logEnabled: boolean;
    logResponse: boolean;
    key: UUID;
    aiEnabled: boolean;
    openAIKey?: UUID;
    restrictions: any[]; // You can replace 'any' with a specific type if you have a defined structure for restrictions
    headers?: Array<{ key: string; value: string }>;
    auth?: Array<{ key: string; value: string }>;
    logLevel?: string;


};

export type User = supabase

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

export interface BaseRestriction {
  type: RestrictionType;
  rule: Record<string, any>;
}

type HeaderRule = {
    tag: string;
    value: string;
};

export interface HeaderRestriction extends BaseRestriction {
  type: 'headerTags';
  rule: HeaderRule;
}

type IpRule = {
    ipRange: string;
};

export interface IpRestriction extends BaseRestriction {
  type: 'ipAddresses';
  rule: IpRule;
}

type TimeRule = {
    start: string; // You might want to use a more specific type here, like a Date object or moment object
    end: string; // Same as above
};

export interface TimeRestriction extends BaseRestriction {
  type: 'timeOfDay';
  rule: TimeRule;
}

type ExpirationRule = {
    date: Date;
};

export interface ExpirationRestriction extends BaseRestriction {
  type: 'expirationDate';
  rule: ExpirationRule;
}

type Restriction = HeaderRestriction | IpRestriction | TimeRestriction | ExpirationRestriction;

type RestrictionsArray = Restriction[];

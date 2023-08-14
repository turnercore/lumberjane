// User from supabase: Email	Phone	Provider	Created	Last Sign In	User UID	

export type User = {
    id: string;
    email: string;
    phone: string;
    provider: string;
    created_at: Date;
    last_sign_in: Date;
};

export type JwtTokenRequest = {
    name: string
    description?: string
    endpoint: string
    request: string
    restrictions: Array<Object>
    expectedResponse?: string
    method: string
    logEnabled: boolean
    logResponse: boolean
    key: string
    aiEnabled: boolean
    openAIKey?: string
};

export type User = supabase

export type UserProfile = {
    id?: string;
    name?: string;
    email?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    website?: string;
};

export type KeyId = string

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

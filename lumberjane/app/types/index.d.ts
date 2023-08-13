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


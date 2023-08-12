// User from supabase: Email	Phone	Provider	Created	Last Sign In	User UID	

export type User = {
    id: string;
    email: string;
    phone: string;
    provider: string;
    created_at: Date;
    last_sign_in: Date;
};

export type User = supabase

// PROFILE TABLE DEFINITION 
// create table
//   public.profiles (
//     id uuid not null,
//     updated_at timestamp with time zone null,
//     username text null,
//     full_name text null,
//     avatar_url text null,
//     website text null,
//     constraint profiles_pkey primary key (id),
//     constraint profiles_username_key unique (username),
//     constraint profiles_id_fkey foreign key (id) references auth.users (id),
//     constraint username_length check ((char_length(username) >= 3))
//   ) tablespace pg_default;
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


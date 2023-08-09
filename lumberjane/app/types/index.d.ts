export type User = {
    id: number;
    name: string;
    email: string;
};

export type KeyId = string

export type Key = {
    id: KeyId;
    name: string;
    key: string; // This field will store the encrypted key in the format `iv:encryptedkey`
    value?: string; // This field will be used for the decrypted value for display purposes, but won't be stored in the database
    description: string;
    userId: User.id;
    createdAt?: Date;
    isSecret?: boolean;
};

type NewKeyData = Omit<Key, 'id' | 'userId' | 'key' | 'createdAt'>;


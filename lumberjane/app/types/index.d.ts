export type User = {
    id: number;
    name: string;
    email: string;
};

export type Key = {
    id: User.id;
    name: string;
    key: string; // This field will store the encrypted key in the format `iv:encryptedkey`
    value?: string; // This field will be used for the decrypted value for display purposes, but won't be stored in the database
    description: string;
    user_id: number;
};

type NewKeyData = Omit<Key, 'id' | 'user_id' | 'key'>;


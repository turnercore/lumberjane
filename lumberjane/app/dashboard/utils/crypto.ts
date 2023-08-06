export const encrypt = async (text: string) => {
    try {
        const response = await fetch('/api/v1/encrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        const { encrypted } = await response.json();
        return encrypted;
    } catch (error) {
        console.error('Failed to encrypt text:', error);
        throw error;
    }
};

export const decrypt = async (encryptedKey: string) => {
    try {
        const response = await fetch('/api/v1/decrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: encryptedKey }),
        });
        const { decrypted } = await response.json();
        return decrypted;
    } catch (error) {
        console.error('Failed to decrypt text:', error);
        throw error;
    }
};
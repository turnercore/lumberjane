"use client";
import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useAuthContext } from '@/context';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import { Container, Typography, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import KeyForm from './components/KeyForm';
import KeyList from './components/KeyList';
import { Key, NewKeyData } from '@/types';
import { decrypt, encrypt } from './utils/crypto';
import ConfirmationDialog from './components/ConfirmationDialog';

const Dashboard: NextPage = () => {
    const { user } = useAuthContext();
    if (!user) return null;

    const supabase = createClientComponentClient();
    const [keys, setKeys] = useState<Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<number | null>(null);

    useEffect(() => {
        const fetchKeys = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('keys')
                .select('*')
                .eq('userId', user.id);

            setLoading(false);

            if (error) {
                toast.error('Error fetching keys!');
                return;
            }

            const decryptedKeys = await Promise.all(data.map(async (key) => {
                const decryptedValue = await decrypt(key.key);
                return { ...key, value: decryptedValue };
            }));

            setKeys(decryptedKeys);
        };

        fetchKeys();
    }, [user, supabase]);

    const handleAddKey = async (newKey: NewKeyData) => {
        if (!user) return;
        
        if (!newKey.name || !newKey.value) {
            toast.error('Please enter a valid name and value!');
            return;
        }

        //Sanitize inputs
        newKey.name = newKey.name.trim();
        newKey.description = newKey.description?.trim() || '';
        newKey.value = newKey.value.trim();

        const encryptedKey = await encrypt(newKey.value);

        const { data, error } = await supabase
            .from('keys')
            .insert({
                userId: user.id,
                name: newKey.name,
                key: encryptedKey,
                description: newKey.description,
            });

        if (error) {
            toast.error('Error adding key!');
            return;
        }

        if (!data || !Array.isArray(data)) {
            toast.error('Unexpected error: Data array missing.');
            return;
        }
        const decryptedValue = await decrypt(encryptedKey);
        const newKeys = [...keys, { ...(data[0] as Key), value: decryptedValue }];
        setKeys(newKeys);
    };

    const handleDeleteKeyConfirmation = (id: number) => {
        setKeyToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteKey = async () => {
        if (!keyToDelete) return;

        const { error } = await supabase
            .from('keys')
            .delete()
            .eq('id', keyToDelete);

        if (error) {
            toast.error('Error deleting key!');
            return;
        }

        setKeys(keys.filter((key) => key.id !== keyToDelete));
        setDeleteDialogOpen(false);
        setKeyToDelete(null);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>
            {loading ? <CircularProgress /> : (
                <>
                    <KeyForm onAdd={handleAddKey} />
                    <KeyList keys={keys} onDelete={handleDeleteKeyConfirmation} />
                </>
            )}

            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteKey}
                title="Confirm Deletion"
                message="Are you sure you want to delete this key?"
            />
        </Container>
    );
};

export default Dashboard;

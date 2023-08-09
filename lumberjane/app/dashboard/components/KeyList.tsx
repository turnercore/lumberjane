"use client";
import { useState } from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Key } from '@/types';
import { toast } from 'react-toastify';
import { decrypt } from '@/utils/crypto';

const KeyList = ({ keys: initialKeys }: { keys: Key[] }) => {
  const [keys, setKeys] = useState<Key[]>(initialKeys);

  const handleShowKeyValue = async (key: Key) => {
    const decryptedKey = await decrypt(key.key, key.userId.toString(), '');
    return decryptedKey;
  };

  const handleDeleteKey = async (keyId: Key['id']) => {
    try {
      const response = await fetch('/api/v1/keys/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId }),
      });

      const data = await response.json();

      if (data.success) {
        setKeys((prevKeys) => prevKeys.filter((key) => key.id !== keyId));
      } else {
        toast.error('Error deleting key!');
      }
    } catch (error) {
      toast.error('Error deleting key!');
    }
  };

  return (
    <List>
      {keys.map((key) => (
        <ListItem key={key.id}>
          <ListItemText 
            primary={key.name} 
            secondary={handleShowKeyValue(key)} 
          />
          <IconButton edge="end" onClick={() => handleDeleteKey(key.id)}>
            <DeleteIcon />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
};

export default KeyList;

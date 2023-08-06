import React, { useState } from 'react';
import { Button, TextField, Container, Typography } from '@mui/material';
import type { NewKeyData } from '@/types';

type KeyFormProps = {
  onAdd: (key: NewKeyData) => void;
};

const KeyForm: React.FC<KeyFormProps> = ({ onAdd }) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');

  const handleSubmit = () => {
    if (newKeyName && newKeyValue) {
      onAdd({
        name: newKeyName,
        value: newKeyValue,
        description: newKeyDescription,
      });
      setNewKeyName('');
      setNewKeyValue('');
      setNewKeyDescription('');
    }
  };

  return (
    <Container component="form">
      <Typography variant="h6">Add Key</Typography>
      <TextField label="Name" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} fullWidth />
      <TextField label="Value" value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} fullWidth />
      <TextField label="Description" value={newKeyDescription} onChange={(e) => setNewKeyDescription(e.target.value)} fullWidth />
      <Button variant="contained" color="primary" onClick={handleSubmit}>Add Key</Button>
    </Container>
  );
};

export default KeyForm;

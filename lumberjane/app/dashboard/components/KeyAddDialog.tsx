'use client'
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  DialogFooter,
  DialogClose,
} from '@/components/ui';
import { Key } from '@/types';

type KeyAddDialogProps = {
  onAddKey: (key: Key) => void;
};

const KeyAddDialog = ({ onAddKey }: KeyAddDialogProps) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [decryptedValue, setDecryptedValue] = useState<string>('');
  const [isSecret, setIsSecret] = useState<boolean>(false);

  const handleAddKey = () => {
    //validate the form
    if (!name || !description || !decryptedValue) {
      alert('Please fill in all fields!');
      return;
    }
    
    //create a new key object
    const key: Key = {
      name,
      description,
      decryptedValue,
      isSecret,
    };

    onAddKey(key);
    
    //clear the form
    setName('');
    setDescription('');
    setDecryptedValue('');
    setIsSecret(false);

  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>+</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Key</DialogTitle>
          <DialogDescription>Fill in the details for the new key.</DialogDescription>
        </DialogHeader>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="text" placeholder="Key" value={decryptedValue} onChange={(e) => setDecryptedValue(e.target.value)} />
        <label>
          <input type="checkbox" checked={isSecret} onChange={() => setIsSecret(!isSecret)} />
          Password Encrypted
        </label>
      <DialogFooter >
        <DialogClose asChild>
          <Button type="submit" onClick={handleAddKey}>Confirm</Button>
        </DialogClose>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KeyAddDialog;

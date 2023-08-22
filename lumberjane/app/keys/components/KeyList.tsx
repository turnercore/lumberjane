'use client';
import React, { useRef, useState } from 'react';
import type { Key } from '@/types';
import { DialogClose, DialogContent, DialogTrigger, Label, Button, Tooltip, TooltipProvider, TooltipContent, TooltipTrigger, Dialog, DialogHeader } from '@/components/ui';
import KeyAddDialog from '@/components/client/KeyAddDialog';


const KeyList = ({ keys: initialKeys }: { keys: Key[] }) => {
  const [keys, setKeys] = useState<Key[]>(initialKeys);
  const prevKeysLength = useRef(keys.length);
  // State to keep track of the visibility of each key
  const [keyVisibility, setKeyVisibility] = useState<Record<string, boolean>>({});

  // Function to toggle the visibility of a key
  const toggleKeyVisibility = (keyId: string) => {
    setKeyVisibility((prevVisibility) => ({
      ...prevVisibility,
      [keyId]: !prevVisibility[keyId],
    }));
  };

  const addKey = (key: Key) => {
    // Update the key list so the key is visible immediately
    setKeys((prevKeys) => [...prevKeys, key]);
  };

  const handleDeleteKey = (keyToDelete: Key) => {
    //Get Key ID
    const keyId: Key['id'] = keyToDelete.id;

    fetch('/api/v1/keys/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setKeys((prevKeys) => prevKeys.filter((key) => key?.id !== keyId));
        } else {
          console.log('Error deleting key!');
        }
      })
      .catch((error: any) => {
        console.log('Error deleting key!');
      });

      // Delete key from state
      setKeys((prevKeys) => prevKeys.filter((key) => key?.id !== keyId));
  };

  return (
      <div className="divide-y divide-gray-200 m-3 p-2">
        {keys.map((key, index) => (
          <div key={key?.id} className="flex justify-between items-center py-2">
            <div className='mb-4'>
              <h3 className="font-bold text-lg">{key?.name}</h3>
              <p className='text-sm'>{key?.description}</p>
              <p>
                {keyVisibility[key?.id!] // Check if the key is visible
                  ? keys[index].decryptedValue || 'error'
                  : '*****************************************************'}
              </p>
            </div>
            <div className="space-x-2">
            <Button onClick={() => toggleKeyVisibility(key?.id!)}>
                {keyVisibility[key?.id!] ? 'Hide' : 'Show'}
            </Button>
            <Dialog>
              <DialogTrigger> 
              <Button variant="destructive">
                Delete
              </Button>
              </DialogTrigger>
              <DialogContent className='text-center'>
                <DialogHeader className='text-center'>
                  <h1 className="text-lg font-bold text-center">Delete Key "{key?.name?.toUpperCase()}"</h1>
                </DialogHeader>
                <h2>Are you sure you want to delete this key?</h2>
                <div className='flex justify-center space-x-2'>
                  <DialogClose>
                    <Button variant='default'>No, Take me to Safety</Button>
                  </DialogClose>
                    <Button variant='destructive' onClick={() => handleDeleteKey(key)}>Delete It!</Button>
                </div>
              </DialogContent>
            </Dialog>

            </div>
          </div>
        ))}
        <KeyAddDialog onAddKey={addKey}>
          <Button variant="default">Add Key</Button>
        </KeyAddDialog>
      </div>
  );
};

export default KeyList;
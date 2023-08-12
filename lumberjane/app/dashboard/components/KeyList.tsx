"use client";
import React, { useRef, useEffect, useState } from 'react';
import type { Key } from '@/types';
import { Button, Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui';
import KeyAddDialog from './KeyAddDialog';


const KeyList = ({ keys: initialKeys }: { keys: Key[] }) => {
  const [keys, setKeys] = useState<Key[]>(initialKeys);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const prevKeysLength = useRef(keys.length);

  const addKey = (key: Key) => {
    setKeys((prevKeys) => [...prevKeys, key]);
  };

  useEffect(() => {
    if (keys.length > prevKeysLength.current) {
      // A key has been added, add the key to Supabase
      const key = keys[keys.length - 1];

      if (key) {
        fetch('http://localhost:3000/api/v1/keys/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              console.log('Key added to Supabase!');
            } else {
              console.log('Error adding key to Supabase!');
            }
          })
          .catch((error: any) => {
            console.log('Error adding key to Supabase!');
          });
      }
      prevKeysLength.current = keys.length; // Update the reference to the new length
    }
  }, [keys]);

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
          setKeys((prevKeys) => prevKeys.filter((key) => key.id !== keyId));
        } else {
          console.log('Error deleting key!');
        }
      })
      .catch((error: any) => {
        console.log('Error deleting key!');
      });

      // Delete key from state
      setKeys((prevKeys) => prevKeys.filter((key) => key.id !== keyId));
  };

  return (
    <TooltipProvider>
      <div className="divide-y divide-gray-200">
        {keys.map((key, index) => (
          <div key={key.id} className="flex justify-between items-center py-2">
            <div>
              <p className="font-bold">{key.name}</p>
              <Tooltip>
                <TooltipTrigger>
                  <p>{keys[index].decryptedValue ? keys[index].decryptedValue : 'error'}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{key.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button
              variant="destructive"
              onClick={() => handleDeleteKey(key)}
            >
              Delete
            </Button>
          </div>
        ))}
        <KeyAddDialog onAddKey={addKey} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
      </div>
    </TooltipProvider>
  );
};

export default KeyList;

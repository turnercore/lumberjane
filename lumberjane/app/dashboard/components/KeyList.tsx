"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import type { Key } from '@/types';
import { Button, Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui';


const KeyList = ({ keys: initialKeys }: { keys: Key[] }) => {
  const [keys, setKeys] = useState<Key[]>(initialKeys);

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
      </div>
    </TooltipProvider>
  );
};

export default KeyList;

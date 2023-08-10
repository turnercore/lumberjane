// 'use client';

// import React, { useState } from 'react';
// import { Button, TextField, Container, Typography } from '@mui/material';
// import type { NewKeyData } from '@/types';
// import { encrypt } from '@/utils/crypto';
// import { toast } from 'react-toastify';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import type { User } from '@supabase/auth-helpers-nextjs'


// type KeyFormProps = {
//   onAdd: (key: NewKeyData) => void;
// };

// const KeyForm: React.FC<KeyFormProps> = ({ onAdd }) => {
//   const supabase = createClientComponentClient();
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState<User | null>(null);
//   const [newKeyName, setNewKeyName] = useState('');
//   const [newKeyValue, setNewKeyValue] = useState('');
//   const [newKeyDescription, setNewKeyDescription] = useState('');
//   const userId = user?.id || '';


//   const handleSubmit = async () => {

//     if (!user || userId === '') {
//       //Throw an error, unable to get user id
//       console.log("unable to get userid when submitting form")
//       toast.error('Unable to get user id when submitting form');
//       return;
//     }

//     if (newKeyName && newKeyValue) {
//       // Encrypt the key value before sending it to the server
//       const encryptedValue = await encrypt(newKeyValue, userId, '');
      
//       onAdd({
//         name: newKeyName,
//         value: encryptedValue,
//         description: newKeyDescription,
//       });
      
//       setNewKeyName('');
//       setNewKeyValue('');
//       setNewKeyDescription('');
//     }
//   };

//   return (
//     <Container component="form">
//       <Typography variant="h6">Add Key</Typography>
//       <TextField label="Name" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} fullWidth />
//       <TextField label="Value" value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} fullWidth />
//       <TextField label="Description" value={newKeyDescription} onChange={(e) => setNewKeyDescription(e.target.value)} fullWidth />
//       {/* <Button variant="contained" color="primary" onClick={handleSubmit}>Add Key</Button> */}
//     </Container>
//   );
// };

// export default KeyForm;


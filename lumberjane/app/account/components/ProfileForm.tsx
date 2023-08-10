'use client';
import { useState } from 'react';
import { Avatar, Button, TextField, Typography } from '@mui/material';
import SignOutButton from '@/clientComponents/SignOutButton';
import type { User } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import type { UserProfile } from '@/types';


//Fields that we don't want the user to be able to update directly should go here
const omitFields = ['id', 'updated_at', 'avatar_url'];

type ProfileFormProps = {
  profile: UserProfile;
  user: User;
};

const ProfileForm = ({ profile, user }: ProfileFormProps) => {
  const [formProfile, setFormProfile] = useState<UserProfile>(profile);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormProfile({ ...formProfile, [field]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formProfile),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(`Error updating the data: ${error.message}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '0.5rem',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <Avatar alt="User's Avatar" src={formProfile.avatar_url?.toString()} style={{ width: '250px', height: '250px' }} />
      <Typography variant="h6">{user.email}</Typography>
      {Object.keys(formProfile)
        .filter((key) => !omitFields.includes(key))
        .map((key) => (
          <TextField
            key={key}
            id={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize the label
            variant="outlined"
            value={formProfile[key as keyof UserProfile] || ''}
            onChange={(e) => handleChange(key as keyof UserProfile, e.target.value)}
            style={{ width: '100%' }}
          />
        ))}
      <Button variant="contained" color="primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>
        {'Update'}
      </Button>
      <SignOutButton />
    </form>
  );
};

export default ProfileForm;

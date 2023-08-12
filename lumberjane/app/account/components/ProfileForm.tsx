'use client';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback, Input, Button } from '@/components/ui';
import SignOutButton from '@/components/client/SignOutButton';
import type { User } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import type { UserProfile } from '@/types';

// Fields that we don't want the user to be able to update directly should go here
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
      className="flex flex-col items-center gap-4 p-4 border rounded-md max-w-md mx-auto"
    >
      <Avatar className='floating-element w-64 h-64'>
        <AvatarImage className='"w-full h-full object-cover object-center"' src={formProfile.avatar_url?.toString()} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="text-lg">{user.email}</div>
      {Object.keys(formProfile)
        .filter((key) => !omitFields.includes(key))
        .map((key) => (
          <Input
            key={key}
            id={key}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize the label
            value={formProfile[key as keyof UserProfile] || ''}
            onChange={(e: { target: { value: any; }; }) => handleChange(key as keyof UserProfile, e.target.value)}
            className="w-full"
          />
        ))}
      <Button>
        {'Update'}
      </Button>
      <SignOutButton />
    </form>
  );
};

export default ProfileForm;

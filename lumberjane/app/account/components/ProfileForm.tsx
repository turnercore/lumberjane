'use client';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback, Input, Button, Label, Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from '@/components/ui';
import SignOutButton from '@/components/client/SignOutButton';
import type { User } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import type { UserProfile } from '@/types';

// Fields that we don't want the user to be able to update directly should go here
const omitFields = ['id', 'updated_at', 'avatar_url', 'user_id'];

type ProfileFormProps = {
  profile: UserProfile;
  user: User;
};

const ProfileForm = ({ profile, user }: ProfileFormProps) => {
  const [formProfile, setFormProfile] = useState<UserProfile>(profile);
  const [profileDataChanged, setProfileDataChanged] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfileDataChanged(true);
    setFormProfile({ ...formProfile, [field]: value });
  };

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  }

  const handleConfirmPasswordChange = (e: any) => {
    setConfirmPassword(e.target.value);
    if(e.target.value === password) setProfileDataChanged(true);
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match!');
        return;
      }
      if (!profileDataChanged) {
        toast.error('No changes to update!');
        return;
      }
      if (password && password.length < 8) {
        toast.error('Password must be at least 8 characters!');
        return;
      }
      const payload = { ...formProfile, password };
      const response = await fetch('http://localhost:3000/api/v1/profiles/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Profile updated!');
      setProfileDataChanged(false);
    } catch (error: any) {
      toast.error(`Error updating the data: ${error.message}`);
    }
  };

  return (

    <Card className="mx-auto max-w-sm shadow-md">
    <CardHeader className="justify-center text-center">
      <CardTitle>Lumberjane Profile</CardTitle>
      <CardDescription>Update your profile</CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} id="profileForm">
        <Avatar className='always-floating-element w-64 h-64 mx-auto'>
          <AvatarImage className="object-cover object-center" src={formProfile.avatar_url?.toString()} />
          <AvatarFallback>{profile.username ? profile.username?.charAt(0) : '🪵'}</AvatarFallback>
        </Avatar>
        <h4 className="text-lg text-center">{user.email}</h4>

        {Object.keys(formProfile)
          .filter((key) => !omitFields.includes(key))
          .map((key) => (
            <div>
              <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</Label>
              <Input
                key={key}
                id={key}
                placeholder={key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} // Turn _ into spaces and capitalize the first letter
                value={formProfile[key as keyof UserProfile] || ''}
                onChange={(e: { target: { value: any; }; }) => handleChange(key as keyof UserProfile, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
          <div> 
            <Label htmlFor='email' className='justify-evenly'>Email</Label>
            <Input type='email' id='email' value={user.email} className="w-full" disabled />
          </div>
          <div>
            <Label htmlFor='password' className='justify-evenly' >New Password</Label>
            <Input type='password' id='password' value={password} placeholder='********' className="w-full" onBlur={handlePasswordChange}/>
            <Label htmlFor='confirmPassword' className='justify-evenly'>Confirm Password</Label>
            <Input type='password' id='confirmPassword' value={confirmPassword} placeholder='********' className="w-full" onBlur={handleConfirmPasswordChange} />
          </div>
      </form>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button type='submit' form="profileForm">
        {'Update'}
      </Button>
      <SignOutButton />
    </CardFooter>
  </Card>

    
  );
};

export default ProfileForm;

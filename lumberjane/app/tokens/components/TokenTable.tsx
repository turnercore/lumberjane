'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  DialogContent,
  DialogTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  ScrollArea,
  ScrollBar,
} from "@/components/ui";
import type { TokenData } from '@/types';
import { toast } from 'react-toastify';
import Link from 'next/link'; 

// Function to decode the token content
function decodeTokenContent(token: string) {
  // Your logic to decode the token content
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const payload = JSON.parse(atob(base64));
  return JSON.stringify(payload, null, 2);
}

// Function to extract variables from the token
function extractVariables(token: TokenData) {
  const tokenString: string = decodeTokenContent(token.token);
  const variables = tokenString.match(/\$\$(.*?)\$\$/g);
  return variables ? variables.map((v) => v.replace(/\$\$/g, '')) : [];
}

type TokenTableProps = {
  passedTokens: TokenData[];
};

export default function TokenTable({passedTokens = []}: TokenTableProps) {
  const [tokens, setTokens] = useState<TokenData[]>(passedTokens);
  if (!passedTokens) {
    toast.error('No tokens found!');
    
    return (<Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Content</TableHead>
        <TableHead>Variables</TableHead>
        <TableHead>Times Used</TableHead>
        <TableHead>Times AI Assisted</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody> </TableBody>
      </Table>)
  };

  
  const supabase = createClientComponentClient();
  
  if (!supabase) return (<div></div>);

  const updateTokenStatus = async (token: TokenData, status: TokenData['status']) => {
    //update the local state
    const updatedTokens = tokens.map((t: TokenData) => {
      if (t.id === token.id) {
        return { ...t, status };
      }
      return t;
    });
    setTokens(updatedTokens);

    const { data, error } = await supabase
      .from('tokens')
      .update({ status })
      .eq('id', token.id);
  
    if (error) {
      toast.error('Error updating token status!');
      return null;
    }

  
    return data;
  };

  return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Variables</TableHead>
            <TableHead>Times Used</TableHead>
            <TableHead>Times AI Assisted</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.id} className={token.status === 'frozen' ? 'bg-blue-100' : token.status === 'deleted' ? 'bg-red-100' : ''}>
              <TableCell className='font-bold'>{token.name}</TableCell>
              <TableCell>{token.description}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger className='underline cursor-pointer'>
                    View
                  </DialogTrigger>
                  <DialogContent className='p-3 max-w-3xl'>
                    <ScrollArea className="h-full w-full rounded-md border">
                      <pre>{decodeTokenContent(token.token)}</pre>
                      <ScrollBar orientation='horizontal' className='w-full' />
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>
                {extractVariables(token).map((variable, index) => (
                  <div key={index}>{variable}</div>
                ))}
              </TableCell>
              <TableCell>{token.times_used}</TableCell>
              <TableCell>{token.times_ai_assisted}</TableCell>
              <TableCell>
                <Select defaultValue={token.status} 
                    onValueChange={(value: TokenData['status']) => {
                      console.log('token ' + token.id + ' status changed to ' + value);
                      // Update token status
                      updateTokenStatus(token, value);
                    }
                }>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Token Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="active" className='bg-green-600'>✅ Active</SelectItem>
                      <SelectItem value="frozen" className=' bg-blue-400'>❄️ Frozen</SelectItem>
                      <SelectItem value="deleted" className=' bg-red-600'>❌ Deleted</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableCaption>
        <Button asChild>
          <Link href="/tokens/create">Create a token</Link>
        </Button>
        </TableCaption>
      </Table>
  );
};
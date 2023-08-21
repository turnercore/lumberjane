'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  DialogContent,
  DialogTrigger,
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

// ----- Helper functions -----

const fetchDeletedTokens = async () => {
  const supabase = createClientComponentClient();
  if (!supabase) return null;

  const user = (await supabase.auth.getSession()).data.session?.user;
  if (!user) {
    console.log('You must be logged in to view this page!');
    return null;
  }

  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'deleted');

  if (error) {
    console.log('Error fetching deleted tokens!');
    return null;
  }

  return data;
};

// Function to decode the token content
function decodeTokenContent(token: string) {
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

const DeletedTokensDashboard: React.FC = () => {
  const supabase = createClientComponentClient();
  if (!supabase) return null;

  const [tokens, setTokens] = useState<TokenData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchDeletedTokens();
      setTokens(data || []);
    };

    fetchData();
  }, []);

  return (
    <Card className="mx-auto max-w-5xl mb-20 p-3 shadow-md">
      <CardHeader className='text-center'>
        <h1 className="text-2xl font-bold">Your Deleted Tokens</h1>
      </CardHeader>
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
            <TableRow key={token.id}>
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
                  <div key={index}>"{variable}"</div>
                ))}
              </TableCell>
              <TableCell>{token.times_used}</TableCell>
              <TableCell>{token.times_ai_assisted}</TableCell>
              <TableCell>{token.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default DeletedTokensDashboard;

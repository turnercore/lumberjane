import { NextPage } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import { Container, Typography, CircularProgress } from '@mui/material';
// import KeyForm from './components/KeyForm';
import KeyList from './components/KeyList';
import { Key, NewKeyData } from '@/types';
import { cookies } from 'next/headers';
// import ConfirmationDialog from './components/ConfirmationDialog';

const Dashboard: NextPage = async () => {
    const supabase = createServerComponentClient({ cookies });
    if (!supabase) return null;

    const user = (await supabase.auth.getSession()).data.session?.user;

    if (!user) {
        toast.error('You must be logged in to view this page!');
        return null;
    }

    let keys: Key[] = [];
    let loading = true;

    const { data, error } = await supabase
        .from('keys')
        .select('*')
        .eq('userId', user.id);

    if (data && Array.isArray(data)) {
        keys = data;
        loading = false;
    } else if (error) {
        toast.error('Error fetching keys!');
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>
            {loading ? <CircularProgress /> : (
                <>
                    <KeyList keys={keys} />
                </>
            )}
        </Container>
    );
};

export default Dashboard;
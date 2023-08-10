"use client";
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/serverComponents/Header'
import LoginMagicLinkForm from '@/clientComponents/LoginMagicLinkForm'
import type { User } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType>({user: null, signOut: () => {}})

type AuthContextProviderProps = {
    children: React.ReactNode;
};

type AuthContextType = {
    user: User | null;
    signOut: () => void;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
    const supabase = createClientComponentClient()
    const [user, setUser] = useState<User | null>(null)

    const onAuthStateChange = async () => { 
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        onAuthStateChange()
    }, [])

    const handleSignOut = () => {
        //clear user state
        setUser(null)
        //sign out of supabase
        supabase.auth.signOut()
    }

    const value: AuthContextType = useMemo(() => {
        return {
            user,
            signOut: () => handleSignOut(),
        }
    }, [user])
      
    return (
        <AuthContext.Provider value={value}>
            {user ? children : <LoginMagicLinkForm />}
        </AuthContext.Provider>
    )

    // Error in return: Type 'AuthContextType' is not assignable to type '{ user: null; signOut: () => void; }'.
//   Types of property 'user' are incompatible.
//     Type 'User | null' is not assignable to type 'null'.
//       Type 'User' is not assignable to type 'null'.ts(2322)
// index.d.ts(370, 9): The expected type comes from property 'value' which is declared here on type 'IntrinsicAttributes & ProviderProps<{ user: null; signOut: () => void; }>'
}

export const useAuthContext = (): AuthContextType => {
    const { user, signOut } = useContext(AuthContext)
    return { user, signOut }
}
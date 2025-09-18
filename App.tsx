import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { GeneratorPage } from './components/GeneratorPage';
import { supabase, supabaseConfigError } from './services/dbService';
import { User } from './types';

const ConfigErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
    <div className="w-full max-w-2xl bg-base-200 p-8 rounded-lg shadow-lg text-center border border-red-500/50">
      <h1 className="text-2xl font-bold text-red-400 mb-4">Application Configuration Error</h1>
      <p className="text-base-content">{message}</p>
      <p className="text-gray-400 mt-4 text-sm">Please check your environment variables or contact support.</p>
    </div>
  </div>
);


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseConfigError) {
      setLoading(false);
      return;
    }

    const getSession = async () => {
        const { data: { session } } = await supabase!.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      // FIX: The unsubscribe method is on the `subscription` property of the authListener object.
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  if (supabaseConfigError) {
    return <ConfigErrorDisplay message={supabaseConfigError} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <GeneratorPage user={user} onLogout={handleLogout} />;
};

export default App;

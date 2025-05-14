import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';
import RoleRouter from './RoleRouter';

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return session ? <RoleRouter /> : <Login />;
}

export default App;
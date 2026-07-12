import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useAdminAccess() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      if (authLoading) return;
      if (!user || !supabase) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data, error } = await supabase.rpc('is_coffeemind_admin');
      if (cancelled) return;
      if (error) {
        console.warn('Unable to verify admin access:', error.message);
        setIsAdmin(false);
      } else {
        setIsAdmin(Boolean(data));
      }
      setLoading(false);
    }

    void checkAccess();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  return { isAdmin, loading };
}

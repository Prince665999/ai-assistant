import { useAuthContext } from '../contexts/AuthContext';

// Thin named export so screens can `import { useAuth } from '../hooks/useAuth'`
// consistently with the other hooks, instead of reaching into the context directly.
export function useAuth() {
  return useAuthContext();
}

export default useAuth;

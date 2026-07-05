// The actual implementation lives in contexts/AuthContext.js (it needs to
// live next to the Provider). This re-export just keeps the import path
// consistent with the rest of the hooks/ folder: `import { useAuth } from
// '../hooks/useAuth'` reads the same everywhere, regardless of where the
// hook is actually defined.

export { useAuth as default, useAuth } from '../contexts/AuthContext';

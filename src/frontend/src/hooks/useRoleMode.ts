import { useState, useEffect } from 'react';

export type RoleMode = 'admin' | 'vendor' | null;

const ROLE_MODE_KEY = 'marketplace_role_mode';

export function useRoleMode() {
  const [roleMode, setRoleModeState] = useState<RoleMode>(() => {
    const stored = localStorage.getItem(ROLE_MODE_KEY);
    return (stored === 'admin' || stored === 'vendor') ? stored : null;
  });

  useEffect(() => {
    if (roleMode) {
      localStorage.setItem(ROLE_MODE_KEY, roleMode);
    } else {
      localStorage.removeItem(ROLE_MODE_KEY);
    }
  }, [roleMode]);

  const setRoleMode = (mode: RoleMode) => {
    setRoleModeState(mode);
  };

  const clearRoleMode = () => {
    setRoleModeState(null);
  };

  return {
    roleMode,
    setRoleMode,
    clearRoleMode,
    isAdmin: roleMode === 'admin',
    isVendor: roleMode === 'vendor',
  };
}

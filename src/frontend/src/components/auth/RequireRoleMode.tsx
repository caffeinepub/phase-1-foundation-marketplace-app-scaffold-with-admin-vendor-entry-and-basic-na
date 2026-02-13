import { type ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRoleMode, type RoleMode } from '../../hooks/useRoleMode';

interface RequireRoleModeProps {
  children: ReactNode;
  requiredMode: 'admin' | 'vendor';
}

export default function RequireRoleMode({ children, requiredMode }: RequireRoleModeProps) {
  const { roleMode } = useRoleMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleMode) {
      navigate({ to: '/select-role' });
    }
  }, [roleMode, navigate]);

  if (!roleMode) {
    return null;
  }

  return <>{children}</>;
}

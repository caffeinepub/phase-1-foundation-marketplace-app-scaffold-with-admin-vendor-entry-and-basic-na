import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useRoleMode } from '../../hooks/useRoleMode';
import { useNavigate } from '@tanstack/react-router';

export default function AuthControls() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { clearRoleMode } = useRoleMode();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    clearRoleMode();
    clear();
    navigate({ to: '/' });
  };

  if (identity) {
    const principal = identity.getPrincipal().toString();
    const shortPrincipal = `${principal.slice(0, 5)}...${principal.slice(-3)}`;

    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-sm text-muted-foreground">
          {shortPrincipal}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleLogin}
      disabled={isLoggingIn}
    >
      <LogIn className="h-4 w-4 mr-2" />
      {isLoggingIn ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

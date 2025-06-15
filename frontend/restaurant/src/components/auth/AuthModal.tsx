
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ChangePasswordForm from './ChangePasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'change-password';
}

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register' | 'change-password'>(initialMode);

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Sign In';
      case 'register': return 'Create Account';
      case 'change-password': return 'Change Password';
      default: return 'Authentication';
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return <LoginForm onToggleMode={setMode} />;
      case 'register':
        return <RegisterForm onToggleMode={setMode} />;
      case 'change-password':
        return <ChangePasswordForm onToggleMode={setMode} />;
      default:
        return <LoginForm onToggleMode={setMode} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">{getTitle()}</DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

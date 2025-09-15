// Veraltet
// ./src/Ordnung/Benutzer/AuthDialog.tsx

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKartenStore } from '@/Ordnung/DatenBank/KartenStore';
import { Loader2 } from 'lucide-react';
import { OrphanedCardsDialog } from './OrphanedCardsDialog';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { users, registerUser, login, checkForOrphanedCards } = useKartenStore();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOrphanedDialog, setShowOrphanedDialog] = useState(false);

  const userExists = useMemo(() => {
    if (!name) return false;
    return users.some(user => user.name === name);
  }, [name, users]);

  const handleAuthSuccess = () => {
    if(checkForOrphanedCards()){
      setShowOrphanedDialog(true);
    }
    onOpenChange(false);
  };

  const handleRegister = async () => {
    if (name && password) {
      setIsLoading(true);
      const success = await registerUser(name, password);
      setIsLoading(false);
      if (success) {
        handleAuthSuccess();
      }
    }
  };

  const handleLogin = async () => {
    if (name && password) {
      setIsLoading(true);
      const success = await login(name, password);
      setIsLoading(false);
      if (success) {
        handleAuthSuccess();
      }
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      if (userExists && password) {
        handleLogin();
      } else if (!userExists && name && password) {
        handleRegister();
      }
    }
  };

  return (
      <>
        <Dialog open={open && !showOrphanedDialog} onOpenChange={onOpenChange}>
          <DialogContent onKeyDown={handleKeyDown} className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{userExists ? 'Anmelden' : 'Registrieren'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <EingabeZeile
                id="name"
                label="Benutzername"
                wert={name ?? ''}
                setWert={setName}
                isLoading={isLoading}
              />
              <EingabeZeile
                id="password"
                label="Passwort"
                wert={password ?? ''}
                setWert={setPassword}
                isLoading={isLoading}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant={userExists ? "destructive" : "secondary"}
                onClick={handleRegister} 
                disabled={!name || !password || userExists || isLoading}
              >
                {isLoading && !userExists ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Registrieren
              </Button>
              <Button 
                type="button" 
                onClick={handleLogin} 
                disabled={!name || !password || !userExists || isLoading}
                variant={userExists ? "default" : "destructive"}
              >
                {isLoading && userExists ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Anmelden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <OrphanedCardsDialog 
          open={showOrphanedDialog} 
          onOpenChange={setShowOrphanedDialog}
          userId='' 
        />
      </>
  );
}


function EingabeZeile(
  { id, label, wert, setWert, isLoading }:{ 
    id: string,
    label: string,
    wert: string, 
    setWert: (value: string) => void, 
    isLoading: boolean, 
  }
) {

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">{label}</Label>
      <Input 
        id={id} 
        type={id} 
        value={wert ?? ''} 
        onChange={(e) => setWert(e.target.value)} 
        className="col-span-3" 
        disabled={isLoading} 
      />
    </div>
  )
}

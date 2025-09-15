// ./src/Ordnung/Dialoge/AnmeldeDialog.tsx
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKartenStore } from '@/Ordnung/DatenBank/KartenStore';
import { Loader2, ChevronLeft, ChevronDown } from 'lucide-react';
import type { AnmeldeDialogArgumente } from '../Dialoge.types';
import { EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons';
import { OrphanedCardsDialog } from '@/Ordnung/Benutzer/OrphanedCardsDialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export function AuthDialog(argumente: AnmeldeDialogArgumente) {
  const { open, onOpenChange } = argumente;
  const { users, registerUser, login, checkForOrphanedCards } = useKartenStore();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOrphanedDialog, setShowOrphanedDialog] = useState(false);

  const userExists = useMemo(
    () => (name ? users.some(user => user.name === name) : false),
    [name, users]
  );

  const handleAuthSuccess = () => {
    if (checkForOrphanedCards()) setShowOrphanedDialog(true);
    onOpenChange(false);
  };

  const handleRegister = async () => {
    if (!name || !password) return;
    setIsLoading(true);
    const success = await registerUser(name, password);
    setIsLoading(false);
    if (success) handleAuthSuccess();
  };

  const handleLogin = async () => {
    if (!name || !password) return;
    setIsLoading(true);
    const success = await login(name, password);
    setIsLoading(false);
    if (success) handleAuthSuccess();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      if (userExists && password) handleLogin();
      else if (!userExists && name && password) handleRegister();
    }
  };

  // extrahiere reine Namenliste
  const benutzerListe = useMemo(() => users.map(u => u.name), [users]);

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
              wert={name}
              setWert={setName}
              isLoading={isLoading}
              // nur für Benutzername: Dropdown mit Chevron
              benutzerListe={benutzerListe}
            />

            <EingabeZeile
              id="password"
              label="Passwort"
              wert={password}
              setWert={setPassword}
              isLoading={isLoading}
              istPasswort
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant={userExists ? 'destructive' : 'secondary'}
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
              variant={userExists ? 'default' : 'destructive'}
            >
              {isLoading && userExists ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Anmelden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrphanedCardsDialog open={showOrphanedDialog} onOpenChange={setShowOrphanedDialog} userId="" />
    </>
  );
}

function EingabeZeile({
  id,
  label,
  wert,
  setWert,
  isLoading,
  istPasswort = false,
  benutzerListe,
}: {
  id: string;
  label: string;
  wert: string;
  setWert: (value: string) => void;
  isLoading: boolean;
  istPasswort?: boolean;
  benutzerListe?: string[];
}) {
  const [sichtbar, setSichtbar] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const inputType = istPasswort ? (sichtbar ? 'text' : 'password') : 'text';
  const showBenutzerDropdown = !istPasswort && (benutzerListe?.length ?? 0) > 0;

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>

      <div className="col-span-3 relative">
        <Input
          id={id}
          type={inputType}
          value={wert ?? ''}
          onChange={e => setWert(e.target.value)}
          className="pr-9"
          disabled={isLoading}
          autoComplete={istPasswort ? 'current-password' : 'username'}
        />

        {istPasswort && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label={sichtbar ? 'Passwort verbergen' : 'Passwort anzeigen'}
            onClick={() => setSichtbar(v => !v)}
            tabIndex={-1}
          >
            {sichtbar ? <EyeClosedIcon className="h-4 w-4" /> : <EyeOpenIcon className="h-4 w-4" />}
          </button>
        )}

        {showBenutzerDropdown && (
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="Benutzerliste öffnen"
              >
                {dropdownOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="max-h-64 w-[240px] overflow-auto"
            >
              {benutzerListe!.map(name => (
                <DropdownMenuItem
                  key={name}
                  onClick={() => {
                    setWert(name);
                    setDropdownOpen(false);
                  }}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
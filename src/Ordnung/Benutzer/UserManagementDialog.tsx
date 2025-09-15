
// ./src/Ordnung/Benutzer/UserManagementDialog.tsx

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { useKartenStore } from '@/Ordnung/DatenBank/KartenStore';
import { Label } from '@/components/ui/label';
import { PrivateKartenDialog } from './PrivateKartenDialog';
import { PublicKartenDialog } from './PublicKartenDialog';

interface UserManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
  const { currentUser, logout, deleteUser } = useKartenStore();
  const [privateKartenDialogOpen, setPrivateKartenDialogOpen] = useState(false);
  const [publicKartenDialogOpen, setPublicKartenDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onOpenChange(false);
  };

  const handleDeleteUser = () => {
    if (currentUser) {
      deleteUser(currentUser.id);
      onOpenChange(false); // Schließt den UserManagementDialog
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzerverwaltung</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center font-bold text-xl"
                style={{ 
                  backgroundColor: currentUser.profilePicture?.backgroundColor,
                }}
              >
                {currentUser.profilePicture?.initials || currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <Label>Benutzername</Label>
                <p className="font-semibold text-lg">{currentUser.name}</p>
                <Label className="text-xs text-gray-500">ID: {currentUser.id}</Label>
              </div>
            </div>

            <div className="pt-4 flex flex-col space-y-2">
              <Button variant="outline" disabled>Passwort ändern (TODO)</Button>
              <Button variant="outline" onClick={() => setPrivateKartenDialogOpen(true)}>Private Karten verwalten</Button>
              <Button variant="outline" onClick={() => setPublicKartenDialogOpen(true)}>Öffentliche Karten verwalten</Button>
            </div>
          </div>
          <DialogFooter className="justify-between items-center">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Profil löschen</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Diese Aktion kann nicht rückgängig gemacht werden. Dadurch werden Ihr Konto und alle Ihre privaten Karten dauerhaft gelöscht.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUser}>
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            <Button variant="secondary" onClick={handleLogout}>Abmelden</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PrivateKartenDialog open={privateKartenDialogOpen} onClose={() => setPrivateKartenDialogOpen(false)} />
      <PublicKartenDialog open={publicKartenDialogOpen} onClose={() => setPublicKartenDialogOpen(false)} />
    </>
  );
}

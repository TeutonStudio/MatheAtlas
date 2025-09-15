
// ./src/Ordnung/Benutzer/Benutzer.tsx

import { useState, useEffect } from 'react';
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthDialog } from "@/Ordnung/Dialoge/AnmeldeDialog.tsx"; // './AuthDialog';
import { UserManagementDialog } from './UserManagementDialog';
import { OrphanedCardsDialog } from './OrphanedCardsDialog';

export default function BenutzerFußleiste() {
  const { currentUser, db } = useKartenStore();
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isUserManagementOpen, setUserManagementOpen] = useState(false);
  const [isOrphanedCardsOpen, setOrphanedCardsOpen] = useState(false);
  const [prevUser, setPrevUser] = useState(currentUser);

  useEffect(() => {
    // Prüfen, ob sich der Benutzer gerade angemeldet hat
    if (currentUser && !prevUser) {
      const hasOrphanedCards = Object.values(db).some(karte => karte.userId === null && karte.scope === 'private');
      if (hasOrphanedCards) {
        setOrphanedCardsOpen(true);
      }
    }
    setPrevUser(currentUser);
  }, [currentUser, prevUser, db]);

  const handleFooterClick = () => {
    if (currentUser) {
      setUserManagementOpen(true);
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <>
      <div onClick={handleFooterClick} className="flex items-center space-x-4 cursor-pointer p-2 rounded-md hover:bg-accent">
        {currentUser ? (
          <>
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white"
              style={{ 
                backgroundColor: currentUser.profilePicture?.backgroundColor || '#a0aec0',
              }}
            >
              {currentUser.profilePicture?.initials || currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">{currentUser.name}</span>
              <span className="text-xs text-muted-foreground">ID: {currentUser.id}</span>
            </div>
          </>
        ) : (
          <>
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </>
        )}
      </div>

      <AuthDialog open={isAuthOpen} onOpenChange={setAuthOpen} />
      {currentUser && (
          <UserManagementDialog open={isUserManagementOpen} onOpenChange={setUserManagementOpen} />
      )}
      {currentUser && (
        <OrphanedCardsDialog 
          open={isOrphanedCardsOpen} 
          onOpenChange={setOrphanedCardsOpen} 
          userId={currentUser.id} 
        />
      )}
    </>
  );
}

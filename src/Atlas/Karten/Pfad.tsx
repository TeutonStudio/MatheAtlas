/// ./src/Atlas/Karten/Pfad.tsx

import React from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore.ts";
import { Verlauf } from '@/Ordnung/datenbank.types';
import { erhalteText } from '@Karten/methoden';
  
export default function Pfad() {
    const verlauf = useKartenStore(s => s.verlauf);
    const geheZurückZu = useKartenStore(s => s.geheZurückZu);
    const activeId = useKartenStore(s => s.aktiveKarteId);
    
    return (
      <Breadcrumb>
        <BreadcrumbList>
            {verlauf.map((v: Verlauf, idx: number) => (
                <React.Fragment key={v.id}>
                    <BreadcrumbItem>
                        {idx === verlauf.length - 1 && activeId === v.id ? (
                            <BreadcrumbPage>{erhalteText(v)}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink onClick={() => geheZurückZu(v.id)}>{erhalteText(v)}</BreadcrumbLink>
                        )}
                    </BreadcrumbItem>
                    {idx < verlauf.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
            ))}
        </BreadcrumbList>
      </Breadcrumb>
  )
}
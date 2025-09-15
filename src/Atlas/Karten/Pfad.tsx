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
  
export default function Pfad() {
    const verlauf = useKartenStore(s => s.verlauf);
    const geheZurückZu = useKartenStore(s => s.geheZurückZu);
    const activeId = useKartenStore(s => s.aktiveKarteId);

    return (
      <Breadcrumb>
        <BreadcrumbList>
            {verlauf.map((v, i) => (
                <React.Fragment key={v.id}>
                    <BreadcrumbItem>
                        {i === verlauf.length - 1 && activeId === v.id ? (
                            <BreadcrumbPage>{v.name}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink onClick={() => geheZurückZu(v.id)}>{v.name}</BreadcrumbLink>
                        )}
                    </BreadcrumbItem>
                    {i < verlauf.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
            ))}
        </BreadcrumbList>
      </Breadcrumb>
  )
  }
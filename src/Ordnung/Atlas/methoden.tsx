/// ./src/Ordnung/Atlas/methoden.tsx

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type InhaltWrapperProps = { children?: React.ReactNode };

type AtlasKontext = {
  überschrift: string;
  beschreibung?: string;
  interaktionsfeld: string;
  interaktion: () => void;
  // Optionaler Wrapper (z. B. ein Dialog), der den Button als children bekommt
  interaktionsdialog?: React.ComponentType<InhaltWrapperProps>;
  // Reiner statischer Inhalt, der über dem Button angezeigt wird
  inhalt?: React.ReactNode;
};

export function KontextAtlas(props: AtlasKontext) {
  const { überschrift, beschreibung, interaktionsdialog: Wrapper, interaktionsfeld, interaktion, inhalt } = props;

  const Fallback: React.FC<InhaltWrapperProps> = ({ children }) => <>{children}</>;
  const Container = Wrapper ?? Fallback;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{überschrift}</CardTitle>
        {beschreibung ? <CardDescription>{beschreibung}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {inhalt}
        <Container>
          <Button className="w-full" onClick={interaktion}>
            {interaktionsfeld}
          </Button>
        </Container>
      </CardContent>
    </Card>
  );
}

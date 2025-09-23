
// ./src/Ordnung/programm.types.ts

import React from "react";
import { type Node, type Edge } from "@xyflow/react";


export type Bibliothek = {
  label: string;
  action: string;
  onAddMap?: () => void;
  size?: number;
  children: React.ReactNode;
};

export type StrukturArgumente = {
  firstStyle?: React.CSSProperties;
  secondStyle?: React.CSSProperties;
  thirdStyle?: React.CSSProperties;
};

export type LayoutArgumente = {
  initNodes?: Node[];
  initEdges?: Edge[];
  firstStyle?: React.CSSProperties;
  secondStyle?: React.CSSProperties;
  thirdStyle?: React.CSSProperties;
};

export interface User {
  id: string; // Eindeutige ID, z.B. eine UUID
  name: string;
  passwordHash: string; 
  profilePicture?: {
    initials: string;
    backgroundColor: string;
  };
}

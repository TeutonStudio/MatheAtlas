// ./src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@/App.tsx'

// z.B. in main.tsx
// import { CAS } from "@/Daten/core/cas";
// CAS.ensureLoaded().catch(() => {});

console.log("Before createRoot");
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
console.log("After createRoot");
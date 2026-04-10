'use client';

import { useEffect } from 'react';

export default function ClientPrint() {
  useEffect(() => {
    // Retrasar medio segundo para pintar la hoja antes de llamar el dialogo
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}

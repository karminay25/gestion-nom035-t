import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir directamente al login del portal de trabajadores
  redirect('/login');
}

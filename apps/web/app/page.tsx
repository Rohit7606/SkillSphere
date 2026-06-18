import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect the root URL to the dashboard
  redirect('/dashboard');
}

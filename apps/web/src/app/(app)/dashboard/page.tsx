import { redirect } from 'next/navigation';

// The dashboard was replaced by the Home page.
export default function DashboardRedirect() {
  redirect('/home');
}

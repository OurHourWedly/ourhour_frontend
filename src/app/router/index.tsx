import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { HomePage } from '@/features/templates/pages/HomePage.tsx';
import { InvitationPublicPage } from '@/features/invitations/pages/InvitationPublicPage';
import { MyInvitationsPage } from '@/features/invitations/pages/MyInvitationsPage';
import { CreateInvitationPage } from '@/features/invitations/pages/CreateInvitationPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { SignupPage } from '@/features/auth/pages/SignupPage';
import { SettingsPage } from '@/features/auth/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'dashboard', element: <MyInvitationsPage /> },
      { path: 'dashboard/create', element: <CreateInvitationPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'i/:slug', element: <InvitationPublicPage /> },
    ],
  },
]);
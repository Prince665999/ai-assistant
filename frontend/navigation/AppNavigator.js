import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import AuthStack from './AuthStack';
import UserTabs from './UserTabs';
import AdminStack from './AdminStack';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROLES } from '../utils/constants';

// The single place that decides which "world" the app shows.
//
// IMPORTANT: isLoading is guaranteed (by AuthContext) to always resolve to
// false eventually, even on web, even if session restore fails - so this
// loading screen can never get stuck forever the way the old app's did.
export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner label="Checking your session…" />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === ROLES.ADMIN ? (
        <AdminStack />
      ) : (
        <UserTabs />
      )}
    </NavigationContainer>
  );
}

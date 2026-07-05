import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuthStack from './AuthStack';
import UserTabs from './UserTabs';
import AdminStack from './AdminStack';
import { ROLES } from '../utils/constants';

// This is the one place that decides which whole app the person sees:
//   - not logged in            -> AuthStack (Login/Register)
//   - logged in, role='admin'  -> AdminStack
//   - logged in, role='user'   -> UserTabs
// Nothing else in the app needs to know about this logic.
export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner label="Checking your session..." />;
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

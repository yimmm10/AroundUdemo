import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import UserHome from './screens/UserHome';
import RegisterScreen from './screens/RegisterScreen';
import SplashScreen from './screens/SplashScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import AdminScreen from'./screens/AdminScreen';
import DetailScreen from'./screens/DetailScreen';
import AdminDetailScreen from'./screens/AdminDetailScreen';
import AdminInsertScreen from './screens/AdminInsertScreen';
import EditProfileScreen from './screens/EditProfileScreen';

import AdminUserScreen from './screens/AdminUserScreen';
import AdminUserHomeScreen from './screens/AdminUserHomeScreen';
import AdminUserCommentsScreen from './screens/AdminUserCommentsScreen';
import AdminAllUserCommentsScreen from './screens/AdminAllUserCommentsScreen';

import MyCommentScreen from './screens/MyCommentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import MainTabs from './screens/MainTabs';

export default function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="UserHome" component={UserHome} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="AdminScreen" component={AdminScreen} />
        <Stack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} />
        <Stack.Screen name="DetailScreen" component={DetailScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} /> 
        <Stack.Screen name="AdminDetailScreen" component={AdminDetailScreen} />
        <Stack.Screen name="AdminInsertScreen" component={AdminInsertScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />

        <Stack.Screen name="AdminUserScreen" component={AdminUserScreen} />
        <Stack.Screen name="AdminUserHomeScreen" component={AdminUserHomeScreen} />
        <Stack.Screen name="AdminUserCommentsScreen" component={AdminUserCommentsScreen} />
        <Stack.Screen name="AdminAllUserCommentsScreen" component={AdminAllUserCommentsScreen} />

        <Stack.Screen name="MyCommentScreen" component={MyCommentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

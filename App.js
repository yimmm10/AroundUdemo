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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

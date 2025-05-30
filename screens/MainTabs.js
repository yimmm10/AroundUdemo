import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserHome from '../screens/UserHome';
import ShakeScreen from '../screens/ShakeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="UserHome"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'UserHome') iconName = 'home-outline';
          else if (route.name === 'ShakeScreen') iconName = 'sync-outline';
          else if (route.name === 'FavoritesScreen') iconName = 'heart-outline';
          else if (route.name === 'ProfileScreen') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#c76b4d',
        tabBarInactiveTintColor: '#fff',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#F6CA86C7',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 60
        }
      })}
    >
      <Tab.Screen name="UserHome" component={UserHome} options={{ title: 'หน้าหลัก' }} />
      <Tab.Screen name="ShakeScreen" component={ShakeScreen} options={{ title: 'เขย่า' }} />
      <Tab.Screen name="FavoritesScreen" component={FavoritesScreen} options={{ title: 'กดใจ' }} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'ข้อมูลผู้ใช้' }} />
    </Tab.Navigator>
  );
}
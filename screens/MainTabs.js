import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserHome from './UserHome';
import MapScreen from './MapScreen';
import FavoritesScreen from './FavoritesScreen';
import ProfileScreen from './ProfileScreen';
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
          else if (route.name === 'MapScreen') iconName = 'map-outline';
          else if (route.name === 'FavoritesScreen') iconName = 'heart-outline';
          else if (route.name === 'ProfileScreen') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#CC0000',
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
      <Tab.Screen name="MapScreen" component={MapScreen} options={{ title: 'แผนที่' }} />
      <Tab.Screen name="FavoritesScreen" component={FavoritesScreen} options={{ title: 'กดใจ' }} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'ข้อมูลผู้ใช้' }} />
    </Tab.Navigator>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';


export default function AdminUserHome({ navigation }) {
  const [userCount, setUserCount] = useState(0);
  const [placeCount, setPlaceCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [topFavPlaces, setTopFavPlaces] = useState([]);
  const [topCommentUsers, setTopCommentUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchTopFavPlaces();
    fetchTopCommentUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      setUserCount(usersSnap.size);

      const placesSnap = await getDocs(collection(db, "places"));
      setPlaceCount(placesSnap.size);

      const commentsSnap = await getDocs(collection(db, "comments"));
      setCommentCount(commentsSnap.size);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const fetchTopFavPlaces = async () => {
    try {
      const likesSnap = await getDocs(collection(db, "likes"));
      const placeCounts = {};
  
      // 1. นับจำนวน like ต่อ placeId (อิงจาก data().placeId)
      likesSnap.forEach(doc => {
        const placeId = String(doc.data().placeId).trim(); // อิงจาก place.id ที่เก็บใน data
        if (placeId) {
          placeCounts[placeId] = (placeCounts[placeId] || 0) + 1;
        }
      });
  
      // 2. ดึงสถานที่ทั้งหมด และสร้าง map จาก data().id → name
      const placesSnap = await getDocs(collection(db, "places"));
      const placeMap = {};
      placesSnap.forEach(doc => {
        const data = doc.data();
        const logicalId = String(data.id).trim(); // สำคัญมาก! ใช้ data().id
        placeMap[logicalId] = data.name || `Unknown (${logicalId})`;
      });
  
      // 3. รวม + จัดเรียง
      const topPlaces = Object.entries(placeCounts)
        .map(([placeId, count]) => ({
          id: placeId,
          name: placeMap[placeId] || `Unknown (${placeId})`,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
  
      setTopFavPlaces(topPlaces);
      console.log("✅ Top Fav Places:", topPlaces);
    } catch (err) {
      console.error("❌ Failed to fetch top favorited places:", err);
    }
  };
  
  
  
  const fetchTopCommentUsers = async () => {
    try {
      const commentSnap = await getDocs(collection(db, "comments"));
      const userCounts = {};

      commentSnap.forEach(doc => {
        const user = doc.data().user;
        if (user) {
          userCounts[user] = (userCounts[user] || 0) + 1;
        }
      });

      const sorted = Object.entries(userCounts)
        .map(([user, count]) => ({ user, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopCommentUsers(sorted);
    } catch (err) {
      console.error("Error fetching top comment users:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 Admin Dashboard</Text>

      <ScrollView contentContainerStyle={styles.dashboard}>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>👤 Users</Text>
            <Text style={styles.cardValue}>{userCount}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📍 Places</Text>
            <Text style={styles.cardValue}>{placeCount}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💬 Comments</Text>
            <Text style={styles.cardValue}>{commentCount}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top 5 Favorite Places</Text>
          {topFavPlaces.length === 0 ? (
              <Text style={styles.listItem}>No data available.</Text>
            ) : (
              topFavPlaces.map((place, index) => (
                <Text key={index} style={styles.listItem}>
                  {index + 1}. {place.name} ({place.count} likes)
                </Text>
              ))
            )}
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👑 Top 5 Comment Users</Text>
          {topCommentUsers.map((item, index) => (
            <Text key={index} style={styles.listItem}>
              {index + 1}. {item.user} ({item.count} comments)
            </Text>
          ))}
        </View>

        <View style={styles.buttonBar}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminScreen')}>
            <Text style={styles.buttonText}>Manage Places</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminUserScreen')}>
            <Text style={styles.buttonText}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminAllUserCommentsScreen')}>
            <Text style={styles.buttonText}>All Comments</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('AdminAllUserCommentsScreen')}>
          <Text style={styles.tabText}>💬 Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('AdminScreen')}>
          <Text style={styles.tabText}>📍 Places</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('AdminUserScreen')}>
          <Text style={styles.tabText}>👤 Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={handleLogout}>
          <Text style={styles.tabText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd', padding: 20, paddingBottom: 80 },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ea7216',
    textAlign: 'center',
  },
  dashboard: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f4cf9d',
    borderRadius: 15,
    padding: 20,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
    textAlign: 'center',
  },
  section: { marginTop: 20, width: '100%' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10
  },
  listItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
    paddingLeft: 10
  },
  buttonBar: {
    marginTop: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#34495e',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomTabBar: {
    height: 60,
    backgroundColor: '#f4cf9d',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tabButton: {
    padding: 10,
  },
  tabText: {
    fontSize: 26,
    color: '#900',
  },
});

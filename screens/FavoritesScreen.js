import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { db, storage } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { onSnapshot } from 'firebase/firestore';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const navigation = useNavigation();

useEffect(() => {
  let unsubscribeLikes;

  const fetchRealtimeFavorites = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) return;

      // ตั้ง Listener สำหรับ likes ของ user นี้
      const likeQuery = query(collection(db, 'likes'), where('user', '==', username));
      unsubscribeLikes = onSnapshot(likeQuery, async likeSnap => {
        const likedPlaceIds = likeSnap.docs.map(doc => doc.data().placeId);

        if (likedPlaceIds.length === 0) {
          setFavorites([]);
          return;
        }

        // ดึงสถานที่แบบ snapshot เพื่อให้รองรับ real-time ได้
        const unsubscribePlaces = onSnapshot(collection(db, 'places'), async placeSnap => {
          const filtered = await Promise.all(
            placeSnap.docs
              .filter(doc => likedPlaceIds.includes(doc.data().id))
              .map(async doc => {
                const data = doc.data();
                const imageRef = ref(storage, `images/${data.picture}`);
                const imageUrl = await getDownloadURL(imageRef);
                return {
                  ...data,
                  imageUrl
                };
              })
          );

          setFavorites(filtered);
        });

        // คืน unsubscribe สำหรับ place เมื่อ component ถูก unmount
        return () => unsubscribePlaces();
      });
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลด Fev แบบ real-time:', error);
    }
  };

  fetchRealtimeFavorites();

  // คืน unsubscribe ของ likes เมื่อ component ถูก unmount
  return () => {
    if (unsubscribeLikes) unsubscribeLikes();
  };
}, []);


  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("DetailScreen", { place: item })}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.headerText}>💖 สถานที่ที่คุณกดใจไว้</Text>
        </View>

      <FlatList
        data={favorites}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 30 }}>
            ยังไม่มีสถานที่ที่คุณกดใจไว้ ❤️
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f6e9dc',
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  image: {
    width: 100,
    height: 100
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'center'
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  time: {
    fontSize: 14,
    color: 'red',
    marginTop: 5
  },
  header: {
    backgroundColor: '#f6ca86',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 3
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  }
  
});
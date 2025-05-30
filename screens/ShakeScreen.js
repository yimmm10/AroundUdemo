import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Button, TouchableOpacity, Animated } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { collection, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig'; // แก้ path ให้ตรงกับโปรเจกต์ของคุณ
import { useNavigation } from '@react-navigation/native';
import { getDownloadURL, ref } from 'firebase/storage';

export default function ShakeToSuggestScreen() {
  const [places, setPlaces] = useState([]);
  const [lastShake, setLastShake] = useState(Date.now());
  const [selectedPlace, setSelectedPlace] = useState(null);
  const navigation = useNavigation();
  const shakeAnim = new Animated.Value(1); // สำหรับ effect

  useEffect(() => {
    const fetchPlaces = async () => {
      const querySnapshot = await getDocs(collection(db, 'places'));
  
      const loadedPlaces = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let imageUrl = '';
  
          try {
            const imagePath = `images/${data.picture}`; // ✅ ใช้ folder + ชื่อไฟล์จาก Firestore
            const imageRef = ref(storage, imagePath);
            imageUrl = await getDownloadURL(imageRef);
          } catch (error) {
            console.error('โหลดรูปไม่สำเร็จ:', error);
          }
  
          return {
            id: doc.id,
            ...data,
            image: imageUrl, // ✅ เก็บ URL ที่โหลดจาก Storage
          };
        })
      );
  
      setPlaces(loadedPlaces);
    };
  
    fetchPlaces();
  }, []);

  useEffect(() => {
    Accelerometer.setUpdateInterval(300);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const force = Math.sqrt(x * x + y * y + z * z);
      if (force > 1.8) {
        const now = Date.now();
        if (now - lastShake > 1500) {
          setLastShake(now);
          handleShake();
        }
      }
    });
    return () => subscription.remove();
  }, [lastShake, places]);

  const handleShake = () => {
    if (places.length === 0) return;

    // Animation (เล็กน้อยเพื่อให้รู้ว่าเขย่า)
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const random = places[Math.floor(Math.random() * places.length)];
    setSelectedPlace(random);
  };

  const handleDetail = () => {
    navigation.navigate('DetailScreen', { place: selectedPlace });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: shakeAnim }] }}>
        <Text style={styles.title}>เขย่าเครื่องเพื่อสุ่มสถานที่รอบ มทส.</Text>
      </Animated.View>

      {selectedPlace && (
        <View style={styles.card}>
          <Image source={{ uri: selectedPlace.image }} style={styles.image} />
          <Text style={styles.name}>{selectedPlace.name}</Text>
          <Text style={styles.desc}>{selectedPlace.description}</Text>
          <TouchableOpacity style={styles.button} onPress={handleDetail}>
            <Text style={styles.buttonText}>ดูรายละเอียด</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { width: '100%', borderRadius: 16, backgroundColor: '#f1f1f1', padding: 16, alignItems: 'center', elevation: 4 },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  desc: { fontSize: 16, color: '#555', marginTop: 4, marginBottom: 12 },
  button: { backgroundColor: '#c76b4d', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
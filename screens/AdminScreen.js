import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { db, storage } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminHome() {
  const [places, setPlaces] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'places'));
        const items = await Promise.all(
          snapshot.docs.map(async docItem => {
            const data = docItem.data();
            const imageRef = ref(storage, `images/${data.picture}`);
            const imageUrl = await getDownloadURL(imageRef);

            return {
              id: docItem.id, // ✅ เอา id ของ document มาด้วย
              ...data,
              imageUrl
            };
          })
        );
        setPlaces(items);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลด:', error);
      }
    };

    fetchPlaces();
  }, []);

  const handleLogout = async () => {
      Alert.alert("ยืนยัน", "คุณต้องการออกจากระบบหรือไม่?", [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ออกจากระบบ",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear(); // ✅ เคลียร์ข้อมูล session
            navigation.replace("Login"); // ✅ กลับไปหน้า Login
          }
        }
      ]);
    };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("AdminDetailScreen", { place: item })}>
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
      <FlatList
        data={places}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />
      <TouchableOpacity
        style={styles.insertButton}
        onPress={() => navigation.navigate('AdminInsertScreen')}
      >
        <Text style={styles.insertButtonText}>+ เพิ่มสถานที่</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
       <Text style={styles.btnText}>BACK</Text>
      </TouchableOpacity>
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
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 10, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
  time: { fontSize: 14, color: 'red', marginTop: 5 },
  insertButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#c76b4d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 99
  },
  insertButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#c76b4d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet,TouchableOpacity } from 'react-native';
import { db, storage } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

export default function UserHome() {
  const [places, setPlaces] = useState([]);
  const navigation = useNavigation();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'places'));
        const items = await Promise.all(
          snapshot.docs.map(async doc => {
            const data = doc.data();
            const id = doc.id;

            // ดึง URL ของรูปจาก Firebase Storage
            const imageRef = ref(storage, `images/${data.picture}`);
            const imageUrl = await getDownloadURL(imageRef);

            return {
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
      <Text style={styles.headerText}>🏠 หน้าหลัก</Text>
      </View>
      <Text>สถานที่ท่องเที่ยวแนะนำ</Text>
      <FlatList
        data={places}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
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

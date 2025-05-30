// AdminHome.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { db, storage } from '../firebaseConfig';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';


export default function AdminHome() {
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPlaces = () => {
      const q = collection(db, 'places');
      console.log("Subscribing to places collection...");
      return onSnapshot(q, (snapshot) => {
        console.log("Snapshot received:", snapshot);
        const promises = snapshot.docs.map(async docItem => {
          const data = docItem.data();
          let imageUrl = null;
          if (data.picture) {
            try {
              const imageRef = ref(storage, `images/${data.picture}`);
              imageUrl = await getDownloadURL(imageRef);
            } catch (error) {
              console.error('Error getting download URL:', error);
              imageUrl = null;
            }
          }
          return {
            id: docItem.id,
            ...data,
            imageUrl
          };
        });

        Promise.all(promises).then(items => {
          setPlaces(items);
          console.log("Places state updated:", items);
        });
      }, (error) => {
        console.error("Error in snapshot listener:", error);
      });
    };

    const unsubscribe = fetchPlaces();
    return () => {
      console.log("Unsubscribing from places collection.");
      unsubscribe();
    };
  }, []);

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'places', id));
      Alert.alert("สำเร็จ", "สถานที่ถูกลบเรียบร้อย");
    } catch (error) {
      console.error("Error deleting place:", error);
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("AdminDetailScreen", { place: item })}>
      <View style={styles.card}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#777' }}>No Image</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("AdminDetailScreen", { place: item })}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search places..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredPlaces}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.replace('AdminUserHomeScreen')}
        >
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.insertButton}
          onPress={() => navigation.navigate('AdminInsertScreen')}
        >
          <Text style={styles.insertButtonText}>+ Add place</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd', paddingBottom: 20 },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginTop: 30,
    marginHorizontal: 10,
    fontSize: 16,
  },
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
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // จัดปุ่มให้ชิดสองข้าง
    position: 'absolute',
    bottom: 25,
    left: 10, // ระยะห่างจากขอบซ้าย
    right: 10, // ระยะห่างจากขอบขวา
  },
  insertButton: {
    backgroundColor: '#c76b4d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insertButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backBtn: {
    backgroundColor: '#c76b4d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  actions: { flexDirection: 'row', marginTop: 5 },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
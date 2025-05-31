import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet,TouchableOpacity,TextInput } from 'react-native';
import { db, storage } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

export default function UserHome() {
  const [places, setPlaces] = useState([]);
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  useEffect(() => {
    const fetchPlaces = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'places'));

    const items = await Promise.all(
      snapshot.docs.map(async doc => {
        const data = doc.data();
        const id = data.id; 

        const imageRef = ref(storage, `images/${data.picture}`);
        const imageUrl = await getDownloadURL(imageRef);

        const commentsSnap = await getDocs(
          query(collection(db, 'comments'), where('placeId', '==', id))
        );

        const comments = commentsSnap.docs.map(doc => doc.data());
        
        const ratings = commentsSnap.docs
          .map(doc => doc.data().rating)
          .filter(r => typeof r === 'number' && !isNaN(r));

        const avgRating = ratings.length
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

        return {
          ...data,
          imageUrl,
          avgRating,
          commentCount: comments.length
        };
      })
    );
    const sortedItems = items.sort((a, b) => b.commentCount - a.commentCount);
    setPlaces(items);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการโหลด:', error);
  }
};

    fetchPlaces();
  }, []);

  useEffect(() => {
      const filtered = places.filter(place =>
        place.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredPlaces(filtered);
    }, [searchText, places]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("DetailScreen", { place: item })}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.rating}>⭐ {item.avgRating.toFixed(1)}</Text>
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
      
      <TextInput
        placeholder="ค้นหาสถานที่..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />
      <FlatList
        data={filteredPlaces}
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
  },
  rating: {
  fontSize: 14,
  color: '#555',
  marginTop: 3
},
searchInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  paddingHorizontal: 15,
  paddingVertical: 8,
  marginHorizontal: 10,
  marginBottom: 10,
  backgroundColor: '#fff'
}

});
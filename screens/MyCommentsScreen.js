import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function MyCommentsScreen() {
  const [comments, setComments] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchComments = async () => {
      const username = await AsyncStorage.getItem('username');

      const commentQuery = query(collection(db, 'comments'), where('user', '==', username));
      const commentSnap = await getDocs(commentQuery);
      const rawComments = commentSnap.docs.map(doc => doc.data());

      const placeSnap = await getDocs(collection(db, 'places'));
      const places = placeSnap.docs.map(doc => doc.data());

      const enrichedComments = rawComments.map(comment => {
        const matchedPlace = places.find(p => p.id === comment.placeId);
        return {
          ...comment,
          place: matchedPlace || null
        };
      });

      setComments(enrichedComments);
    };

    fetchComments();
  }, []);

  const handlePress = (place) => {
    if (place) {
      navigation.navigate('DetailScreen', { place });
    }
  };

  return (
  <View style={styles.container}>

    <Text style={styles.title}>My Comment 💬</Text>

    <FlatList
      data={comments}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item.place)}>
          <View style={styles.commentCard}>
            <Text style={styles.place}>📍 {item.place?.name || 'ไม่พบชื่อสถานที่'}</Text>
            <Text>{item.text}</Text>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
          </View>
        </TouchableOpacity>
        
      )} 
      ListEmptyComponent={<Text style={{ textAlign: 'center' }}>ยังไม่มีคอมเมนต์</Text>}
    /> 
    <View style={styles.bottomBar}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
      <Text style={styles.backText}>Back</Text>
    </TouchableOpacity>
    </View>
  </View>
);

}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  commentCard: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10
  },
  place: { fontWeight: 'bold', fontSize: 16 },
  rating: { marginTop: 5, color: 'orange' },
  backBtn: {
    backgroundColor: '#aaa',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25
  },
});

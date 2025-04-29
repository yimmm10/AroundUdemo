import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, storage } from '../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { FontAwesome, AntDesign } from '@expo/vector-icons';

export default function DetailScreen({ route }) {
  const { place } = route.params;
  const navigation = useNavigation();
  const [imageUrl, setImageUrl] = useState(null);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [currentUsername, setCurrentUsername] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: place.name,
      headerStyle: {
        backgroundColor: '#f6ca86',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      },
      headerTitleStyle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20
      },
      headerTintColor: '#fff'
    });
  }, [navigation]);

  useEffect(() => {
    const fetchData = async () => {
      const imgRef = ref(storage, `images/${place.picture}`);
      const url = await getDownloadURL(imgRef);
      setImageUrl(url);

      const username = await AsyncStorage.getItem('username');
      setCurrentUsername(username);

      const q = query(collection(db, "comments"), where("placeId", "==", place.id));
      const snap = await getDocs(q);
      const allComments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(allComments);

      // คำนวณคะแนนเฉลี่ย
      const allRatings = snap.docs
        .map(doc => doc.data().rating)
        .filter(r => typeof r === 'number' && !isNaN(r));

      const avgRating = allRatings.length > 0
        ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length)
        : 0;

      setAverageRating(avgRating);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkLike = async () => {
      const username = await AsyncStorage.getItem('username');
      setCurrentUsername(username);
  
      const likeDocId = `${place.id}_${username}`;
      const likeDocRef = doc(db, "likes", likeDocId);
  
      // 🔁 ติดตามแบบเรียลไทม์
      const unsubscribe = onSnapshot(likeDocRef, (docSnap) => {
        setIsLiked(docSnap.exists());
      });
  
      return () => unsubscribe(); // ❌ cleanup เมื่อออกจากหน้า
    };
  
    checkLike();
  }, []);

  const handleAddComment = async () => {
    if (!comment || rating === 0) return;

    const q = query(
      collection(db, "comments"),
      where("placeId", "==", place.id),
      where("user", "==", currentUsername)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      // มีแล้ว แก้ไขรีวิวเดิม
      const existingReviewId = snap.docs[0].id;
      const reviewRef = doc(db, "comments", existingReviewId);

      await setDoc(reviewRef, {
        placeId: place.id,
        text: comment,
        rating,
        user: currentUsername,
        createdAt: new Date()
      });

      setComments((prev) =>
        prev.map((c) =>
          c.user === currentUsername ? { ...c, text: comment, rating } : c
        )
      );
    } else {
      // เพิ่มรีวิวใหม่
      const newReview = {
        placeId: place.id,
        text: comment,
        rating,
        user: currentUsername,
        createdAt: new Date()
      };
      const docRef = await addDoc(collection(db, "comments"), newReview);
      setComments([...comments, { id: docRef.id, ...newReview }]);
    }

    setComment('');
    setRating(0);
  };

  const handleDeleteComment = async (item) => {
    try {
      const reviewDoc = doc(db, "comments", item.id);
      await deleteDoc(reviewDoc);

      setComments((prev) => prev.filter(c => c.id !== item.id));
    } catch (error) {
      console.error('ลบรีวิวไม่สำเร็จ:', error);
    }
  };

  const toggleLike = async () => {
    const likeDocId = `${place.id}_${currentUsername}`;
    const likeDocRef = doc(db, "likes", likeDocId);
  
    if (isLiked) {
      // ❌ ยกเลิกการกดใจ → ลบ document
      await deleteDoc(likeDocRef);
    } else {
      // ✅ กดใจ → เพิ่ม document
      await setDoc(likeDocRef, {
        placeId: place.id,
        user: currentUsername
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}

      {/* ⭐ แสดงคะแนนเฉลี่ย */}
      <View style={styles.avgRatingBox}>
        <Text style={{ fontWeight: 'bold' }}>คะแนนเฉลี่ย:</Text>
        <View style={{ flexDirection: 'row', marginLeft: 6 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <FontAwesome
              key={i}
              name="star"
              size={20}
              color={i <= Math.round(averageRating) ? '#f4a261' : '#ccc'}
            />
          ))}
          <Text style={{ marginLeft: 6 }}>({averageRating.toFixed(1)})</Text>
        </View>
      </View>

      {/* ⭐ ให้คะแนน */}
      <Text style={styles.commentTitle}>ให้คะแนน</Text>
      <View style={styles.ratingAndLikeRow}>
        {/* ดาว */}
        <View style={{ flexDirection: 'row' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
              <FontAwesome
                name="star"
                size={24}
                color={i <= rating ? '#f4a261' : '#ccc'}
                style={{ marginRight: 5 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* ❤️ ปุ่มกดใจ */}
        <TouchableOpacity onPress={toggleLike} style={{ marginLeft: 10 }}>
        <AntDesign name={isLiked ? 'heart' : 'hearto'} size={24} color="#c76b4d" />
        </TouchableOpacity>

      </View>

      <TextInput
        placeholder="พิมพ์ความคิดเห็น..."
        value={comment}
        onChangeText={setComment}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleAddComment} style={styles.sendBtn}>
        <Text style={{ color: '#fff' }}>ส่ง</Text>
      </TouchableOpacity>

      {/* แสดงความคิดเห็นทั้งหมด */}
      <Text style={styles.commentTitle}>ความคิดเห็น</Text>
      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Text style={styles.commentUser}>{item.user}:</Text>
            <View style={{ flexDirection: 'row', marginVertical: 4 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <FontAwesome
                  key={i}
                  name="star"
                  size={16}
                  color={i <= item.rating ? '#f4a261' : '#ccc'}
                />
              ))}
            </View>
            <Text>{item.text}</Text>

            {/* ปุ่มลบรีวิวตัวเอง */}
            {item.user === currentUsername && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteComment(item)}
              >
                <Text style={{ color: 'red' }}>ลบ</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
      />
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
         <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  image: { width: '100%', height: 180, resizeMode: 'cover', borderRadius: 16, marginBottom: 10 },
  avgRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f6e9dc',
    borderRadius: 12
  },
  commentTitle: { fontWeight: 'bold', marginTop: 20 },
  ratingAndLikeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 10 },
  sendBtn: { backgroundColor: '#c76b4d', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  commentItem: { backgroundColor: '#eee', padding: 10, marginTop: 8, borderRadius: 8 },
  commentUser: { fontWeight: 'bold', color: '#c76b4d' },
  deleteBtn: { marginTop: 6, alignSelf: 'flex-end' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25
  },
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
  nextBtn: {
    backgroundColor: '#c76b4d',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold'
  }
  
});

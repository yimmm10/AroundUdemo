import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { collection, doc, getDocs, query, where, setDoc, addDoc } from 'firebase/firestore';

export default function CommentScreen({ route, navigation }) {
  const { place, currentUsername } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [commentId, setCommentId] = useState(null);

  useEffect(() => {
    const loadExistingComment = async () => {
      const q = query(
        collection(db, "comments"),
        where("placeId", "==", place.docId),
        where("user", "==", currentUsername)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setComment(data.text);
        setRating(data.rating);
        setIsEdit(true);
        setCommentId(snap.docs[0].id);
      }
    };
    loadExistingComment();
  }, []);

  const handleSave = async () => {
    if (!comment || rating === 0) {
      Alert.alert("แจ้งเตือน", "กรุณาให้คะแนนและกรอกความคิดเห็น");
      return;
    }

    const payload = {
      placeId: place.docId,
      user: currentUsername,
      text: comment,
      rating,
      createdAt: new Date()
    };

    if (isEdit && commentId) {
      await setDoc(doc(db, "comments", commentId), payload);
    } else {
      await addDoc(collection(db, "comments"), payload);
    }

    Alert.alert("สำเร็จ", "บันทึกความคิดเห็นเรียบร้อยแล้ว");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เขียนความคิดเห็นสำหรับ {place.name}</Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(i => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <FontAwesome
              name="star"
              size={32}
              color={i <= rating ? '#f4a261' : '#ccc'}
              style={{ marginHorizontal: 5 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="พิมพ์ความคิดเห็น..."
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
        <Text style={{ color: '#fff', fontSize: 16 }}>SAVE</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={{ color: '#555', fontSize: 14 }}>BACK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  stars: { flexDirection: 'row', marginBottom: 20 },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 10, padding: 10, height: 100 },
  saveBtn: {
    backgroundColor: '#c76b4d',
    padding: 12,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  backBtn: {
    marginTop: 10,
    alignItems: 'center'
  }
});

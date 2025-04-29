import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, storage } from '../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function AdminDetailScreen({ route }) {
  const { place } = route.params;
  const navigation = useNavigation();

  const [imageUrl, setImageUrl] = useState(null);
  const [name, setName] = useState(place.name);
  const [description, setDescription] = useState(place.description);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'แก้ไขสถานที่',
      headerStyle: { backgroundColor: '#f6ca86', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
      headerTitleStyle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
      headerTintColor: '#fff'
    });
  }, [navigation]);

  useEffect(() => {
    const fetchData = async () => {
      const imgRef = ref(storage, `images/${place.picture}`);
      const url = await getDownloadURL(imgRef);
      setImageUrl(url);

      const q = query(collection(db, "comments"), where("placeId", "==", place.id));
      const snap = await getDocs(q);
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const handleUpdatePlace = async () => {
    try {
      const placeRef = doc(db, "places", place.id);
      await updateDoc(placeRef, { name, description });
      Alert.alert("บันทึกสำเร็จ", "ข้อมูลสถานที่ได้รับการอัปเดตแล้ว", [
        { text: "ตกลง", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Error updating place:", error);
    }
  };

  const handleAddComment = async () => {
    if (!comment) return;
    const docRef = await addDoc(collection(db, "comments"), {
      placeId: place.id,
      text: comment,
      createdAt: new Date(),
      user: "admin" // แอดมินคอมเมนต์
    });
    setComments([...comments, { id: docRef.id, text: comment, user: "admin" }]);
    setComment('');
  };

  const handleUpdateComment = async () => {
    if (!editingText.trim()) {
      Alert.alert('กรุณากรอกข้อความใหม่');
      return;
    }
    try {
      const commentRef = doc(db, "comments", editingId);
      await updateDoc(commentRef, { text: editingText });
      setComments(prev => prev.map(c => (c.id === editingId ? { ...c, text: editingText } : c)));
      setEditingId(null);
      setEditingText('');
    } catch (error) {
      console.error("Error updating comment: ", error);
    }
  };

  const handleDeleteComment = async (id) => {
    Alert.alert("ยืนยันลบ", "ต้องการลบความคิดเห็นนี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ", style: "destructive", onPress: async () => {
          await deleteDoc(doc(db, "comments", id));
          setComments(prev => prev.filter(c => c.id !== id));
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

      <Text style={styles.label}>ชื่อสถานที่:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>รายละเอียด:</Text>
      <TextInput style={[styles.input, { height: 100 }]} multiline value={description} onChangeText={setDescription} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePlace}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>บันทึกข้อมูลสถานที่</Text>
      </TouchableOpacity>

      <Text style={styles.commentTitle}>ความคิดเห็น</Text>
      {comments.map((item, index) => (
        <View key={index} style={{ marginBottom: 10 }}>
          <Text style={styles.commentUser}>👤 {item.user}</Text>
          {editingId === item.id ? (
            <>
              <TextInput value={editingText} onChangeText={setEditingText} style={styles.input} />
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <TouchableOpacity
                  style={[styles.sendBtn, { backgroundColor: '#4caf50', flex: 1, marginRight: 5 }]}
                  onPress={handleUpdateComment}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>บันทึก</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendBtn, { backgroundColor: '#f44336', flex: 1 }]}
                  onPress={() => {
                    setEditingId(null);
                    setEditingText('');
                  }}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>ยกเลิก</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.commentItem}>• {item.text}</Text>
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <TouchableOpacity onPress={() => { setEditingId(item.id); setEditingText(item.text); }}>
                  <Text style={{ color: 'blue', marginRight: 10 }}>แก้ไข</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                  <Text style={{ color: 'red' }}>ลบ</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ))}

      <TextInput
        placeholder="พิมพ์ความคิดเห็น..."
        value={comment}
        onChangeText={setComment}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleAddComment} style={styles.sendBtn}>
        <Text style={{ color: '#fff' }}>ส่ง</Text>
      </TouchableOpacity>

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
  label: { fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 5 },
  saveBtn: { backgroundColor: '#2e7d32', padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  commentTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 20 },
  commentItem: { backgroundColor: '#eee', padding: 8, marginTop: 6, borderRadius: 6 },
  commentUser: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 2 },
  sendBtn: { backgroundColor: '#c76b4d', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  bottomBar: { marginTop: 25 },
  backBtn: { backgroundColor: '#aaa', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  backText: { color: '#fff' },
});

import React, { useState } from 'react';
import {
  View, TextInput, Text, Button, Alert, StyleSheet, Image, TouchableOpacity
} from 'react-native';
import { db, storage } from '../firebaseConfig';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function EditProfileScreen({ route, navigation }) {
  const { userData } = route.params;

  const [username, setUsername] = useState(userData.username || '');
  const [password, setPassword] = useState(userData.password || '');
  const [image, setImage] = useState(userData.imageUrl || null); // 🔄 เปลี่ยนจาก avatar เป็น image
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("ต้องอนุญาตให้เข้าถึงรูปภาพก่อน");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
    }
  };

  const handleSave = async () => {
    try {
      const q = query(collection(db, "users"), where("username", "==", userData.username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, "users", docId);

        let imageUrl = userData.imageUrl;

        // 🔄 อัปโหลดรูปใหม่ถ้ามี
        if (image && image !== userData.imageUrl) {
          setUploading(true);
          const response = await fetch(image);
          const blob = await response.blob();
          const filename = `avatars/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
          const storageRef = ref(storage, filename);
          await uploadBytes(storageRef, blob);
          imageUrl = await getDownloadURL(storageRef);
          setUploading(false);
        }

        await updateDoc(docRef, {
          username,
          password,
          imageUrl // ✅ ใช้ชื่อ field ที่ ProfileScreen รู้จัก
        });

        Alert.alert("อัปเดตข้อมูลเรียบร้อย");
        navigation.goBack();
      }
    } catch (e) {
      console.error("Update failed: ", e);
      Alert.alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
            <Text>เลือกรูป</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Username</Text>
      <TextInput value={username} onChangeText={setUsername} style={styles.input} />

      <Text style={styles.label}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

      <Button title={uploading ? "กำลังอัปโหลด..." : "บันทึก"} onPress={handleSave} disabled={uploading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  label: { alignSelf: 'flex-start', fontWeight: 'bold', marginTop: 15 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 4
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10
  }
});

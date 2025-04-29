import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

export default function AdminInsertScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [image, setImage] = useState(null);
  const [imageFileName, setImageFileName] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop();
      setImage(uri);
      setImageFileName(filename);
    }
  };

  const handleInsert = async () => {
    if (!name || !description || !time || !image) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      const imgRef = ref(storage, `images/${imageFileName}`);
      const response = await fetch(image);
      const blob = await response.blob();
      await uploadBytes(imgRef, blob);

      await addDoc(collection(db, "places"), {
        name,
        description,
        time,
        picture: imageFileName
      });

      Alert.alert("เพิ่มสถานที่สำเร็จ");
      navigation.goBack();
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ชื่อสถานที่</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>รายละเอียด</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={description} onChangeText={setDescription} />

      <Text style={styles.label}>เวลาเปิด/ปิด</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={{ color: '#fff' }}>{image ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <TouchableOpacity style={styles.saveBtn} onPress={handleInsert}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>บันทึกสถานที่</Text>
      </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginTop: 5 },
  imagePicker: {
    backgroundColor: '#6c757d', padding: 12, borderRadius: 8,
    marginTop: 15, alignItems: 'center'
  },
  preview: {
    width: '100%', height: 200, marginTop: 10, borderRadius: 10
  },
  saveBtn: {
    backgroundColor: '#c76b4d', padding: 15, borderRadius: 10,
    marginTop: 20, alignItems: 'center'
  },
  backBtn: { 
    backgroundColor: '#aaa', 
    padding: 15, 
    borderRadius: 10,
    marginTop: 20, 
    alignItems: 'center' },
});

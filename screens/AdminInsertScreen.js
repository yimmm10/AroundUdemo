import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
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
    if (!name || !description || !time) {
      Alert.alert("Please fill in all the information.");
      return;
    }

    try {
      let pictureFileName = null;
      if (image) {
        const imgRef = ref(storage, `images/${imageFileName}`);
        const response = await fetch(image);
        const blob = await response.blob();
        await uploadBytes(imgRef, blob);
        pictureFileName = imageFileName;
      }

      // ✅ คำนวณ id ใหม่ (ไม่ซ้ำ)
      const placesRef = collection(db, "places");
      const snapshot = await getDocs(placesRef);
      const usedIds = snapshot.docs
        .map(doc => doc.data().id)
        .filter(id => typeof id === 'number')
        .sort((a, b) => a - b);

      let newId = 1;
      for (let i = 0; i < usedIds.length; i++) {
        if (usedIds[i] !== i + 1) {
          newId = i + 1;
          break;
        }
        newId = usedIds.length + 1;
      }

      await addDoc(placesRef, {
        id: newId,
        name,
        description,
        time,
        picture: pictureFileName
      });

      Alert.alert("Add location successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("An error occurred.", "Cannot add data.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Place name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Details</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={description} onChangeText={setDescription} />

      <Text style={styles.label}>Opening/Closing Time</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={{ color: '#fff' }}>{image ? 'Change the picture' : 'Select an image'}</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <TouchableOpacity style={styles.saveBtn} onPress={handleInsert}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Record of places</Text>
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
    alignItems: 'center'
  },
  backText: { color: '#fff' },
});

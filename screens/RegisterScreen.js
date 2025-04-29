import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { db} from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async() => {
    if (!username || !email || !password) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      // ตรวจสอบว่ามี username นี้อยู่แล้วหรือไม่
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert("ชื่อผู้ใช้นี้มีอยู่แล้ว กรุณาเลือกชื่ออื่น");
        return;
      }

      // เพิ่มข้อมูลผู้ใช้ใหม่
      await addDoc(collection(db, "users"), {
        username,
        email,
        password, // *หมายเหตุ: ยังไม่เข้ารหัส (hash)*
        role: "user",
        createdAt: new Date()
      });

      Alert.alert("สมัครสมาชิกสำเร็จ");
      navigation.replace("Login");

    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <TextInput placeholder="Name" style={styles.input} onChangeText={setUsername} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail}/>
      <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={setPassword}/>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleRegister}>
        <Text style={styles.btnText}>REGISTER</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>BACK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 200, height: 80, resizeMode: 'contain', marginBottom: 20 },
  input: {
    width: '80%', backgroundColor: '#fde0b4', borderRadius: 20, padding: 10, marginVertical: 8,
  },
  confirmBtn: { backgroundColor: '#c76b4d', padding: 12, borderRadius: 10, marginTop: 20, width: '60%', alignItems: 'center' },
  backBtn: { backgroundColor: '#999', padding: 12, borderRadius: 10, marginTop: 10, width: '60%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});

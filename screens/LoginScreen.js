import React , { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      // ค้นหา username ก่อน
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("ไม่พบชื่อผู้ใช้");
        return;
      }

      const userData = querySnapshot.docs[0].data();

      // เทียบ password
      if (userData.password !== password) {
        Alert.alert("รหัสผ่านไม่ถูกต้อง");
        return;
      }

      // เช็ค role
      if (userData.role === "admin") {
        navigation.replace("AdminScreen");
      } else if (userData.role === "user") {
        navigation.replace("SplashScreen");
      } else {
        Alert.alert("บทบาทไม่ถูกต้อง");
      }

    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('userRole', userData.role);
    await AsyncStorage.setItem('username', userData.username); 

    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.btnText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={styles.btnText}>REGISTER</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('ForgetPasswordScreen')}>
        <Text style={styles.forgetText}>Forget password</Text>
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
  buttonContainer: { flexDirection: 'row', marginTop: 20 },
  loginBtn: { backgroundColor: '#c76b4d', padding: 10, marginRight: 10, borderRadius: 10 },
  registerBtn: { backgroundColor: '#dcb679', padding: 10, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  forgetText: { marginTop: 15, color: 'red' },
});

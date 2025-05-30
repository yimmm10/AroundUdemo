import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function ForgetPasswordScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <TextInput placeholder="Username" style={styles.input} />
      <TextInput placeholder="New Password" secureTextEntry style={styles.input} />
      <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.confirmBtn}>
        <Text style={styles.btnText}>CONFIRM</Text>
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
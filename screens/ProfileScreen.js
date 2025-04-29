import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const username = await AsyncStorage.getItem('username');
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setUserData(data);
      }
    };
    fetchUser();
  }, []);


  if (!userData) return <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={userData.imageUrl ? { uri: userData.imageUrl } : require('../assets/user.jpg')}
        style={styles.avatar}
      />

      <Text style={styles.email}>{userData.email}</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile', { userData })}>
            <Text style={styles.editText}>Edit ✏️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userData.email}</Text>

        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{userData.username}</Text>

        <Text style={styles.label}>Password</Text>
        <Text style={styles.value}>********</Text>
      </View>

              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>BACK</Text>
              </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginVertical: 10,
    backgroundColor: '#eee'
  },
  email: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 20
  },
  card: {
    width: '100%',
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16
  },
  editText: {
    color: '#007bff'
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10
  },
  value: {
    color: 'green'
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#c76b4d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

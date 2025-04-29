import React, { useEffect} from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('MainTabs');
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.description}>แนะนำสถานที่ท่องเที่ยวรอบ มทส.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 250, height: 100, resizeMode: 'contain' },
  description: { marginTop: 15, fontSize: 16, color: '#444' },
});

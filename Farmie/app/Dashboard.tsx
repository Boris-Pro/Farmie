//Dashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather'; // <-- Feather icon set

const Dashboard = () => {
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);

  type Farm = {
    id: number;
    name: string;
    crop: string;
    image_url: string;
   };

  const fetchFarms = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/get_farms_by_user',{
        withCredentials: true,
      }); 
      setFarms(res.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch farms', error);
    }
  };

    // Logout function
    const handleLogout = async () => {
        try {
          await axios.post('http://127.0.0.1:5000/logout'); // Assuming there's a logout endpoint on the server
          router.push('/Login'); // Redirect to login screen after logout
        } catch (error) {
          console.error('Logout failed', error);
        }
      };

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, [])
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={farms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.crop}>Crop: {item.crop}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/AddFarm')}>
        <Icon name="plus-circle" size={32} color="#fff" />
      </TouchableOpacity>
            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0', padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  image: { width: 200, height: 120, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 18, fontWeight: 'bold' },
  crop: { color: '#444' },
  addButton: {
    backgroundColor: '#228B22',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    bottom: 30,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 8,
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default Dashboard;

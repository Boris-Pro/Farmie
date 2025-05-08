// AddFarm.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddFarm = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [crop, setCrop] = useState('');
  const [image, setImage] = useState<any>(null);
  const router = useRouter();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true 
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !location || !crop || !image) {
      Alert.alert('Missing fields', 'Please fill out all fields and select an image.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (!token) {
        Alert.alert('Session expired', 'Please login again.');
        router.push('/Login');
        return;
      }

      await axios.post('http://127.0.0.1:5000/add_farm', {
        name,
        location,
        crop,
        image_url: image.uri,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Success', 'Farm added successfully!');
      router.back();
    } catch (err) {
      console.error('Upload error', err);
      Alert.alert('Error', 'Failed to upload farm. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Pick an Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Farm Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Potential Crop" value={crop} onChangeText={setCrop} />

      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>Add Farm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10 },
  imagePlaceholder: {
    height: 200, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderRadius: 8,
  },
  input: {
    borderColor: '#ccc', borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 8,
  },
  submit: {
    backgroundColor: '#228B22', padding: 15, borderRadius: 8, alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: 'bold' },
});

export default AddFarm;

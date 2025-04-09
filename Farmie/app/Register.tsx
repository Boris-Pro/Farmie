import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, Image, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

// Define types for the props



const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);  // To control the modal visibility
  const router = useRouter();
  const API_BASE_URL = 'http://10.0.2.2:5000';

  const handleRegister = async () => {
    if (!username || !password) {
      setErrorMessage("All fields are required");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message || 'Registration successful');
        setShowSuccessModal(true); // Show the success modal
        setErrorMessage(null); // Clear error message on success
        // Navigate to login screen after successful registration
        // Wait 3 seconds before routing to login
            // Close modal and navigate to login after 1 second
            // Close modal and navigate to login after 1 second
        setTimeout(() => {
              setShowSuccessModal(false); // Hide the modal
              router.push('/Login'); // Navigate to login
      }, 1000);
    } else {
        setErrorMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Unable to connect to the server. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image
          source={require('/Users/javonlaing/Desktop/Farmie/Farmie/assets/images/farmie.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.header}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#ccc"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
     
      {/* Success Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.successText}>Welcome Farmer!</Text>
            <TouchableOpacity onPress={() => setShowSuccessModal(false)}>
              <Text style={styles.buttonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B4513', // brown
    justifyContent: 'center',
    padding: 20,
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#D2691E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
    // Modal Styling
    modalContainer: {
      position: 'absolute',
      top: 20,  // 20px from top of the screen
      right: 20,  // 20px from the right of the screen
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',  // Semi-transparent background
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 8,
      width: 150,  // Small square size
      height: 100,  // Small square height
      justifyContent: 'center',
      alignItems: 'center',
    },
    successText: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },
});

export default RegisterScreen;

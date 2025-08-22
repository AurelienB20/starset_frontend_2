
import { useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const ModifyNameScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser(); // Utilisation du contexte pour récupérer et mettre à jour les infos utilisateur

  const [firstname, setFirstname] = useState(user?.firstname || '');
  const [lastname, setLastname] = useState(user?.lastname || '');

  const updateName = async () => {
    try {
      // Mettre à jour l'utilisateur localement
      const updatedUser = { ...user, firstname, lastname };
      setUser(updatedUser);
      
      // Envoyer la mise à jour au serveur
      const response = await fetch(`${config.backendUrl}/api/auth/update-account-new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: updatedUser }),
      });
      if (!response.ok) throw new Error('Erreur de réseau');
      
      const data = await response.json();
      console.log('Mise à jour réussie:', data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compte:', error);
    }
  };

  const confirmUpdate = async () => {
    await updateName();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier votre nom</Text>
      
      <Text style={styles.label}>Prénom</Text>
      <TextInput
        style={styles.input}
        value={firstname}
        onChangeText={setFirstname}
      />
      
      <Text style={styles.label}>Nom</Text>
      <TextInput
        style={styles.input}
        value={lastname}
        onChangeText={setLastname}
      />
      
      <TouchableOpacity style={styles.confirmButton} onPress={confirmUpdate}>
        <Text style={styles.buttonText}>Confirmer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 20,
    color: 'black',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#00743C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default ModifyNameScreen;
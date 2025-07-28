
import { useCurrentWorkerPrestation } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const ModifyDescriptionScreen = () => {
  const navigation = useNavigation();
  const { currentWorkerPrestation, setCurrentWorkerPrestation } = useCurrentWorkerPrestation(); // Utilisation du contexte pour récupérer et mettre à jour les infos utilisateur

  const [description, setDescription] = useState(currentWorkerPrestation?.description || '');
  const [charCount, setCharCount] = useState(description.length);

  const handleDescriptionChange = (text : any) => {
    if (text.length <= 100) {
      setDescription(text);
      setCharCount(text.length);
    }
  };

  const updateDescription = async () => {
    try {
      // Mettre à jour l'utilisateur localement
      const updatedUser = { ...currentWorkerPrestation, description };
      setCurrentWorkerPrestation(updatedUser);
      
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
      console.error('Erreur lors de la mise à jour de la description:', error);
    }
  };

  const confirmUpdate = async () => {
    await updateDescription();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier votre description</Text>
      <Text style={styles.infoText}>decrivez simplement en quoi consiste votre prestation</Text>
      <Text style={styles.label}>Description ({charCount}/100)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={handleDescriptionChange}
        multiline
        maxLength={100}
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
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
  },
  infoText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  input: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#70FF70',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
});

export default ModifyDescriptionScreen;
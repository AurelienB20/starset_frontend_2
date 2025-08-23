
import { useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const ModifyEmailScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser(); // Utilisation du contexte pour récupérer et mettre à jour les infos utilisateur

  const [email, setEmail] = useState(user?.email || '');
  const [isValid, setIsValid] = useState(true);

  const validateEmail = (text : any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(text));
    setEmail(text);
  };

  const updateEmail = async () => {
    if (!isValid) return;
    try {
      // Mettre à jour l'utilisateur localement
      const updatedUser = { ...user, email };
      setUser(updatedUser);
      
      // Envoyer la mise à jour au serveur
      const response = await fetch(`${config.backendUrl}/api/auth/update-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: updatedUser }),
      });
      if (!response.ok) throw new Error('Erreur de réseau');
      
      const data = await response.json();
      console.log('Mise à jour réussie:', data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'email:", error);
    }
  };

  const confirmUpdate = async () => {
    if (isValid) {
      await updateEmail();
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier votre email</Text>
      
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, !isValid && styles.inputError]}
        value={email}
        onChangeText={validateEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {!isValid && <Text style={styles.errorText}>Veuillez entrer un email valide</Text>}
      
      <TouchableOpacity
        style={[styles.confirmButton, !isValid && styles.disabledButton]}
        onPress={confirmUpdate}
        disabled={!isValid}
      >
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
    marginBottom: 10,
    color: 'black',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#00743C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default ModifyEmailScreen;

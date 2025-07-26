import { useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const ModifyPhoneScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser();

  const [phone, setPhone] = useState(user?.phone || '');
  const [isValid, setIsValid] = useState(true);

  // Validation simple : que des chiffres, longueur entre 8 et 15 (à adapter selon besoin)
  const validatePhone = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, ''); // enlever tout sauf chiffres
    setPhone(cleaned);
    setIsValid(cleaned.length >= 8 && cleaned.length <= 15);
  };

  const updatePhone = async () => {
    if (!isValid) return;
    try {
      const updatedUser = { ...user, phone };
      setUser(updatedUser);

      const response = await fetch(`${config.backendUrl}/api/auth/update-account-new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: updatedUser }),
      });

      if (!response.ok) throw new Error('Erreur réseau');

      const data = await response.json();
      console.log('Mise à jour réussie:', data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du numéro de téléphone:", error);
    }
  };

  const confirmUpdate = async () => {
    if (isValid) {
      await updatePhone();
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier votre numéro de téléphone</Text>

      <Text style={styles.label}>Numéro de téléphone</Text>
      <TextInput
        style={[styles.input, !isValid && styles.inputError]}
        value={phone}
        onChangeText={validatePhone}
        keyboardType="phone-pad"
        maxLength={15}
        placeholder="Ex: 0612345678"
      />
      {!isValid && <Text style={styles.errorText}>Veuillez entrer un numéro valide (8 à 15 chiffres)</Text>}

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
    backgroundColor: '#70FF70',
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

export default ModifyPhoneScreen;

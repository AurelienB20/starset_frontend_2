//import 'react-native-get-random-values';
import { useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const ModifyPseudoScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser(); // Contexte utilisateur

  const [pseudo, setPseudo] = useState(user?.pseudo || '');
  const [pseudoError, setPseudoError] = useState(''); // État pour gérer l'erreur de pseudo

  // Vérification de la disponibilité du pseudo
  const checkPseudoAvailability = async (pseudo: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/check-pseudo-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du pseudo');
      }

      const data = await response.json();
      return data.isAvailable; // On suppose que le backend renvoie un objet avec une clé `isAvailable` qui est un booléen
    } catch (error) {
      console.error('Erreur lors de la vérification du pseudo:', error);
      return false; // Si l'appel échoue, on considère que le pseudo n'est pas disponible
    }
  };

  // Mise à jour du pseudo après vérification
  const updatePseudo = async () => {
    const isAvailable = true//await checkPseudoAvailability(pseudo);

    if (!isAvailable) {
      setPseudoError('Ce pseudo est déjà pris. Veuillez en choisir un autre.');
      return; // Ne pas continuer si le pseudo est déjà pris
    }

    try {
      const updatedUser = { ...user, pseudo };
      setUser(updatedUser);
      
      const response = await fetch(`${config.backendUrl}/api/auth/update-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: updatedUser }),
      });
      
      if (!response.ok) throw new Error('Erreur de réseau');
      
      const data = await response.json();
      console.log('Mise à jour réussie:', data);
      Alert.alert("Succès", "Le pseudo a été mis à jour avec succès!");
      setPseudoError(''); // Réinitialiser l'erreur après une mise à jour réussie
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pseudo:', error);
    }
  };

  const confirmUpdate = async () => {
    await updatePseudo();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      
      

      {/*CONTENU PRINCIPAL */}
      <View style={styles.content}>
        <Text style={styles.label}>Pseudo</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={styles.input}
            value={pseudo}
            onChangeText={setPseudo}
            autoCapitalize="none"
          />
        </View>

        {/* Affichage de l'erreur sous l'input si le pseudo est déjà pris */}
        {pseudoError ? (
          <Text style={styles.errorText}>{pseudoError}</Text>
        ) : null}

        <TouchableOpacity style={styles.confirmButton} onPress={confirmUpdate}>
          <Text style={styles.buttonText}>Confirmer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
    textAlign: 'center', // Centrage du titre
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },

  // CONTENU PRINCIPAL
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#70FF70',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  
  atSymbol: {
    fontSize: 16,
    color: '#888',
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },

  // Style pour le message d'erreur
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default ModifyPseudoScreen;

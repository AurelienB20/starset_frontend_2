import { useUser } from '@/context/userContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const VerificationScreen = () => {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useUser();
  const route = useRoute() as any;
  const { email, password} = route.params || {};

  const navigation = useNavigation();

  const handleCodeChange = (text: string) => {
    setVerificationCode(text);
    setCharCount(text.length);
  };

  const sendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/generate-new-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id : user?.id, communication_type : 'sms', contact_value : user?.number}),
      });

      if (!response.ok) throw new Error('Erreur de réseau lors de l\'envoi du code');

      const data = await response.json();
      console.log('Code envoyé:', data);
      setIsCodeSent(true);  // Le code a été envoyé, donc on permet à l'utilisateur de le saisir
    } catch (error) {
      setErrorMessage('Erreur lors de l\'envoi du code, veuillez réessayer.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setErrorMessage('Le code de vérification doit contenir 6 chiffres.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode, user_id: 'USER_ID' }), // Utiliser l'ID de l'utilisateur ici
      });

      const data = await response.json();

      if (!response.ok) {
        // Si la réponse n'est pas ok, traiter les erreurs spécifiques
        setErrorMessage(data.message || 'Code incorrect, veuillez vérifier et réessayer.');
      } else {
        // Si le code est valide et vérifié avec succès
        setSuccessMessage(data.message || 'Vérification réussie!');
        setErrorMessage(''); // Effacer les messages d'erreur
        navigation.navigate({
          name: 'selectFields',
          params: { email: email, password: password },
        } as never);
      }
    } catch (error) {
      setErrorMessage('Erreur lors de la vérification du code, veuillez réessayer.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification de votre numéro</Text>
      <Text style={styles.infoText}>Sécurisez votre compte en vérifiant votre numéro de téléphone.</Text>

      <Text style={styles.label}>
        {isCodeSent ? 'Renvoyer le code' : 'Envoyer le code par SMS au numéro'}
      </Text>
      
      {/* Si le code n'a pas encore été envoyé, afficher le bouton */}
      {!isCodeSent ? (
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendCode}
          disabled={isLoading} // Désactiver le bouton pendant le chargement
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Envoi en cours...' : 'Envoyer le code'}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          {/* Si le code a été envoyé, afficher le champ de saisie pour entrer le code */}
          <Text style={styles.label}>Entrez le code que vous avez reçu :</Text>
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={handleCodeChange}
            maxLength={6}  // Limite de 6 caractères pour un code de vérification classique
            keyboardType="numeric"
          />
          <Text style={styles.charCount}>{charCount}/6</Text>
          
          {/* Afficher les messages d'erreur ou de succès */}
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

          {/* Bouton pour soumettre le code */}
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={verifyCode}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Vérification en cours...' : 'Vérifier le code'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
    marginTop: 10,
    color: 'black',
  },
  charCount: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
    marginTop: 5,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  successText: {
    fontSize: 14,
    color: 'green',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default VerificationScreen;

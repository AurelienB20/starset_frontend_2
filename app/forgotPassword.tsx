import { useUser } from '@/context/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import config from '../config.json';

const VerificationScreen = () => {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');
  const { setUser } = useUser()

  const navigation = useNavigation();

  const handleCodeChange = (text: string) => {
    setVerificationCode(text);
    setCharCount(text.length);
  };

  const handleEmailChange = (text: React.SetStateAction<string>) => {
    setEmail(text);
  };

  const sendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/send-email-verification-code-if-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email : email.toLocaleLowerCase(),
        }),
      });
      if (!response.ok) throw new Error('Erreur réseau lors de l’envoi du code.');
      const data = await response.json();
      if(data.success == true)
      {
        console.log('Code envoyé par mail :', data);
        setIsCodeSent(true);
        setErrorMessage('');
        setSuccessMessage('Un e-mail de vérification a été envoyé. Pensez à vérifier votre boîte spam !');
      }
      else
      {
        setErrorMessage('e-mail non valide');
      }
    } catch (error) {
      setErrorMessage('Erreur lors de l’envoi de l’e-mail. Veuillez réessayer.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

const getProfile = async (accountId :any) => {
    try {
      
      if (!accountId) return;

      const response = await fetch(`${config.backendUrl}/api/auth/get-account-by-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) throw new Error('Erreur de réseau');

      const data = await response.json();
      if(data)
      {
        console.log('Utilisateur chargé:', data.account);
        saveData(data.account);
        setUser(data.account); // Met à jour le contexte utilisateur
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
};
const saveData = async (account: any) => {
    try {
      console.log(account)
      await AsyncStorage.setItem('account_id', account['id']);
      await AsyncStorage.setItem('worker_id', account['worker']);
      await AsyncStorage.setItem('firstname', account['firstname']);
      await AsyncStorage.setItem('lastname', account['lastname']);
    } catch (e) {
      // gérer les erreurs de stockage ici
      console.error('Erreur lors de la sauvegarde du type de compte', e);
    }
};

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setErrorMessage('Le code de vérification doit contenir 6 chiffres.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/verify-code-and-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode, contact_value : email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Code incorrect, veuillez vérifier et réessayer.');
      } else {
        setSuccessMessage(data.message || 'Adresse e-mail vérifiée avec succès !');
        setErrorMessage('');
        getProfile(data.id)
        navigation.navigate({
           name: '(tabs)',
          params: { screen: 'home' },
        } as never);
      }
    } catch (error) {
      setErrorMessage('Erreur lors de la vérification. Veuillez réessayer.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
        <Text style={styles.title}>Vérification de votre adresse e-mail</Text>
          <Text style={styles.infoText}>
            Pour sécuriser votre compte, nous avons besoin de vérifier votre adresse e-mail.
          </Text>

            <TextInput
                  style={styles.input}
                  onChangeText={handleEmailChange}
                  placeholder="chapter@exemple.com"
                  placeholderTextColor="#808080"
                />
          {<Text style={styles.errorText}>{errorMessage}</Text>}
          {!isCodeSent ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendCode}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Envoi en cours...' : 'Envoyer l’e-mail'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.label}>Entrez le code reçu par e-mail :</Text>
              <TextInput
                style={styles.input}
                value={verificationCode}
                onChangeText={handleCodeChange}
                maxLength={6}
                keyboardType="numeric"
              />
              <Text style={styles.charCount}>{charCount}/6</Text>

              {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
              {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
              
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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    
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
    color:'black',
    marginTop: 10,
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

  tipText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default VerificationScreen;

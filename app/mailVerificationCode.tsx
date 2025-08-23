import { useUser } from '@/context/userContext';
import { useNavigation, useRoute } from '@react-navigation/native';
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
    console.log(1)
    console.log(1)
    console.log(1)
    console.log(1)
    console.log(1)
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/send-email-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          
          email : email,
        }),
      });
      if (!response.ok) throw new Error('Erreur réseau lors de l’envoi du code.');
      const data = await response.json();
      console.log('Code envoyé par mail :', data);
      setIsCodeSent(true);
      setErrorMessage('');
      setSuccessMessage('Un e-mail de vérification a été envoyé. Pensez à vérifier votre boîte spam !');
    } catch (error) {
      setErrorMessage('Erreur lors de l’envoi de l’e-mail. Veuillez réessayer.');
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
        body: JSON.stringify({ code: verificationCode, contact_value : email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Code incorrect, veuillez vérifier et réessayer.');
      } else {
        setSuccessMessage(data.message || 'Adresse e-mail vérifiée avec succès !');
        setErrorMessage('');
        navigation.navigate({
          name: 'selectFields',
          params: { email: email, password: password },
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

          <Text style={styles.label}>
            {isCodeSent ? 'Vous pouvez renvoyer un e-mail si besoin :' : `Envoyer un e-mail de vérification à ${email}`}
          </Text>

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
    marginTop: 10,
    color:'black',
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

import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const CreationScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const navigation = useNavigation();

  const handleEmailChange = (text : any) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(text));
  };

  const handlePasswordChange = (text : any) => {
    setPassword(text);
  };

  const handleConfirmPasswordChange = (text : any) => {
    setConfirmPassword(text);
  };

  const handleSubmit = async () => {
    if (!isEmailValid) {
      setErrorMessage('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    try 
    {
      const response = await fetch(`${config.backendUrl}/api/auth/send-email-verification-code-if-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          
          email : email,
        }),
      });
      if (!response.ok) throw new Error('Erreur réseau.');
      const data = await response.json();
      if(data.success == true)
      {
        setErrorMessage('e-mail existe déjà');
      }
      else
      {
        navigation.navigate(
                            {
                            name: 'mailVerificationCode',
                            params: { email: email, password: password },
                            } as never
                          );
      }
    } 
    catch (error) 
    {
      setErrorMessage('Erreur lors de l’envoi de l’e-mail. Veuillez réessayer.');
      console.error(error);
    } 
    finally
    {
    } 
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.enter}>Création par Email !</Text>
      <Text style={styles.subtitle}>
        Laissez-nous identifier votre profil, Star Set n'attend plus que vous !
      </Text>
      
      <TextInput
        style={[styles.inputemailcreation, !isEmailValid && styles.inputError]}
        onChangeText={handleEmailChange}
        placeholder="starset@exemple.com"
        placeholderTextColor="#808080"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {!isEmailValid && <Text style={styles.errorText}>Email invalide</Text>}
      
      <TextInput
        style={styles.inputpassword}
        onChangeText={handlePasswordChange}
        placeholder="Mot de passe"
        placeholderTextColor="#808080"
        secureTextEntry={true}
      />
      
      <TextInput
        style={styles.inputpassword}
        onChangeText={handleConfirmPasswordChange}
        placeholder="Confirmer le mot de passe"
        placeholderTextColor="#808080"
        secureTextEntry={true}
      />
      
      {errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}
      
      <TouchableOpacity
        onPress={handleSubmit}
        style={styles.submitbutton}
        disabled={!isEmailValid}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color : 'white' }}>Suivant</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  enter: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 40,
    marginHorizontal: 20,
    color: 'black',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 10,
    textAlign: 'center',
    color: 'black',
    marginBottom: 50,
  },
  inputemailcreation: {
    width: '70%',
    maxWidth: 450,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'black',
    color: 'black',
    textAlign: 'center',
    fontSize: 15,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 30,
  },
  inputpassword: {
    width: '70%',
    maxWidth: 450,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'black',
    color: 'black',
    textAlign: 'center',
    fontSize: 15,
    padding: 10,
    marginTop: 10,
    paddingHorizontal: 30,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  submitbutton: {
    maxWidth: 300,
    width: '60%',
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 25,
    
  },
});

export default CreationScreen;
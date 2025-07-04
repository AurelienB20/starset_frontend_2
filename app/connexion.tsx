import { useNavigation } from '@react-navigation/native';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useUser } from '@/context/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import config from '../config.json';

const ConnexionScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();
  const { setUser } = useUser()

  const handleEmailChange = (text: React.SetStateAction<string>) => {
    setEmail(text);
  };

  const handlePasswordChange = (text: React.SetStateAction<string>) => {
    setPassword(text);
  };

  const goToCreate = () => {
    navigation.navigate('creation' as never)
  };

  const goToForgotPassword = () => navigation.navigate('forgotPassword' as never);

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

      setUser(data.account); // Met à jour le contexte utilisateur
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.success) {
        // Rediriger ou faire autre chose en cas de succès
        getProfile(data.account['id'])
        saveData(data.account)
       
        
        navigation.navigate({
          name: '(tabs)',
          params: { screen: 'home' },
        } as never);
        
      } else {
        setErrorMessage('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setEmail('');
      setPassword('');
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

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const isFormValid = email.length > 0 && password.length > 0;

  useEffect(() => {
    console.log("email:", email, "password:", password);
    console.log("form is valid:", isFormValid);
  }, [email, password]);

  useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    setEmail('');
    setPassword('');
    setErrorMessage('');
  });

  return () => {
    unsubscribe();
  };
}, [navigation]);


  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}></View>

      <Text style={styles.enter}>Connectez vous !</Text>
      
      <Text style={styles.description}>
        Laissez-nous identifier votre profil, Star Set n'attend plus que vous !
      </Text>
      <View style={styles.separator}></View>

      <TextInput
        style={styles.input}
        onChangeText={handleEmailChange}
        placeholder="chapter@exemple.com"
        placeholderTextColor="#808080"
        value = {email}
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { width: '100%' }]}
          onChangeText={handlePasswordChange}
          placeholder="Mot de passe"
          placeholderTextColor="#808080"
          secureTextEntry={true}
          value = { password }
        />
        <TouchableOpacity onPress={goToForgotPassword} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer}></View>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.connexionbutton]}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>Connexion</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={goToCreate}>
        <Text >
          Vous n'avez pas encore de compte ? <Text style={styles.createAccount}>inscrivez-vous !</Text>
        </Text>
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
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#A0A0FF",
    borderRadius: 50,
    marginBottom: 100,
    top: 80,
  },
  separator: {
    width: '50%',
    height: 3,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 20,
  },
  spacer: {
    width: '100%',
    height: 30,
  },

  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color : 'white',
    fontFamily : 'Lexend'
  },

  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },

  enter: {
    fontWeight: 'bold',
    textAlign: 'center',
    
    fontSize: 40,
    marginTop: 0,
    marginHorizontal : 20,
    
    
    color : 'black'
},
description: {
  
  fontSize: 13,
  textAlign: "center",
  color : 'black',
  marginHorizontal : 10,
  
},

createAccount : {
  color : '#7ED957'
},
input: {
  fontFamily: "Outfit",
  width: "80%", // Utilisation de pourcentage pour la largeur,
  height : 46,
  //maxWidth: 450, // Nombre pour maxWidth
  backgroundColor: "white",
  borderRadius: 23, // Nombre pour borderRadius
  borderWidth: 2, // Utilisation de borderWidth
  borderColor: "black", // Utilisation de borderColor
  color: "black",
  textAlign: "center",
  fontSize: 15,
  padding: 10, // Nombre pour padding
  marginTop: 20, // Nombre pour marginTop
  marginHorizontal: 10, // Nombre pour marginHorizontal
  paddingHorizontal: 30, // Nombre pour paddingHorizontal
  // transition: "all 0.5s", // Non pris en charge, utilisez Animated pour les animations
},

connexionbutton: {
  width: "70%", // Utilisation de pourcentage pour la largeur
  maxWidth: 400, // Nombre pour maxWidth
  height: 50,
  backgroundColor: "#00BF63",
  justifyContent: "center",
  alignItems: "center",
  marginVertical: 10,
  borderRadius: 10,
  marginHorizontal: 10,
},

passwordContainer: {
  width: '80%',
  maxWidth: 450,
  alignItems: 'center',
},
forgotPassword: {
  marginTop: 5,
  alignSelf : 'flex-end'
},
forgotPasswordText: {
  color: 'blue',
  fontSize: 12,
  textAlign : 'right'
},

});

export default ConnexionScreen;
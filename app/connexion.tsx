
import { useAllWorkerPlannedPrestation, useAllWorkerPrestation, useUser } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';


const ConnexionScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();
  const { setUser } = useUser()
  
const { setAllWorkerPlannedPrestation } = useAllWorkerPlannedPrestation();
const { setAllWorkerPrestation } = useAllWorkerPrestation();

  const handleEmailChange = (text: string) => setEmail(text);
  //const handleEmailChange = (text: string) => setEmail(text.toLocaleLowerCase());
  const handlePasswordChange = (text: string) => setPassword(text);
  const togglePasswordVisibility = () => setShowPassword(prev => !prev); // 

  const goToCreate = () => navigation.navigate('creation' as never);
  const goToForgotPassword = () => navigation.navigate('forgotPassword' as never);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/login-crypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.success) {
        const account = data.account;
        setUser(account);
        saveData(account);
      
        await getWorkerPlannedPrestation(account.worker);
        await getAllWorkerPrestation(account.id);
      
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

  const getWorkerPlannedPrestation = async (workerId: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-worker-planned-prestation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: workerId }),
      });
      const data = await response.json();
      setAllWorkerPlannedPrestation(data.plannedPrestations);
    } catch (err) {
      console.error('Erreur getWorkerPlannedPrestation:', err);
    }
  };
  
  const getAllWorkerPrestation = async (accountId: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-all-prestation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      });
      const data = await response.json();
      setAllWorkerPrestation(data.prestations);
    } catch (err) {
      console.error('Erreur getAllWorkerPrestation:', err);
    }
  };
  

const getProfile = async (accountId: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/get-account-by-id-crypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      const data = await response.json();
      console.log(data.account)
      setUser(data.account);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const saveData = async (account: any) => {
    try {
      await AsyncStorage.setItem('account_id', account.id);
      await AsyncStorage.setItem('worker_id', account.worker);
      await AsyncStorage.setItem('firstname', account.firstname);
      await AsyncStorage.setItem('lastname', account.lastname);
    } catch (e) {
      console.error('Erreur lors de la sauvegarde du type de compte', e);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    setEmail('');
    setPassword('');
    setErrorMessage('');
    console.log('Navigation focus: reset state');
  });

  return () => {
    console.log('Cleaning up navigation listener');
    unsubscribe();
  };
}, [navigation]);


  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}></View>
      <Text style={styles.enter}>Connectez-vous !</Text>
      <Text style={styles.description}>
        Laissez-nous identifier votre profil, Star Set n'attend plus que vous !
      </Text>
      <View style={styles.separator}></View>

      <TextInput
        style={styles.input}
        onChangeText={handleEmailChange}
        placeholder="chapter@exemple.com"
        placeholderTextColor="#808080"
        value={email}
      />

      {/* Password avec œil 👁️ */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          onChangeText={handlePasswordChange}
          placeholder="Mot de passe"
          placeholderTextColor="#808080"
          secureTextEntry={!showPassword}
          value={password}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={goToForgotPassword} style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.connexionbutton]}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>Connexion</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToCreate}>
        <Text>
          Vous n'avez pas encore de compte ?{' '}
          <Text style={styles.createAccount}>inscrivez-vous !</Text>
        </Text>
      </TouchableOpacity>
      <View style={styles.footer}>
  <Text style={styles.footerText}>StarSet</Text>
</View>
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
    backgroundColor: '#A0A0FF',
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
  enter: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 34,
    marginTop: 0,
    marginHorizontal: 20,
    color: 'black',
  },
  passwordWrapper: {
  width: '80%',
  height: 46,
  marginTop: 20,
  borderWidth: 2,
  borderRadius: 23,
  borderColor: 'black',
  backgroundColor: 'white',
  flexDirection: 'row',       // ← pour disposer le champ et l’icône horizontalement
  alignItems: 'center',
  paddingHorizontal: 15,      // ← un peu de padding intérieur
  position: 'relative',
},
  passwordInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Outfit',
    color: 'black',
    textAlign: 'center', // ← centre le texte
    paddingHorizontal: 15,    // ← espace pour ne pas que l'œil le recouvre
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
    marginTop: 0,
    marginHorizontal : 20,
    color : 'white'
},
description: {
  
  fontSize: 13,
  textAlign: "center",
  color : 'black',
  marginHorizontal : 10,
},
description2: {
  fontWeight: 'bold',
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
  
  fontSize: 12,
  textAlign : 'right'
},

footer: {
  position: 'absolute',
  bottom: 20,
  width: '100%',
  alignItems: 'center',
},

footerText: {
  fontSize: 16,
  color: '#666',
  fontWeight: '600',
},


});

export default ConnexionScreen;

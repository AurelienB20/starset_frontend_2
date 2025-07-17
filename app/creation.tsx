import { Ionicons } from '@expo/vector-icons';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import config from '../config.json';

const CreationScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
 

  const navigation = useNavigation();

  

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(text));
  };

  const handlePasswordChange = (text: string) => setPassword(text);
  const handleConfirmPasswordChange = (text: string) => setConfirmPassword(text);

  const handleSubmit = async () => {
    if (!isEmailValid) {
      setErrorMessage('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!acceptedPrivacy) {
      setErrorMessage('Vous devez accepter la politique de confidentialité.');
      return;
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/auth/send-email-verification-code-if-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Erreur réseau.');
      const data = await response.json();
      if (data.success === true) {
        setErrorMessage('e-mail existe déjà');
      } else {
        navigation.navigate({
          name: 'mailVerificationCode',
          params: { email, password },
        } as never);
      }
    } catch (error) {
      setErrorMessage('Erreur lors de l’envoi de l’e-mail. Veuillez réessayer.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        value={email}
      />
      {!isEmailValid && <Text style={styles.errorText}>Email invalide</Text>}

      {/* Mot de passe */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          onChangeText={handlePasswordChange}
          placeholder="Mot de passe"
          placeholderTextColor="#808080"
          secureTextEntry={!showPassword}
          value={password}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Confirmation mot de passe */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          onChangeText={handleConfirmPasswordChange}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#808080"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Case à cocher + lien */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <CheckBox
          value={acceptedPrivacy}
          onValueChange={setAcceptedPrivacy}
          tintColors={{ true: '#4CAF50', false: 'black' }}
        />
        <Pressable onPress={() => setModalVisible(true)}>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
            J’ai lu et j’accepte la politique de confidentialité
          </Text>
        </Pressable>
      </View>

      {errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity
        onPress={handleSubmit}
        style={styles.submitbutton}
        disabled={!isEmailValid || !acceptedPrivacy}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Suivant</Text>
      </TouchableOpacity>

      {/* Modal WebView PDF */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <View style={{ padding: 10, backgroundColor: '#eee', alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 18, color: 'blue' }}>Fermer</Text>
            </TouchableOpacity>
          </View>
          <WebView
  source={{ uri: 'https://api.starsetfrance.com/media/assets/politique_de_confidentialite.pdf' }}
  style={{ flex: 1 }}
  originWhitelist={['*']}
/>
        </View>
      </Modal>
    </ScrollView>
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
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  passwordWrapper: {
    width: '70%',
    maxWidth: 450,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'white',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    color: 'black',
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  submitbutton: {
    maxWidth: 300,
    width: '60%',
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderRadius: 25,
  },
});

export default CreationScreen;

import { useUser } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../config.json';

const ModifyPasswordScreen = () => {
  const navigation = useNavigation();
  const { user,setUser } = useUser();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  // règles comme dans CreationScreen
  const [passwordValidity, setPasswordValidity] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasDigit: false,
    hasSpecialChar: false,
  });

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);

    setPasswordValidity({
      minLength: text.length >= 8,
      hasUppercase: /[A-Z]/.test(text),
      hasLowercase: /[a-z]/.test(text),
      hasDigit: /[0-9]/.test(text),
      hasSpecialChar: /[^A-Za-z0-9]/.test(text),
    });

    // revalide la confirmation
    setIsConfirmPasswordValid(text === confirmPassword);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setIsConfirmPasswordValid(text === newPassword);
  };

  const isPasswordValid = Object.values(passwordValidity).every(Boolean);
  const isFormValid = isPasswordValid && isConfirmPasswordValid && oldPassword.length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) {
      setErrorMessage('Veuillez remplir correctement tous les champs.');
      return;
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/auth/modify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId : user?.id,
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du mot de passe');
      }

      const data = await response.json();
      console.log('Password update success:', data);
      Alert.alert('Succès', 'Votre mot de passe a été mis à jour avec succès !');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossible de mettre à jour le mot de passe. Vérifiez l'ancien mot de passe.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier le mot de passe</Text>

      {/* Ancien mot de passe */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Ancien mot de passe"
          placeholderTextColor="#808080"
          secureTextEntry={!showOldPassword}
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} style={styles.eyeIcon}>
          <Ionicons name={showOldPassword ? 'eye-off' : 'eye'} size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Nouveau mot de passe */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Nouveau mot de passe"
          placeholderTextColor="#808080"
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={handleNewPasswordChange}
        />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
          <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Confirmation */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirmer le nouveau mot de passe"
          placeholderTextColor="#808080"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {!isConfirmPasswordValid && (
        <Text style={styles.errorText}>Les mots de passe ne correspondent pas.</Text>
      )}

      {/* Règles mot de passe */}
      <View style={styles.rules}>
        <Text style={{ color: passwordValidity.minLength ? 'green' : 'black' }}>• 8 caractères minimum</Text>
        <Text style={{ color: passwordValidity.hasUppercase ? 'green' : 'black' }}>• au moins une majuscule</Text>
        <Text style={{ color: passwordValidity.hasLowercase ? 'green' : 'black' }}>• une minuscule</Text>
        <Text style={{ color: passwordValidity.hasDigit ? 'green' : 'black' }}>• au moins un chiffre</Text>
        <Text style={{ color: passwordValidity.hasSpecialChar ? 'green' : 'black' }}>• au moins un caractère spécial</Text>
      </View>

      {errorMessage !== '' && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.submitButton, { backgroundColor: isFormValid ? '#4CAF50' : '#ccc' }]}
        disabled={!isFormValid}
      >
        <Text style={styles.submitText}>Confirmer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ModifyPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: 'black',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'white',
    marginTop: 15,
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
  rules: {
    marginTop: 15,
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 25,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

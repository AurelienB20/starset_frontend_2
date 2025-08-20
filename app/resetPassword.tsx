import { useUser } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { accountId } = route.params as { accountId: string };
  const { setUser } = useUser();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
  };

  const isPasswordValid = Object.values(passwordValidity).every(Boolean);
  const isFormValid = isPasswordValid && newPassword === confirmPassword;

  const handleSubmit = async () => {
    if (!isFormValid) {
      setErrorMessage('Veuillez remplir correctement tous les champs.');
      return;
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du mot de passe');
      }

      const data = await response.json();
      console.log('Password reset success:', data);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'isVisitor' }],
        })
      );

      Alert.alert('Succès', 'Votre mot de passe a été mis à jour avec succès !');
      
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossible de mettre à jour le mot de passe.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Définir un nouveau mot de passe</Text>

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

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', color: 'black' },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 15, borderWidth: 2,
    borderColor: 'black', backgroundColor: 'white', marginTop: 15, paddingHorizontal: 15,
  },
  passwordInput: { flex: 1, fontSize: 15, paddingVertical: 10, color: 'black' },
  eyeIcon: { paddingLeft: 10 },
  errorText: { color: 'red', marginTop: 10, fontSize: 14 },
  submitButton: { marginTop: 25, paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});

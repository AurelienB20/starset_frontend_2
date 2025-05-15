import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useUser } from '@/context/userContext';
import * as ImagePicker from 'expo-image-picker';
import config from '../config.json';

const ProfilePhotoScreen = () => {
  const { user } = useUser();
  const [photo, setPhoto] = useState<any>(user?.profile_picture_url ? { uri: user.profile_picture_url } : null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const getAccountId = async () => {
    try {
      const account_id = await AsyncStorage.getItem('account_id');
      return account_id;
    } catch (e) {
      console.error('Erreur lors de la récupération du type de compte', e);
    }
  };

  const uploadProfilePhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', "Vous devez autoriser l'accès à la galerie pour continuer.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) {
      Alert.alert('Erreur', 'Aucune photo sélectionnée');
      return;
    }

    const photoUri = result.assets[0].uri;
    setPhoto({ uri: photoUri });
    setUploading(true);
    setLoading(true);

    try {
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const reader = new FileReader();
      const account_id = await getAccountId();

      reader.onloadend = async () => {
        const base64Data = reader.result;
        const file = {
          filename: 'profile-photo.jpg',
          mimetype: 'image/jpeg',
          data: base64Data,
        };

        const uploadResponse = await fetch(`${config.backendUrl}/api/uploads/upload-profile-picture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file, account_id }),
        });

        if (uploadResponse.ok) {
          const responseData = await uploadResponse.json();
          await AsyncStorage.setItem('profile_picture', responseData.dbRecord.profile_picture_url);
          setPhoto(responseData.dbRecord.profile_picture_url)
          Alert.alert('Succès', 'Photo téléchargée avec succès');
        } else {
          Alert.alert('Erreur', 'Échec du téléchargement');
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors du téléchargement');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>PHOTO DE PROFIL</Text>
      <Text style={styles.subHeaderText}>Un petit sourire pour la caméra ! Cheeeeeese 📸</Text>
      <View style={{ width: '100%', height: 50 }}></View>
      <View style={styles.photoContainer}>
        {photo ? (
          <Image source={photo} style={styles.profilePhoto} />
        ) : (
          <Image source={{ uri: 'https://img.20mn.fr/wb0GX0XqSd2N4Y3ItfLEGik/1444x920_squeezie-youtubeur-chanteur-et-desormais-auteur-de-bd' }} style={styles.profilePhoto} />
        )}
      </View>
      <View style={{ width: '100%', height: 10 }}></View>
      <TouchableOpacity style={styles.button} onPress={uploadProfilePhoto} disabled={uploading}>
        <Text style={styles.buttonText}>Choisir sa photo</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      <Text style={styles.footerText}>Star Set</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 60,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginVertical: 20,
  },
  photoContainer: {
    width: 300,
    height: 300,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#DDDDDD',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  footerText: {
    fontSize: 16,
    color: 'black',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
});

export default ProfilePhotoScreen;

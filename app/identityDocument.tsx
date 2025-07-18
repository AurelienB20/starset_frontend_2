import { useUser } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const IdentityUploadScreen = () => {
  const [identityFile, setIdentityFile] = useState<any>(null);
  const [identityType, setIdentityType] = useState<'camera' | 'file' | null>(null);

  const navigation = useNavigation();
  const { user } = useUser(); // 👈 récupération de l'utilisateur

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l’accès à la caméra pour continuer.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setIdentityFile(result.assets[0]);
      setIdentityType('camera');
    }
  };

  const pickFromFiles = async () => {
    try {
      const result: any = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.type === 'success') {
        setIdentityFile(result);
        setIdentityType('file');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Échec de la sélection du document.');
    }
  };

  const handleNext = () => {

    // Tu peux utiliser user.id ici si besoin :
    console.log('ID utilisateur :', user?.id);
    Alert.alert('Succès', 'Pièce d’identité sélectionnée.');

    navigation.navigate('chooseAccount' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Bienvenue {user?.firstName} {user?.lastName} !
      </Text>
      <Text style={styles.subtitle}>
        Veuillez fournir une pièce d’identité pour commencer vos activités.
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.optionButton} onPress={pickFromCamera}>
          <Ionicons name="camera-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Scanner avec la caméra</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={pickFromFiles}>
          <Ionicons name="document-text-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Importer un document</Text>
        </TouchableOpacity>
      </View>

      {identityFile && (
        <View style={styles.preview}>
          <Text style={styles.previewText}>Document sélectionné :</Text>
          {identityType === 'camera' && (
            <Image
              source={{ uri: identityFile.uri }}
              style={{ width: 200, height: 150, borderRadius: 10, marginTop: 10 }}
              resizeMode="contain"
            />
          )}
          {identityType === 'file' && (
            <Text style={{ color: '#333', marginTop: 10 }}>{identityFile.name}</Text>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Suivant</Text>
      </TouchableOpacity>
    </View>
  );
};

export default IdentityUploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  preview: {
    alignItems: 'center',
    marginBottom: 30,
  },
  previewText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#32CD32',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  nextButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

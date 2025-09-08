import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const saveMode = async (mode: string) => {
  try {
    await AsyncStorage.setItem('mode', mode);
  } catch (e) {
    console.error('Erreur lors de la sauvegarde du mode', e);
  }
};

const ChooseProfileScreen = () => {
  const navigation = useNavigation();

  const handleParticulierPress = () => {
    saveMode('particulier');
    // Naviguer vers l'écran approprié, à adapter selon ta navigation
    navigation.navigate('workerPartiForm' as never);
  };

  const handleWorkerPress = () => {
    saveMode('worker');
    navigation.navigate('workerProForm' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle} />

      <Text style={styles.title}>
        AVEC QUEL STATUT{'\n'}
        SOUHAITEZ-VOUS CRÉER{'\n'}
        VOTRE PROFIL WORKER ?
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.particulier]} onPress={handleParticulierPress}>
          <Text style={styles.buttonText}>Particulier</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.worker]} onPress={handleWorkerPress}>
          <Text style={styles.buttonText}>Worker</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Star Set</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8da7bf', // bleu doux similaire à l’image
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 60,
    color : 'black'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    flex: 1,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  particulier: {
    backgroundColor: '#2e8b57', // vert
  },
  worker: {
    backgroundColor: '#f1c40f', // jaune
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    fontSize: 14,
    color: '#000',
  },
});

export default ChooseProfileScreen;

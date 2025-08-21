import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export const saveMode = async (mode: string) => {
  try {
    await AsyncStorage.setItem('mode', mode);
  } catch (e) {
    // gérer les erreurs de stockage ici
    console.error('Erreur lors de la sauvegarde du mode', e);
  }
};

const ChooseAccountScreen = () => {
  const [email, setEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const navigation = useNavigation();

  const handleEmail = (text: React.SetStateAction<string>) => {
    setEmail(text);
  };

  const handleSubmit = async () => {
    
  };

  const handleWorkerPress = () => {
    saveMode('worker')
    navigation.navigate('(tabs_worker)' as never);
  };

  const handleUserPress = () => {
    saveMode('user')
    navigation.navigate('(tabs)' as never);
    // Vous pouvez ajouter une navigation similaire pour l'utilisateur ici si nécessaire
  };

  

  return (
    <View style={styles.container}>
      <View style={styles.circle}></View>

      <View style={styles.spacer}></View>
      
      <Text style={styles.title}>
        Quel profil souhaitez-vous créer
      </Text>
      
      <View style={styles.spacerLarge}></View>

      <View style={styles.typeofprofile}>
        <TouchableOpacity style={styles.square} onPress={handleUserPress}>
          <Image 
            source={{ uri : "https://cdn-icons-png.flaticon.com/512/177/177871.png"}}
            style={styles.image}
          />
          <Text style={styles.squaretitle}>User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.square} onPress={handleWorkerPress}>
        <Image 
          source={{ uri: "https://w7.pngwing.com/pngs/633/852/png-transparent-computer-icons-laborer-construction-worker-industrial-worker-photography-people-silhouette-thumbnail.png" }} 
          style={styles.image} 
        />

          <Text style={styles.squaretitle}>Worker</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Star set
      </Text>
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
  circle: {
    width: 100,
    height: 100,
    backgroundColor: "#A0A0FF",
    borderRadius: 50,
    top: 80,
    marginBottom: 50,
  },
  spacer: {
    width: '100%',
    height: 30,
  },
  spacerLarge: {
    width: '100%',
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color : 'black'
  },
  typeofprofile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  square: {
    width: 150,
    height: 150,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    margin: 10,
  },
  image: {
    width: 50,
    height: 50,
  },
  squaretitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color : 'black'
  },
  footer: {
    fontSize: 16, 
    color: 'black', 
    position: 'absolute', 
    bottom: 30, 
    left: 0, 
    right: 0, 
    textAlign: 'center',
  }
});

export default ChooseAccountScreen;

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AccessScreen = () => {
  const navigation = useNavigation();

  const goToInscription = () => {
    navigation.navigate('creation'  as never); // Navigue vers l’écran d’inscription
  };

  const goToConnexion = () => {
    navigation.navigate('connexion' as never); // Navigue vers l’écran de connexion
  };

  const goToVisitorAccess = () => {
    navigation.navigate({
        name: '(tabs)',
        params: { screen: 'search' },
      } as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>COMMENT SOUHAITEZ-VOUS ACCÉDER À L’APPLICATION ?</Text>

      <TouchableOpacity style={styles.inscriptionBtn} onPress={goToInscription}>
        <Text style={styles.btnText}>INSCRIPTION</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.connexionBtn} onPress={goToConnexion}>
        <Text style={styles.btnText}>CONNEXION</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.visitorBtn} onPress={goToVisitorAccess}>
        <Text style={styles.visitorText}>ACCÈS VISITEUR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 40,
    color: '#008000',
  },
  inscriptionBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  connexionBtn: {
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  visitorBtn: {
    backgroundColor: '#d3d3d3',
    padding: 15,
    borderRadius: 10,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  visitorText: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AccessScreen;

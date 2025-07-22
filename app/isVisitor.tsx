import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const AccessScreen = () => {
  const navigation = useNavigation();
  const [infoVisible, setInfoVisible] = useState(false);

  const goToInscription = () => navigation.navigate('creation' as never);
  const goToConnexion = () => navigation.navigate('connexion' as never);
  const goToVisitorAccess = () =>
    navigation.navigate({
      name: '(tabs)',
      params: { screen: 'search' },
    } as never);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>COMMENT SOUHAITEZ-VOUS ACCÉDER À L’APPLICATION ?</Text>

      <TouchableOpacity style={styles.inscriptionBtn} onPress={goToInscription}>
        <Text style={styles.btnText}>INSCRIPTION</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.connexionBtn} onPress={goToConnexion}>
        <Text style={styles.btnText}>CONNEXION</Text>
      </TouchableOpacity>

      {/* Bouton "Accès visiteur" avec icône info */}
      <View style={styles.visitorContainer}>
        <TouchableOpacity style={styles.visitorBtn} onPress={goToVisitorAccess}>
          <Text style={styles.visitorText}>ACCÈS VISITEUR</Text>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#333"
            style={styles.infoIcon}
            onPress={() => setInfoVisible(true)}
          />
        </TouchableOpacity>
      </View>

      {/* Modal d'information */}
      <Modal visible={infoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              En accédant à l'application en tant que visiteur, vous ne pourrez pas utiliser
              les fonctionnalités principales, comme travailler ou commander une prestation.
              Cette version vous permet uniquement de consulter l'application à titre informatif.
              Pour profiter pleinement de tous les services, une inscription est nécessaire.
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setInfoVisible(false)}>
              <Text style={styles.closeBtnText}>FERMER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  visitorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitorBtn: {
    backgroundColor: '#d3d3d3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginLeft: 10,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  visitorText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 25,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 20,
  },
  closeBtn: {
    alignSelf: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AccessScreen;

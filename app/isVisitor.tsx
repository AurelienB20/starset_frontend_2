import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
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
  <Image source={require('@/assets/images/etoile-starset-blanc.png')} style={styles.starIconAbsolute} />
</TouchableOpacity>

<TouchableOpacity style={styles.connexionBtn} onPress={goToConnexion}>
  
    <Text style={styles.btnText}>CONNEXION</Text>
    <Image source={require('@/assets/images/etoile-starset-blanc.png')} style={styles.starIconAbsolute} />
  
</TouchableOpacity>

<View style={styles.visitorRow}>
  <TouchableOpacity style={styles.visitorBtn} onPress={goToVisitorAccess}>
    <View style={styles.btnWithIcon}>
      <Text style={[styles.btnText, { color: '#333' }]}>ACCÈS VISITEUR</Text>
      <Ionicons name="chevron-forward" size={22} color="#333" />
    </View>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => setInfoVisible(true)} style={styles.infoOutsideBtn}>
    <Ionicons name="information-circle-outline" size={22} color="#333" />
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
            <View style={styles.footer}>
        <Text style={styles.footerText}>StarSet</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems : 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: 40,
    color: '#008000',
  },
  inscriptionBtn: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 3,
    marginBottom: 15,
    width : '80%'
  },
  connexionBtn: {
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 3,
    marginBottom: 15,
     width : '80%',
  },
  visitorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
     width : '80%'
  },
  visitorBtn: {
    backgroundColor: '#d3d3d3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent : 'center',
    width : '100%'
  },
  infoIcon: {
    marginLeft: 10,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize : 20
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

  footer: {
  position: 'absolute',
  bottom: 30,
  width: '100%',
  alignItems: 'center',
},

footerText: {
  fontSize: 16,
  color: '#666',
  fontWeight: '600',
},

btnWithIcon: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
},

starIcon: {
  width: 40,
  height: 40,
  resizeMode: 'contain',
},

visitorRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '80%',
  marginTop: 10,
},

infoOutsideBtn: {
  marginLeft: 10,
},

starIconAbsolute: {
  position: 'absolute',
  right: 15,
  top: '70%',
  transform: [{ translateY: -10 }],
  width: 40,
  height: 40,
  resizeMode: 'contain',
},


});

export default AccessScreen;

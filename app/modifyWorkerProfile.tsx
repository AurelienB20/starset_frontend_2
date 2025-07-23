import { useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import config from '../config.json';


const ModifyWorkerProfileScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser();
  const [showKbisModal, setShowKbisModal] = useState(false);
  const [kbisNumber, setKbisNumber] = useState('');
  const [selectedMode, setSelectedMode] = useState<'particulier' | 'company'>(
    user?.is_company ? 'company' : 'particulier'
  );

  useEffect(() => {
    if (user) {
      setSelectedMode(user.is_company ? 'company' : 'particulier');
    }
  }, [user]);

  const handleConfirm = () => {
    const isCompany = selectedMode === 'company';

    // Si aucun changement, pas besoin d'alerte ni d'appel API
    if (user?.is_company === isCompany) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Confirmer le changement',
      `Vous êtes sur le point de modifier votre statut vers "${isCompany ? 'Entreprise' : 'Particulier'}". Voulez-vous continuer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const updatedUser = { ...user, is_company: isCompany };
              setUser(updatedUser);

              const response = await fetch(`${config.backendUrl}/api/auth/update-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account: updatedUser }),
              });

              if (!response.ok) throw new Error('Erreur serveur');

              Alert.alert('Succès', 'Votre type de profil a été mis à jour.');
              navigation.navigate(isCompany ? 'CompanyTabs' as never : 'ParticulierTabs' as never);
            } catch (error) {
              console.error('Erreur de mise à jour:', error);
              Alert.alert('Erreur', 'Impossible de mettre à jour le profil.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle} />

      <Text style={styles.title}>
        MODIFIER VOTRE{'\n'}
        PROFIL WORKER
      </Text>

      <Text style={styles.subtitle}>
        Choisissez votre statut actuel :
      </Text>

      <View style={styles.buttonsContainer}>
  <View style={styles.buttonWrapper}>
    <TouchableOpacity
      style={[
        styles.buttonIconOnly,
        selectedMode === 'particulier' ? styles.buttonSelected : styles.buttonUnselected,
      ]}
      onPress={() => setSelectedMode('particulier')}
    >
      <Image source={require('../assets/images/people.png')} style={styles.iconFull} />
    </TouchableOpacity>
    <Text
      style={
        selectedMode === 'particulier'
          ? styles.buttonTextSelected
          : styles.buttonTextUnselected
      }
    >
      Particulier
    </Text>
  </View>

  <View style={styles.buttonWrapper}>
    <TouchableOpacity
      style={[
        styles.buttonIconOnly,
        selectedMode === 'company' ? styles.buttonSelected : styles.buttonUnselected,
      ]}
      onPress={() => setShowKbisModal(true)}
    >
      <Image source={require('../assets/images/company.png')} style={styles.iconFull} />
    </TouchableOpacity>
    <Text
      style={
        selectedMode === 'company'
          ? styles.buttonTextSelected
          : styles.buttonTextUnselected
      }
    >
      Company
    </Text>
  </View>
</View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.8}>
        <Text style={styles.confirmButtonText}>Confirmer</Text>
      </TouchableOpacity>


      <Modal visible={showKbisModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      
      {/* Bouton de fermeture en haut à droite */}
      <TouchableOpacity
  onPress={() => setShowKbisModal(false)}
  style={styles.closeButton}
>
  <Icon name="close" size={24} color="#333" />
</TouchableOpacity>

      <Text style={styles.modalTitle}>Numéro de Kbis</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="Entrez votre numéro de Kbis"
        value={kbisNumber}
        onChangeText={setKbisNumber}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          setShowKbisModal(false);
          setSelectedMode('company');
        }}
      >
        <Text style={styles.modalButtonText}>Valider</Text>
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
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8da7bf',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 40,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    flex: 1,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 2,
  },
  buttonSelected: {
    borderColor: '#3B82F6', // BLEU DE SÉLECTION
    borderWidth: 3,
  },

  buttonUnselected: {
    
  },
  buttonTextSelected: {
    
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonTextUnselected: {
    //color: '#2e8b57',
    fontWeight: 'bold',
    fontSize: 18,
  },
  confirmButton: {
    marginTop: 50,
    backgroundColor: '#2e8b57',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },

  buttonWrapper: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  
  buttonIconOnly: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
  },
  
  iconFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  
  closeButtonText: {
    fontSize: 22,
    color: '#333',
  },
  
});

export default ModifyWorkerProfileScreen;

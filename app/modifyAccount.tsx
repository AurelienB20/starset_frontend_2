import { useUser } from '@/context/userContext';
import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const ModifyAccountScreen = () => {
  const [isDescriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [descriptionPopup, setDescriptionPopup] = useState('');
  const navigation = useNavigation();
  const { user,setUser } = useUser(); // Utilisation du contexte pour récupérer les infos utilisateur

  const getAccount = async () => {
    try {
      const accountId = await AsyncStorage.getItem('account_id');
      const response = await fetch(`${config.backendUrl}/api/auth/get-account-by-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
      if (!response.ok) throw new Error('Erreur de réseau');
      const data = await response.json();
      if(data)
      {
        const account = data.account;

        setFirstname(account.firstname || '');
        setLastname(account.lastname || '');
        setAddress(account.address || '');
        setPhone(account.number || '');
        setEmail(account.email || '');
        setDescription(account.description || '');
        setProfilePictureUrl(account.profile_picture_url || '');
        setPseudo(account.pseudo || '');
      }
      else
      {
        setFirstname('');
        setLastname('');
        setAddress('');
        setPhone('');
        setEmail('');
        setDescription('');
        setProfilePictureUrl('');
        setPseudo('');
      }
    } catch (error) {
      console.error('Erreur de récupération du compte:', error);
    }
  };

  let [fontsLoaded] = useFonts({
        
        LexendDeca : LexendDeca_400Regular,
        LeagueSpartanBold : LeagueSpartan_700Bold
      });

  const deleteAccount = async () => {
    Alert.alert(
      'Suppression du compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true); // Lancement du chargement
              const accountId = await AsyncStorage.getItem('account_id');
              const response = await fetch(`${config.backendUrl}/api/auth/delete-account-soft`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account_id: accountId }),
              });
  
              const result = await response.json();
              if (result.success) {
                await AsyncStorage.clear();
                Alert.alert('Compte supprimé', 'Votre compte a bien été supprimé.');
                setUser({})
                navigation.reset({ index: 0, routes: [{ name: 'isVisitor' as never }] });
              } else {
                Alert.alert('Erreur', 'La suppression a échoué.');
              }
            } catch (err) {
              console.error('Erreur suppression compte :', err);
              Alert.alert('Erreur serveur', 'Impossible de supprimer votre compte pour le moment.');
            } finally {
              setIsDeleting(false); // Fin du chargement
            }
          }
        },
      ]
    );
  };
  
  

  useEffect(() => { getAccount(); }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
      <TouchableOpacity style={styles.profilePictureContainer} onPress={() => {navigation.navigate('profilePhotoScreen' as never)}}>
        <Image source={{ uri: profilePictureUrl }} style={styles.profilePicture} />
      </TouchableOpacity>
      
      <InfoRow label="Pseudo" value={user?.pseudo ? `@${user.pseudo}` : 'Ajouter un pseudo'} onPress={() => {navigation.navigate('modifyPseudo' as never)}} />
      <InfoRow label="Nom et prénom" value={`${user?.firstname} ${user?.lastname}`} onPress={() => {navigation.navigate('modifyName' as never)}} />
      <InfoRow label="Téléphone" value={user?.number} onPress={() => {navigation.navigate('modifyPhoneNumber' as never)}} />
      <InfoRow label="E-mail" value={user?.email} onPress={() => {navigation.navigate('modifyEmail' as never)}} />
      <InfoRow label="Adresse" value={user?.address || 'Ajouter une adresse'} onPress={() => {navigation.navigate('modifyLocation' as never)}} />
      <InfoRow label="Description" value={user?.description || 'Ajouter une description'} onPress={() => {navigation.navigate('modifyDescription' as never)}} />
      <InfoRow
        label="Mot de passe"
        value="********"
        onPress={() => { navigation.navigate('modifyPassword' as never); }}
        
      />
      <View style={{ alignSelf: 'flex-start', marginBottom: 10, marginTop : 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color : 'black' }}>Info Worker</Text>
      </View>
      <InfoRow
        label="Type de profil"
        value={user?.is_company ? 'Entreprise' : 'Particulier'}
        onPress={() => { navigation.navigate('modifyWorkerProfile' as never); }}
        icon={user?.is_company
          ? require('../assets/images/company.png')
          : require('../assets/images/people.png')
        }
      />

      <TouchableOpacity
        onPress={deleteAccount}
        style={[styles.deleteButton, isDeleting && { opacity: 0.5 }]}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.deleteButtonText}>Supprimer le compte</Text>
        )}
      </TouchableOpacity>

      <Modal visible={isDescriptionModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setDescriptionModalVisible(false)}>
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.modalInput}
              value={descriptionPopup}
              onChangeText={setDescriptionPopup}
              placeholder="Saisissez votre description"
              multiline
            />
            <TouchableOpacity style={styles.saveModalButton}>
              <Text style={styles.saveModalButtonText}>ENREGISTRER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const InfoRow = ({ label, value, onPress, icon }: { label: string, value: string, onPress: () => void, icon?: any }) => (
  <TouchableOpacity style={styles.infoRow} onPress={onPress}>
    <View style={styles.rowLeft}>
      {icon && <Image source={icon} style={styles.infoIcon} />}
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
    <MaterialIcons name="keyboard-arrow-right" size={24} color="black" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF' },
  profilePictureContainer: { alignItems: 'center', marginBottom: 20 },
  profilePicture: { width: 100, height: 100, borderRadius: 50, borderWidth: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  infoLabel: { fontFamily : 'LeagueSpartanBold' , fontSize: 16, color : 'black' },
  infoValue: { fontSize: 16, color: '#000', fontFamily : 'LexendDeca' },
  addButton: { marginTop: 10, backgroundColor: '#00cc66', padding: 10, borderRadius: 10 },
  addButtonText: { color: '#FFF', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
  modalContent: { width: '90%', backgroundColor: '#FFF', borderRadius: 10, padding: 20, alignItems: 'center' },
  closeIconText: { fontSize: 20, color: '#000' },
  modalInput: { width: '90%', height: 150, fontSize: 18, color: '#000', padding: 10, backgroundColor: '#FFF', borderRadius: 10 },
  saveModalButton: { marginTop: 20, backgroundColor: '#00cc66', padding: 10, borderRadius: 10 },
  saveModalButtonText: { color: '#FFF', fontWeight: 'bold' },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  infoIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    resizeMode: 'contain',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});

export default ModifyAccountScreen;
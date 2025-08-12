import { useCurrentWorkerPrestation } from '@/context/userContext';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Menu, Provider as PaperProvider } from 'react-native-paper';

import Icon from 'react-native-vector-icons/MaterialIcons';
import config from '../config.json';


const convertImagesToBase64 = async (uris: string[]) => {
  const base64Images: string[] = [];
  for (const uri of uris) {
    if (uri.startsWith('data:image')) {
      base64Images.push(uri);
    } else if (uri.startsWith('file://')) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      base64Images.push(base64);
    } else {
      base64Images.push(uri);
    }
  }
  return base64Images;
};

const PrestationsScreen = () => {
  const [customPrestations, setCustomPrestations] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPrestation, setEditingPrestation] = useState<any>(null);
  const [newPrestation, setNewPrestation] = useState({ title: '', price: '', description: '' });
  const { currentWorkerPrestation: prestation } = useCurrentWorkerPrestation();
  const [prestationImages, setPrestationImages] = useState<string[]>([]);
  const [menuVisibleId, setMenuVisibleId] = useState<number | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);




  const getCustomPrestations = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/prestation/get-all-custom-prestation-by-prestation-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestation_id: prestation?.id }),
      });
      const data = await response.json();
      if(data)
      {
        setCustomPrestations(data.custom_prestations);
      }

    } catch (error) {
      console.error('Erreur chargement prestations personnalisées:', error);
    }
  };

  useEffect(() => {
    if (prestation?.id) getCustomPrestations();
  }, [prestation?.id]);

  const handleAddImage = async () => {
    if (prestationImages.length >= 3) {
      Alert.alert('Limite atteinte', 'Vous ne pouvez ajouter que 3 images.');
      return;
    }
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à vos photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPrestationImages((prev) => [...prev, uri]);
    }
  };

  const handleDeleteImage = (index: number) => {
    Alert.alert('Supprimer l\'image', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: () => {
          const updated = [...prestationImages];
          updated.splice(index, 1);
          setPrestationImages(updated);
        },
      },
    ]);
  };

  const createOrUpdateCustomPrestation = async () => {
    try {
      const base64Images = await convertImagesToBase64(prestationImages);
      const endpoint = editingPrestation
        ? `${config.backendUrl}/api/prestation/modify-prestation-custom`
        : `${config.backendUrl}/api/prestation/create-prestation-custom`;
      const payload = editingPrestation
        ? { custom_prestation: { ...newPrestation, id: editingPrestation.id, images: base64Images } }
        : { prestation_id: prestation?.id, ...newPrestation, images: base64Images };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if(data)
      {
        if (editingPrestation) 
        {
          setCustomPrestations((prev: any) =>
            prev.map((item: any) => (item.id === data.custom_prestation.id ? data.custom_prestation : item))
          );
        } 
        else 
        {
          setCustomPrestations((prev: any) => [...prev, data.custom_prestation]);
        }
     }

      setNewPrestation({ title: '', price: '', description: '' });
      setPrestationImages([]);
      setEditingPrestation(null);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    }
  };

  const handleDeleteCustomPrestation = async (id: number) => {
  Alert.alert(
    'Supprimer la prestation',
    'Êtes-vous sûr de vouloir supprimer cette prestation ?',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${config.backendUrl}/api/prestation/delete-prestation-custom`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prestation_custom_id: id }),
            });
            const data = await response.json();
            if (data.success) {
              setCustomPrestations((prev: any[]) => prev.filter((item) => item.id !== id));
            } else {
              Alert.alert('Erreur', 'Impossible de supprimer la prestation.');
            }
          } catch (err) {
            console.error('Erreur suppression prestation custom :', err);
            Alert.alert('Erreur', 'Une erreur est survenue.');
          }
        },
      },
    ]
  );
};

  const openEditModal = (item: any) => {
    setEditingPrestation(item);
    setNewPrestation({ title: item.title, price: String(item.price), description: item.description });
    setPrestationImages(item.images || []);
    setModalVisible(true);
  };

  const renderPrestation = ({ item, index }: any) => {
    const isSelected = selectedCardId === item.id;
  
    return (
      <TouchableOpacity
        style={styles.prestationCard}
        onPress={() => setSelectedCardId(isSelected ? null : item.id)}
        activeOpacity={0.9}
      >
        {/* Menu contextuel */}
        <View style={{ position: 'absolute', top: 10, right: 10 }}>
          <Menu
            visible={menuVisibleId === item.id}
            onDismiss={() => setMenuVisibleId(null)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisibleId(item.id)} style={{ paddingHorizontal: 20 }}>
                <Icon name="more-vert" size={30} color="#333" />
              </TouchableOpacity>
            }
          >

            <Menu.Item
              onPress={() => {
                setMenuVisibleId(null);
                handleDeleteCustomPrestation(item.id);
              }}
              title="Supprimer"
              leadingIcon="delete"
            />
          </Menu>
        </View>
  
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.prestationHeader}>PRESTATION {index + 1}</Text>
          <Text style={styles.prestationTitleCentered}>{item.title}</Text>
  
          {isSelected && (
            <>
              {item.description ? (
                <Text style={{ textAlign: 'center', color: '#666', marginVertical: 10 }}>
                  {item.description}
                </Text>
              ) : null}
  
              {item.images?.length > 0 && (
                <View style={styles.imageRow}>
                  {item.images.slice(0, 3).map((uri: string, i: number) => (
                    <Image key={i} source={{ uri }} style={styles.squareImage} />
                  ))}
                </View>
              )}
            </>
          )}
  
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {parseFloat(item.price).toFixed(2).replace('.', ',')}€
            </Text>
          </View>
           <TouchableOpacity style={styles.addButtonModifier} onPress={() =>  openEditModal(item)}>
          <Text style={styles.addButtonText}>
            {modalVisible ? 'Annuler' : 'MODIFIER'}
          </Text>
        </TouchableOpacity>
        </View>
       
      </TouchableOpacity>
    );
  };
  
  

  return (
    <PaperProvider>
      <ScrollView>

    <View style={styles.container}>
      <FlatList
        data={customPrestations}
        renderItem={renderPrestation}
        keyExtractor={(item: any) => item.id.toString()}
      />

      {modalVisible && (
  <View style={styles.inlineForm}>
    <Text style={styles.prestationHeader}>PRESTATION {customPrestations.length + 1}</Text>

    <Text style={styles.label}>Titre</Text>
    <TextInput
      placeholder="Titre"
      style={styles.input}
      value={newPrestation.title}
      onChangeText={(text) => setNewPrestation({ ...newPrestation, title: text })}
    />

    <Text style={styles.label}>Description</Text>
    <TextInput
      placeholder="Description"
      style={styles.input}
      value={newPrestation.description}
      onChangeText={(text) => setNewPrestation({ ...newPrestation, description: text })}
    />

    <Text style={styles.label}>Ajouter le tarif</Text>
    <TouchableOpacity style={styles.priceButton} onPress={() => setShowPriceModal(true)}>
      <Text style={styles.euroIcon}>€</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.submitButtonGreen} onPress={createOrUpdateCustomPrestation}>
      <Text style={styles.submitButtonText}>ENREGISTRER</Text>
    </TouchableOpacity>
  </View>
)}
      
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(!modalVisible)}>
  <Text style={styles.addButtonText}>
    {modalVisible ? 'Annuler' : 'Ajouter une prestation'}
  </Text>
</TouchableOpacity>



    </View>
    <Modal visible={showPriceModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.label}>Tarif (€)</Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez un tarif"
        keyboardType="numeric"
        value={newPrestation.price}
        onChangeText={(text) => setNewPrestation({ ...newPrestation, price: text })}
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => setShowPriceModal(false)}
      >
        <Text style={styles.submitButtonText}>Valider</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
</ScrollView>

    </PaperProvider>
  );
};

export default PrestationsScreen;

const styles = StyleSheet.create({
  container: {  padding: 20, backgroundColor: '#fff' },
  addButton: { backgroundColor: '#008000', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  addButtonModifier: { backgroundColor: '#008000', paddingVertical: 10, paddingHorizontal: 35, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  
  prestationTitle: { fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '90%' },
  closeIcon: { position: 'absolute', right: 10, top: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  submitButton: { backgroundColor: '#008000', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
  imageWrapper: { position: 'relative' },
  imagePreview: { width: 80, height: 80, borderRadius: 6 },
  imageAddButton: { width: 80, height: 80, borderRadius: 6, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  deleteIcon: { position: 'absolute', top: -6, right: -6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 2 },

  certificationBigImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginBottom: 5,
  },
  
  certificationSmallImagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  certificationSmallImage: {
    width: '48%',
    aspectRatio: 16 / 9,
    
  },

  certificationMiniImage: {
    width: 80,
    height: 60,
    marginRight: 8,
  },

  certificationImagesColumn: {
    flexShrink: 0,
    //width: 120, // Largeur fixe à gauche pour images
    marginRight: 10,
  },

  prestationDetails: {
    flex: 1,
    paddingLeft: 10,
  },

  prestationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },


  prestationCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
  },
  
  prestationHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  
  prestationTitleCentered: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  
  priceContainer: {
    marginTop: 10,
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  
  priceText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
  
  squareImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    resizeMode: 'cover',
  },

  inlineForm: {
  backgroundColor: '#f2f2f2',
  padding: 20,
  borderRadius: 12,
  marginTop: 20,
  marginBottom: 80,
},

label: {
  fontWeight: 'bold',
  marginBottom: 6,
  marginTop: 10,
  color: '#333',
},

priceButton: {
  backgroundColor: '#ffc107',
  paddingVertical: 14,
  alignItems: 'center',
  borderRadius: 6,
  marginBottom: 10,
},

euroIcon: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#000',
},

submitButtonGreen: {
  backgroundColor: '#28a745',
  paddingVertical: 14,
  borderRadius: 6,
  alignItems: 'center',
  marginTop: 20,
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,

},
  
  
});

import { useUser } from '@/context/userContext';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';
import WebView from 'react-native-webview';
import config from '../config.json';

const SkeletonDoc = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 300],
  });

  return (
    <View style={[styles.docButton, styles.skeletonDoc, { backgroundColor: '#DDD', overflow: 'hidden' }]}>
      <Animated.View
        style={[
          {
            height: 20,
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.4)',
            position: 'absolute',
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const DocumentsScreen = () => {
  const { user } = useUser();
  const worker_id = user?.worker;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [identityDocs, setIdentityDocs] = useState<any[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
const [selectedDocIdForMenu, setSelectedDocIdForMenu] = useState<string | null>(null);
  
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [mandatoryWorkerDocs, setMandatoryWorkerDocs] = useState<any[]>([]);
  const [recommendedWorkerDocs, setRecommendedWorkerDocs] = useState<any[]>([]);
  const [allDocTypes, setAllDocTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [documentStatusList, setDocumentStatusList] = useState<any[]>([]);

  const mandatoryDocs = documentStatusList.filter(doc => doc.type === 'mandatory');
const recommendedDocs = documentStatusList.filter(doc => doc.type === 'recommended');

const availableDocTypes = documentStatusList
  .filter(doc => !doc.uploaded)
  .map(doc => doc.name);

const filteredDocs = availableDocTypes.filter(doc =>
  doc.toLowerCase().includes(searchQuery.toLowerCase())
);


  const fetchWorkerDocs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${config.backendUrl}/api/document/get-worker-document-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        setDocumentStatusList(data.documents || []);
      } else {
        setDocumentStatusList([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des documents :', err);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchWorkerDocsAncien = async () => {
    try {
      setIsLoading(true); // démarrer le chargement
      const res = await fetch(`${config.backendUrl}/api/mission/get-worker-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id }),
      });
  
      const data = await res.json();
      if(data)
      {
        setMandatoryWorkerDocs(data.mandatory_documents || []);
        setRecommendedWorkerDocs(data.recommended_documents || []);
        setIdentityDocs(data.identity_documents || []); // ✅ Ajout ici
      }
      else
      {
        setMandatoryWorkerDocs([]);
        setRecommendedWorkerDocs([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des documents :', err);
    } finally {
      setIsLoading(false); // fin du chargement
    }
  };
  

  const fetchAllDocTypes = async () => {
    const allDocRes = await fetch(`${config.backendUrl}/api/mission/get-all-unique-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const allDocData = await allDocRes.json();
    if(allDocData)
    {
      const combined = [
        ...(allDocData.mandatory_documents || []),
        ...(allDocData.recommended_documents || []),
      ];
      setAllDocTypes(combined);
   }
   else
   {
      const combined = [
        ...([]),
        ...([]),
      ];
      setAllDocTypes(combined);
   }
  };

  useEffect(() => {
    if (!worker_id) return;
    fetchAllDocTypes();
    fetchWorkerDocs();
  }, [worker_id]);

  const renderDocument = (doc: any) => {
    return (
      <View
        key={doc.name}
        style={[
          styles.docButton,
          doc.uploaded ? styles.okButton : styles.recommendedMissingButton,
          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1, paddingRight: 10 }}
          onPress={() => {
            if (doc.uploaded && doc.url) {
              setSelectedDocUrl(doc.url);
              setShowDocModal(true);
            }
          }}
        >
          <Text style={styles.docText} numberOfLines={1} ellipsizeMode="tail">
            {doc.name}
          </Text>
        </TouchableOpacity>
  
        {doc.uploaded && (
          <Menu
            visible={menuVisible && selectedDocIdForMenu === doc.name}
            onDismiss={() => {
              setMenuVisible(false);
              setSelectedDocIdForMenu(null);
            }}
            anchor={
              <IconButton
                icon="dots-vertical"
                iconColor="white"
                size={20}
                onPress={() => {
                  setSelectedDocIdForMenu(doc.name);
                  setMenuVisible(true);
                }}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleDeleteDocument(doc.url);
              }}
              title="Supprimer"
              leadingIcon="delete"
            />
          </Menu>
        )}
      </View>
    );
  };
  

  const handleUploadDocument = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie.');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
  
    if (result.canceled) {
      Alert.alert('Erreur', 'Aucun fichier sélectionné');
      return;
    }
  
    const fileUri = result.assets[0].uri;
    setSelectedImage(fileUri); // Image stockée localement
  };

  const handleSaveDocument = async () => {
    if (!selectedImage || !selectedDocType || !worker_id) return;
  
    setUploading(true);
  
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
  
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
  
        const file = {
          filename: `${selectedDocType}.jpg`,
          mimetype: 'image/jpeg',
          data: base64Data,
        };
        const uploadResponse = await fetch(`${config.backendUrl}/api/mission/add-worker-document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file,
            object_id: worker_id,
            type_object: 'document',
            document_name: selectedDocType,
          }),
        });
  
        if (!uploadResponse.ok) throw new Error('Échec du téléchargement');
  
        Alert.alert('Succès', 'Document enregistré avec succès.');
        await fetchWorkerDocs();

        setUploadedDocs((prev) => [...prev, selectedDocType]);
        setModalVisible(false);
        setSelectedImage(null);
        setSelectedDocType('');
        setSearchQuery('');
        setUploading(false);
      };
  
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      
    }
  };

  const handleDeleteDocument = async (documentUrl: string) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer ce document ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${config.backendUrl}/api/mission/delete-worker-document`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document_url: documentUrl }),
              });
  
              const data = await response.json();
              console.log('Suppression document response:', data);
              if (data.success) {
                Alert.alert('Succès', 'Document supprimé.');
                fetchWorkerDocs();
              } else {
                Alert.alert('Erreur', 'La suppression a échoué.');
              }
            } catch (error) {
              console.error('Erreur suppression document :', error);
              Alert.alert('Erreur', 'Impossible de supprimer le document.');
            }
          }
        }
      ]
    );
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>DOCUMENTS OBLIGATOIRES</Text>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonDoc key={`mand-${i}`} />)
        ) : mandatoryDocs.length === 0 ? (
          <Text>Aucun document obligatoire.</Text>
        ) : (
          mandatoryDocs.map(renderDocument)
        )}

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>DOCUMENTS RECOMMANDÉS</Text>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <SkeletonDoc key={`rec-${i}`} />)
        ) : recommendedDocs.length === 0 ? (
          <Text>Aucun document recommandé.</Text>
        ) : (
          recommendedDocs.map(renderDocument)
        )}

      
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>AJOUTER UN DOCUMENT</Text>
      </TouchableOpacity>

      {/* Modal inchangé */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez un type de document :</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un document..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />

            <Picker
              selectedValue={selectedDocType}
              onValueChange={(itemValue) => setSelectedDocType(itemValue)}
            >
              <Picker.Item label="Sélectionnez un document..." style={{ color: '#000' }} value="" />
              {filteredDocs
                .filter(doc => !doc.toLowerCase().includes('au moins'))
                .map(doc => (
                  <Picker.Item key={doc} label={doc} value={doc} />
              ))}
            </Picker>

            <TouchableOpacity
              style={[styles.addButton, { marginTop: 20 }]}
              onPress={handleUploadDocument}
              disabled={uploading || !selectedDocType}
            >
              <Text style={styles.addButtonText}>
                {uploading ? 'Téléchargement...' : 'Sélectionner un fichier'}
              </Text>
            </TouchableOpacity>

            {selectedImage && (
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Aperçu du document :</Text>
                <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200, borderRadius: 10 }} />
              </View>
            )}

            <TouchableOpacity
              style={[styles.addButton, { marginTop: 10, backgroundColor: (!selectedImage || uploading) ? '#ccc' : '#45D188'}]}
              onPress={handleSaveDocument}
              disabled={!selectedImage || uploading}
            >
              <Text style={styles.addButtonText}>
                {uploading ? 'Enregistrement...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: '#ccc', marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
              disabled={uploading}
            >
              <Text style={[styles.addButtonText, { color: '#333' }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showDocModal} animationType="slide">
  <View style={{ flex: 1 }}>
    <View style={{ padding: 10, backgroundColor: '#008080' }}>
      <TouchableOpacity onPress={() => setShowDocModal(false)}>
        <Text style={{ color: 'white', fontSize: 16 }}>Fermer</Text>
      </TouchableOpacity>
    </View>
    {selectedDocUrl ? (
      <WebView source={{ uri: selectedDocUrl }} style={{ flex: 1 }} />
    ) : (
      <Text style={{ padding: 20 }}>Aucun document à afficher.</Text>
    )}
  </View>
</Modal>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  docButton: {
    paddingVertical: 12,
    paddingHorizontal : 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  okButton: {
    backgroundColor: '#45D188',
  },
  missingButton: {
    backgroundColor: '#EF3E3E',
  },
  docText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#A6A6A6',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '85%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color : 'black'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },

  mandatoryMissingButton: {
    backgroundColor: '#2ecc71', // vert clair pour doc obligatoire manquant (ou tu peux changer)
  },
  recommendedMissingButton: {
    backgroundColor: '#EF3E3E', // rouge pour doc recommandé manquant
  },

  skeletonDoc: {
  height: 40,
  borderRadius: 20,
  backgroundColor: '#DDD',
  marginBottom: 10,
},
});

export default DocumentsScreen;

import { useUser } from '@/context/userContext';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

const DocumentsScreen = () => {
  const { user } = useUser();
  const worker_id = user?.worker;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mandatoryDocs, setMandatoryDocs] = useState<string[]>([]);
  const [recommendedDocs, setRecommendedDocs] = useState<string[]>([]);
  const [mandatoryWorkerDocs, setMandatoryWorkerDocs] = useState<any[]>([]);
  const [recommendedWorkerDocs, setRecommendedWorkerDocs] = useState<any[]>([]);
  const [allDocTypes, setAllDocTypes] = useState<string[]>([]);

  const fetchWorkerDocs = async () => {
    try {
      const res = await fetch(`${config.backendUrl}/api/mission/get-worker-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id }),
      });

      const data = await res.json();

      setMandatoryWorkerDocs(data.mandatory_documents || []);
      setRecommendedWorkerDocs(data.recommended_documents || []);
    } catch (err) {
      console.error('Erreur lors du chargement des documents :', err);
    }
  };

  const fetchAllDocTypes = async () => {
    const allDocRes = await fetch(`${config.backendUrl}/api/mission/get-all-unique-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const allDocData = await allDocRes.json();

    const combined = [
      ...(allDocData.mandatory_documents || []),
      ...(allDocData.recommended_documents || []),
    ];
    setAllDocTypes(combined);
  };

  useEffect(() => {
    if (!worker_id) return;
    fetchAllDocTypes();
    fetchWorkerDocs();
  }, [worker_id]);

  const renderDocument = (doc: any, isMandatory: boolean) => {
    return (
      <TouchableOpacity
        key={doc.id}
        style={[
          styles.docButton,
          isMandatory ? styles.okButton : styles.recommendedMissingButton,
        ]}
        activeOpacity={0.7}
      >
        <Text style={styles.docText}>{doc.document_type}</Text>
      </TouchableOpacity>
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
        setUploadedDocs((prev) => [...prev, selectedDocType]);
        setModalVisible(false);
        setSelectedImage(null);
        setSelectedDocType('');
        setSearchQuery('');
      };
  
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setUploading(false);
    }
  };
  

  const filteredDocs = allDocTypes.filter(doc =>
    doc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>DOCUMENTS OBLIGATOIRES</Text>
      {mandatoryWorkerDocs.length === 0 && (
        <Text>Aucun document obligatoire envoyé.</Text>
      )}
      {mandatoryWorkerDocs.map(doc => renderDocument(doc, true))}

      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>DOCUMENTS RECOMMANDÉS</Text>
      {recommendedWorkerDocs.length === 0 && (
        <Text>Aucun document recommandé envoyé.</Text>
      )}
      {recommendedWorkerDocs.map(doc => renderDocument(doc, false))}

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
              <Picker.Item label="Sélectionnez un document..." value="" />
              {filteredDocs.map(doc => (
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
              style={[styles.addButton, { marginTop: 10, backgroundColor: selectedImage ? '#45D188' : '#ccc' }]}
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
});

export default DocumentsScreen;

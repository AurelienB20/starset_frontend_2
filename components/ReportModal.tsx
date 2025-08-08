import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import config from '../config.json';

interface Props {
  visible: boolean;
  onClose: () => void;
  workerId: string;
  firstName: string;
  lastName: string;
  missionTitle: string;
  reporterMail: string;
}

const ReportModal = ({ visible, onClose, workerId, firstName, lastName, missionTitle, reporterMail }: Props) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  //const [selectedItem, setSelectedItem] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    workerId: workerId,
    //images: [],
  });

/*const handleDeleteImage = (index: number) => {
    Alert.alert(
      "Supprimer l'image",
      "Êtes-vous sûr de vouloir supprimer cette image ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updatedImages = [...(form.images || [])];
            updatedImages.splice(index, 1);
          },
        },
      ]
    );
  };

  const onAddImage = async () => {
     const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          base64: true,
          quality: 0.5,
        });
      
        if (!result.canceled && result.assets.length > 0) {
          const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      
          // Mise à jour de selectedItem (images)
          setSelectedItem((prevItem: { images: any; }) => ({
            ...prevItem,
            images: [...(prevItem.images || []), base64Image],
          }));
        }
  }*/

  const toggleCheckbox = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const sendReport = async (form: any, checkedItems: any) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reported_id:form.workerId,
          name:lastName,
          firstname:firstName,
          prestation_title:missionTitle,
          title:form.title,
          type: Object.keys(checkedItems).filter(key => checkedItems[key]),
          description: form.description,
          reporter_mail: reporterMail
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Merci', data.message);
      } else {
        Alert.alert('Erreur', 'Le signalement n’a pas pu être envoyé.');
      }
    } catch (error) {
      console.error('Erreur lors de l’envoi du signalement:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const problemList = [
    { key: 'inappropriate_behavior', label: 'Comportement inapproprié' },
    { key: 'abandoned_mission', label: 'Mission abandonnée ou non réalisée' },
    { key: 'disrespectful_language', label: 'Langage ou propos irrespectueux' },
    { key: 'false_identity', label: 'Fausse identité ou escroquerie' },
    { key: 'other', label: 'Autre' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
        <Text style={styles.title}>Signaler</Text>
          <ScrollView>
            <Text style={styles.description}>
              Vous pouvez signaler un utilisateur ou un prestataire si son comportement ne respecte pas les règles de la
              communauté Star Set (non-respect des engagements, comportement inapproprié, propos offensants, etc.).
              Le signalement est strictement confidentiel : la personne concernée ne saura pas qui l’a signalée.
            </Text>

            <Text style={styles.subTitle}>Sélectionnez le problème à signaler</Text>
            {problemList.map(({ key, label }) => (
              <TouchableOpacity key={key} style={styles.checkboxContainer} onPress={() => toggleCheckbox(key)}>
                <Checkbox status={checkedItems[key] ? 'checked' : 'unchecked'} />
                <Text style={styles.checkboxLabel}>{label}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.subTitle}>Informations sur le signalement</Text>
            <TextInput
              placeholder="Titre"
              placeholderTextColor="#999"
              style={styles.input}
              value={form.title}
              onChangeText={(value) => handleChange('title', value)}
            />

            <TextInput
              placeholder="Description"
              placeholderTextColor="#999"
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              multiline
              value={form.description}
              onChangeText={(value) => handleChange('description', value)}
            />

            {/*  <Text style={styles.label}>Photos (max 5)</Text>
            <View style={styles.imageRow}>
            {(form?.images || []).map((img: string, idx: number) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.image} />
                <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteImage(idx)}>
                  <MaterialIcons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {form?.images?.length < 5 && (
              <TouchableOpacity style={styles.imagePicker} onPress={onAddImage}>
                <FontAwesome name="plus" size={24} color="gray" />
              </TouchableOpacity>
            )}
          </View>
*/}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => sendReport(form, checkedItems)}
            >
              <Text style={styles.submitText}>ENVOYER</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '95%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'LeagueSpartan_700Bold',
  },
  description: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
    fontFamily: 'Lexend_400Regular'
  },
  subTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    marginTop: 20,
    fontFamily: 'Lexend_400Regular'
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 15,
    color: '#000',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#0eb255',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Lexend_400Regular'
  },
  cancelText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'Lexend_400Regular'
  },

  label: {
    fontWeight: '600',
    marginTop: 10,
  },
   imageRow: {
    flexDirection: 'row',
    marginVertical: 10,
    flexWrap: 'wrap',
    gap: 10,
  },
   imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  deleteIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
    zIndex: 1,
  },
    imagePicker: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReportModal;
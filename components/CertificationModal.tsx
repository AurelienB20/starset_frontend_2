import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import React, { useState } from 'react';

import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface CertificationFormModalProps {
  onClose: () => void;
  isEditMode: boolean;
  item: any;
  showCalendar: boolean;
  onChange: (updatedItem: any) => void;
  onAddImage: () => void;
  onSubmit: () => void;
  onToggleCalendar: () => void;
  onDateSelect: (date: string) => void;
}

const CertificationFormModal: React.FC<CertificationFormModalProps> = ({
  onClose,
  isEditMode,
  item,
  showCalendar,
  onChange,
  onAddImage,
  onSubmit,
  onToggleCalendar,
  onDateSelect,
}) => {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocalSubmit = async () => {
    if (isSubmitting) return; // éviter les clics multiples
  
    setIsSubmitting(true);
    try {
      await onSubmit(); // onSubmit est ton handleSubmit externe
    } catch (err) {
      console.error(err); // pour déboguer si besoin
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteImage = (index: number) => {
    Alert.alert(
      "Supprimer l'image",
      "Êtes-vous sûr de vouloir supprimer cette image ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updatedImages = [...(item.images || [])];
            updatedImages.splice(index, 1);
            onChange({ ...item, images: updatedImages });
          },
        },
      ]
    );
  };

  return (
        <View style={styles.container}>
          <Text style={styles.title}>
            {isEditMode ? 'Modifier Certification' : 'Ajouter Certification'}
          </Text>

          <Text style={styles.label}>Titre</Text>
          <TextInput
            style={styles.input}
            placeholder="Titre"
            value={item?.title || ''}
            onChangeText={(text) => onChange({ ...item, title: text })}
          />

          <Text style={styles.label}>Institution</Text>
          <TextInput
            style={styles.input}
            placeholder="Institution"
            value={item?.institution || ''}
            onChangeText={(text) => onChange({ ...item, institution: text })}
          />

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity onPress={onToggleCalendar}>
            <Text style={[styles.input, { color: item?.date ? '#000' : '#999' }]}>
              {item?.date || 'Sélectionnez une date'}
            </Text>
          </TouchableOpacity>

          {showCalendar && (
            <DateTimePicker
              value={
                item?.date && !isNaN(new Date(item.date).getTime())
                  ? new Date(item.date)
                  : new Date()
              }
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  moment(selectedDate).format('DD/MM/YYYY')
                  const dateString = selectedDate.toISOString().split('T')[0].replace(/-/g, '/');
                  onDateSelect(moment(selectedDate).format('DD/MM/YYYY'));
                }
                onToggleCalendar();
              }}
            />
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Description"
            multiline
            value={item?.description || ''}
            onChangeText={(text) => onChange({ ...item, description: text })}
          />

          <Text style={styles.label}>Photos (max 3)</Text>
          <View style={styles.imageRow}>
            {(item?.images || []).map((img: string, idx: number) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.image} />
                <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteImage(idx)}>
                  <MaterialIcons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {item?.images?.length < 3 && (
              <TouchableOpacity style={styles.imagePicker} onPress={onAddImage}>
                <FontAwesome name="plus" size={24} color="gray" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleLocalSubmit}>
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Mettre à jour' : 'Valider'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
  backgroundColor: 'rgba(0, 0, 0, 0.1)', 
    borderRadius: 10,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
    alignSelf : "center",
    marginTop : 60
    
  },
  closeIcon: {
    alignSelf: 'flex-end',
    padding: 10,
    position : "absolute",
    top : 5,
    right : 5

  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color : 'black'
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
    color : 'black'
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    color : 'black'
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    height: 100,
    textAlignVertical: 'top',
    marginTop: 5,
    color : 'black'
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
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
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
  submitButton: {
    backgroundColor: '#00cc66',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    
  },
  calendar: {
    marginTop: 20,
  },
  cancelButton: {
     backgroundColor: '#999',
     borderRadius: 8,
     padding: 12,
     alignItems: 'center',
     marginTop: 10
  },
  cancelButtonText: { 
    color: '#fff',
    fontWeight: 'bold'
  },
});

export default CertificationFormModal;

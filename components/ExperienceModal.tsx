// components/ExperienceModal.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import React from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  isEditMode: boolean;
  item: any;
  showCalendar: boolean;
  onChange: (updatedItem: any) => void;
  onAddImage: () => void;
  onSubmit: () => void;
  onToggleCalendar: () => void;
};

const ExperienceModal = ({
  visible,
  onClose,
  isEditMode,
  item,
  showCalendar,
  onChange,
  onAddImage,
  onSubmit,
  onToggleCalendar,
}: Props) => {

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
          }
        }
      ]
    );
  };

  return (
    <View style={styles.modalContainer}>
      <View style={[styles.modalContent, { width: '90%' }]}>
        <Text style={styles.modalTitle}>
          {isEditMode ? 'Modifier une expérience' : 'Nouvelle expérience'}
        </Text>

        <Text style={styles.inputLabel}>Titre</Text>
        <TextInput
          style={styles.input}
          placeholder="Titre"
          value={item?.title || ''}
          onChangeText={(text) => onChange({ ...item, title: text })}
        />

        <Text style={styles.inputLabel}>Date</Text>
        <TouchableOpacity onPress={onToggleCalendar}>
          <Text style={[styles.input, { color: item?.date ? 'black' : '#999' }]}>
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
                const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
                onChange({ ...item, date: formattedDate });
              }
              onToggleCalendar();
            }}
          />
        )}

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Description"
          multiline
          value={item?.description || ''}
          onChangeText={(text) => onChange({ ...item, description: text })}
        />

       
        {/*<Text style={styles.inputLabel}>Images (max 3)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {(item?.images || []).map((img: string, index: number) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteImage(index)}>
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {(item?.images?.length || 0) < 3 && (
            <TouchableOpacity style={styles.imageAddButton} onPress={onAddImage}>
              <FontAwesome name="plus" size={24} color="gray" />
            </TouchableOpacity>
          )}
        </View>*/}

        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>
            {isEditMode ? 'Modifier' : 'Valider'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExperienceModal;

// Styles
const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 5, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  inputLabel: { fontWeight: 'bold', marginBottom: 5 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  descriptionInput: {
    backgroundColor: '#fff',
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 10
  },
  imageAddButton: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitButton: {
    backgroundColor: '#00cc66',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: {
    backgroundColor: '#999',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10
  },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  imageWrapper: {
    position: 'relative',
    marginRight: 10
  },
  deleteIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
    zIndex: 1
  }
});

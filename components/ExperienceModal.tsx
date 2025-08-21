// components/ExperienceModal.tsx
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
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
import config from '../config.json';

type BaseItem = {
  id?: string;
  title: string;
  date: string;            // 'DD/MM/YYYY'
  description: string;
  images: string[];        // data URL (base64) ou file:// ou http(s)://
};

type CertificationItem = BaseItem & { institution?: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  isEditMode: boolean;
  entityType: 'experience' | 'certification';
  prestationId: string;

  /** état contrôlé par le parent (brouillon) */
  item: BaseItem | CertificationItem;
  showCalendar: boolean;
  onChange: (updatedItem: any) => void;
  onToggleCalendar: () => void;

  /** remonte l’élément créé/mis à jour pour MAJ des listes */
  onUpsertSuccess?: (payload: any) => void;
};

const ExperienceModal = ({
  visible,
  onClose,
  isEditMode,
  entityType,
  prestationId,
  item,
  showCalendar,
  onChange,
  onToggleCalendar,
  onUpsertSuccess,
}: Props) => {
  const isCertification = entityType === 'certification';
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- helpers images ----
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Autorisez l'accès à la galerie pour continuer.");
      return false;
    }
    return true;
  };

  const addImage = async () => {
    if ((item.images?.length || 0) >= 3) {
      Alert.alert('Limite atteinte', 'Vous ne pouvez ajouter que 3 images.');
      return;
    }
    const ok = await requestGalleryPermission();
    if (!ok) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.5,
    });
    if (res.canceled || !res.assets?.length) return;

    const asset = res.assets[0];
    // on garde une data URL directement (évite re-fetch file:// plus tard)
    const dataUrl = asset.base64
      ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
      : asset.uri; // fallback si jamais base64 non fourni

    onChange({ ...item, images: [...(item.images || []), dataUrl] });
  };

  const deleteImage = (index: number) => {
    Alert.alert(
      "Supprimer l'image",
      "Êtes-vous sûr de vouloir supprimer cette image ?",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updated = [...(item.images || [])];
            updated.splice(index, 1);
            onChange({ ...item, images: updated });
          },
        },
      ]
    );
  };

  // ---- normalisation images en base64 (MAJ: ne PAS réencoder les http/https) ----
  const toBase64DataUrls = async (uris: string[]) => {
    const out: string[] = [];
    for (const uri of uris || []) {
      if (uri.startsWith('data:image')) {
        // déjà encodée en base64
        out.push(uri);
      } else if (uri.startsWith('file://')) {
        // Image locale à convertir en base64
        try {
          const resp = await fetch(uri);
          const blob = await resp.blob();
          const reader = new FileReader();
          const base64: string = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          out.push(base64);
        } catch {
          // en cas d'échec, on garde l'uri d'origine
          out.push(uri);
        }
      } else {
        // http(s):// — image déjà hébergée : on NE réencode PAS, on garde l'URL
        out.push(uri);
      }
    }
    return out;
  };

  // ---- validation & submit ----
  const validate = () => {
    if (!item?.title?.trim()) {
      Alert.alert('Champ requis', 'Le titre est obligatoire.');
      return false;
    }
    if (!item?.date?.trim()) {
      Alert.alert('Champ requis', 'La date est obligatoire.');
      return false;
    }
    if (isCertification) {
      const ci = item as CertificationItem;
      if (!ci.institution?.trim()) {
        Alert.alert('Champ requis', "L'institution est obligatoire.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // IMPORTANT : ici on ne réencode plus les http/https
      const images = await toBase64DataUrls(item.images || []);

      if (isCertification) {
  // --- CERTIF ---
  const ci = item as CertificationItem;
  const url = isEditMode
    ? `${config.backendUrl}/api/mission/update-certification`
    : `${config.backendUrl}/api/mission/create-certification`;

  const body = isEditMode
    ? {
        id: ci.id,
        title: ci.title,
        institution: ci.institution,
        date: ci.date,
        description: ci.description,
        images,                 // <= celles qu’on envoie
        prestation_id: prestationId,
      }
    : {
        title: ci.title,
        institution: ci.institution,
        date: ci.date,
        description: ci.description,
        images,
        prestation_id: prestationId,
      };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('network');

  const data = await res.json();

  // 👇 forcer l’aperçu immédiat avec les images locales
  const server = data?.certification ?? null;
  const clientPayload = server
    ? { ...server, images } // override par les images locales
    : { ...ci, images };    // fallback si jamais

  onUpsertSuccess?.(clientPayload);
  Alert.alert('Succès', isEditMode ? 'Certification mise à jour.' : 'Certification ajoutée.');
  onClose();

} else {
  // --- EXPERIENCE ---
  const url = isEditMode
    ? `${config.backendUrl}/api/mission/update-experience`
    : `${config.backendUrl}/api/mission/create-experience`;

  const body = isEditMode
    ? {
        id: item.id,
        title: item.title,
        date: item.date,
        experienceDescription: item.description,
        images,                 // <= celles qu’on envoie
        prestation_id: prestationId,
      }
    : {
        title: item.title,
        date: item.date,
        description: item.description,
        images,
        prestation_id: prestationId,
      };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('network');

  const data = await res.json();

  // 👇 idem : on remonte un payload avec les images locales
  const server = data?.experience ?? null;
  const clientPayload = server
    ? { ...server, images } // override pour l’affichage immédiat
    : { ...item, images };  // fallback

  onUpsertSuccess?.(clientPayload);
  Alert.alert('Succès', isEditMode ? 'Expérience mise à jour.' : 'Expérience ajoutée.');
  onClose();
}
    } catch (e) {
      Alert.alert('Erreur', isCertification ? "Impossible d'enregistrer la certification." : "Impossible d'enregistrer l'expérience.");
      console.log(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={[styles.modalContent, { width: '95%' }]}>
        <Text style={styles.modalTitle}>
          {isEditMode
            ? (isCertification ? 'Modifier Certification' : 'Modifier Expérience')
            : (isCertification ? 'Ajouter Certification' : 'Nouvelle Expérience')}
        </Text>

        <Text style={styles.inputLabel}>Titre</Text>
        <TextInput
          style={styles.input}
          placeholder="Titre"
          value={item?.title || ''}
          onChangeText={(text) => onChange({ ...item, title: text })}
        />

        {isCertification && (
          <>
            <Text style={styles.inputLabel}>Institution</Text>
            <TextInput
              style={styles.input}
              placeholder="Institution"
              value={(item as CertificationItem)?.institution || ''}
              onChangeText={(text) => onChange({ ...item, institution: text })}
            />
          </>
        )}

        <Text style={styles.inputLabel}>Date</Text>
        <TouchableOpacity onPress={onToggleCalendar}>
          <Text style={[styles.input, { color: item?.date ? '#000' : '#999' }]}>
            {item?.date || 'Sélectionnez une date'}
          </Text>
        </TouchableOpacity>

        {showCalendar && (
          <DateTimePicker
            value={
              item?.date && moment(item.date, 'DD/MM/YYYY', true).isValid()
                ? moment(item.date, 'DD/MM/YYYY').toDate()
                : new Date()
            }
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                onChange({ ...item, date: moment(selectedDate).format('DD/MM/YYYY') });
              }
              onToggleCalendar();
            }}
          />
        )}

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Description"
          multiline
          value={item?.description || ''}
          onChangeText={(text) => onChange({ ...item, description: text })}
        />

        <Text style={styles.inputLabel}>Photos (max 3)</Text>
        <View style={styles.imageRow}>
          {(item?.images || []).map((img: string, idx: number) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.image} />
              <TouchableOpacity style={styles.deleteIcon} onPress={() => deleteImage(idx)}>
                <MaterialIcons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {item?.images?.length < 3 && (
            <TouchableOpacity style={styles.imagePicker} onPress={addImage}>
              <FontAwesome name="plus" size={24} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Envoi…' : isEditMode ? 'Mettre à jour' : 'Valider'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSubmitting}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExperienceModal;

// Styles
const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom : 20 },
  modalContent: { backgroundColor: 'rgba(0, 0, 0, 0.1)', borderRadius: 10, padding: 20, maxHeight: '100%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color : 'black' },
  inputLabel: { fontWeight: '600', marginTop: 10, color: 'black' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
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
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: {
    backgroundColor: '#999',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
});

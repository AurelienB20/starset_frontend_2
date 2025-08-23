// components/PrestationDocumentModal.tsx
import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../config.json';

type DocItem = {
  name: string;
  type: 'mandatory' | 'recommended';
  uploaded: boolean;
  url?: string | null;
  file_name?: string | null;
};

interface Props {
  visible: boolean;
  prestationId: number | string;
  workerId: number | string;
  onClose: () => void;
}

const normalizeDoc = (s: string) => s.trim().replace(/\s+/g, '_').toLowerCase();

const PrestationDocumentModal: React.FC<Props> = ({
  visible,
  prestationId,
  workerId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [metier, setMetier] = useState('');
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [mandatorySummary, setMandatorySummary] = useState({ required: 0, uploaded: 0 });

  let [fontsLoaded] = useFonts({
        
    LexendDeca : LexendDeca_400Regular,    
    LeagueSpartanBold : LeagueSpartan_700Bold
  });

  const mandatoryDocs = useMemo(
    () => documents.filter(d => d.type === 'mandatory'),
    [documents]
  );
  const recommendedDocs = useMemo(
    () => documents.filter(d => d.type === 'recommended'),
    [documents]
  );

  const loadStatus = useCallback(async () => {
    if (!prestationId) return;
    setLoading(true);
    try {
      const res = await fetch(`${config.backendUrl}/api/document/get-prestation-document-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestation_id: prestationId }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || 'Erreur de chargement');
      setMetier(data.metier || '');
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
      setMandatorySummary({
        required: data?.summary?.mandatory_required ?? 0,
        uploaded: data?.summary?.mandatory_uploaded ?? 0,
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Impossible de charger les documents de la prestation.");
    } finally {
      setLoading(false);
    }
  }, [prestationId]);

  useEffect(() => {
    if (visible) loadStatus();
  }, [visible, loadStatus]);

  const pickAndUpload = async (doc: DocItem) => {
    if (!workerId) {
      Alert.alert('Erreur', "worker_id manquant.");
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', "Autorisez l'accès à la galerie.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (result.canceled) return;

    const fileUri = result.assets?.[0]?.uri;
    if (!fileUri) return;

    setUploading(true);
    try {
      const resp = await fetch(fileUri);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;
          const file = {
            filename: `${normalizeDoc(doc.name)}.jpg`,
            mimetype: 'image/jpeg',
            data: base64Data,
          };

          const up = await fetch(`${config.backendUrl}/api/mission/add-worker-document`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file,
              object_id: workerId,
              type_object: 'document',
              document_name: doc.name,
            }),
          });
          if (!up.ok) throw new Error('Upload échoué');
          Alert.alert('Succès', 'Document ajouté.');
          await loadStatus();
        } catch (err) {
          console.error(err);
          Alert.alert('Erreur', "Impossible d'ajouter ce document.");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error(err);
      setUploading(false);
      Alert.alert('Erreur', "Lecture du fichier impossible.");
    }
  };

  const deleteDocument = (doc: DocItem) => {
    Alert.alert(
      'Confirmer la suppression',
      `Supprimer "${doc.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const del = await fetch(`${config.backendUrl}/api/mission/delete-worker-document`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document_url: doc.url }),
              });
              const data = await del.json();
              if (!data.success) throw new Error('La suppression a échoué');
              Alert.alert('Succès', 'Document supprimé.');
              await loadStatus();
            } catch (err) {
              console.error(err);
              Alert.alert('Erreur', 'Impossible de supprimer le document.');
            }
          },
        },
      ]
    );
  };

  const renderRow = (doc: DocItem) => (
    <View key={`${doc.type}-${doc.name}`} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.docName}>{doc.name}</Text>
        {doc.uploaded && (
          <Text style={styles.fileName}>
            {doc.file_name || (doc.url ? doc.url.split('/').pop() : 'Document présent')}
          </Text>
        )}
      </View>
      {doc.uploaded ? (
  <TouchableOpacity
    style={[styles.actionBtn, styles.deleteBtn]}
    onPress={() => deleteDocument(doc)}
    disabled={uploading || loading}
  >
    <Text style={styles.actionText}>Supprimer</Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity
    style={[
      styles.actionBtn,
      doc.type === 'mandatory'
        ? { backgroundColor: '#EF3E3E' } // rouge pour obligatoire
        : { backgroundColor: '#2ECC71' } // vert pour recommandé
    ]}
    onPress={() => pickAndUpload(doc)}
    disabled={uploading || loading}
  >
    <Text style={styles.actionText}>Ajouter</Text>
  </TouchableOpacity>
)}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleWrapper}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <Text style={styles.title}>Documents Obligatoires</Text>
          {!!metier && <Text style={styles.subtitle}>{metier}</Text>}
          <Text style={styles.counter}>
            {loading ? 'Chargement…' : `Complétés ${mandatorySummary.uploaded}/${mandatorySummary.required}`}
          </Text>

          {/* Content */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Obligatoires */}
            {mandatoryDocs.length === 0 && !loading ? (
              <Text style={styles.muted}>Aucun document obligatoire.</Text>
            ) : (
              mandatoryDocs.map(renderRow)
            )}

            {/* Recommandés */}
            <Text style={styles.section}>Documents Recommandés</Text>
            {recommendedDocs.length === 0 && !loading ? (
              <Text style={styles.muted}>Aucun document recommandé.</Text>
            ) : (
              recommendedDocs.map(renderRow)
            )}
          </ScrollView>

          {/* Footer fixed */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.validateBtn}
              onPress={onClose}
              disabled={uploading || loading}
            >
              <Text style={styles.validateText}>VALIDER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={uploading}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PrestationDocumentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 0,
    maxHeight: '92%', // laisse un espace en haut
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: -2 } },
      android: { elevation: 16 },
    }),
  },
  handleWrapper: { alignItems: 'center', paddingVertical: 6 },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB' },

  title: { fontSize: 20, fontWeight: '800', textAlign: 'center', color: '#111', marginTop: 4, fontFamily : 'LeagueSpartanBold' },
  subtitle: { textAlign: 'center', color: '#666', marginTop: 2, fontFamily : 'LexendDeca' },
  counter: { textAlign: 'center', color: '#333', marginTop: 8, marginBottom: 10, fontWeight: '600' },

  scroll: { maxHeight: '70%' },

  section: { fontSize: 14, fontWeight: '700', color: '#111', marginTop: 14, marginBottom: 6, fontFamily : 'LeagueSpartanBold' },
  muted: { color: '#6b7280', marginBottom: 8 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  docName: { fontWeight: '700', color: '#000', marginBottom: 2, fontFamily : 'LeagueSpartanBold' },
  fileName: { color: '#6b7280', fontSize: 12 },

  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  addBtn: { backgroundColor: '#007bff' },
  deleteBtn: { backgroundColor: '#EF3E3E' },
  actionText: { color: '#fff', fontWeight: '700' },

  footer: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  validateBtn: { backgroundColor: '#2ECC71', paddingVertical: 14, borderRadius: 12, marginTop: 6 },
  validateText: { color: '#fff', fontWeight: '800', textAlign: 'center', letterSpacing: 1 },
  cancelBtn: { backgroundColor: '#E5E7EB', paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  cancelText: { color: '#111', textAlign: 'center', fontWeight: '600' },
});

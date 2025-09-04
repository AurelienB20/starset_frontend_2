import NifInfoModal from '@/components/InfoNIFModal';
import { useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import config from '../config.json';

const createCompanyProfile = async (form: any) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/company/create-company-solo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form }),
    });

    if (!response.ok) throw new Error('Erreur réseau');
    const result = await response.json();
    console.log(result);
    return;
  } catch (error) {
    console.error('Erreur lors de la creation de l\'entreprise:', error);
    throw error;
  }
};

const checkCompanyExists = async (userId: string | undefined, typeCompany: boolean | undefined) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/company/check-company-exists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, typeCompany }),
    });

    if (!response.ok) throw new Error('Erreur de réseau');
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'entreprise:', error);
    return false;
  }
};

const WorkerForm = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [haveCompany, setHaveCompany] = useState(false);

  useEffect(() => {
    const checkCompany = async () => {
      const exists = await checkCompanyExists(user?.id, false);
      setHaveCompany(exists);
    };
    checkCompany();
  }, [user?.id]);

  const [visible, setVisible] = useState(false);
    type PickedDocument = {
    id: string;
    name: string;
    uri: string;
    size?: number;
    mimeType?: string;
    data?: string;
    [key: string]: any;
  } | null;
  const [form, setForm] = useState<{
    userId: string;
    firstname: string;
    lastname: string;
    birthdate: string;
    adresse: string;
    country: string;
    nif: string;
    recto: any;
    verso: any;
    consent: boolean;
  }>({
    userId: user?.id,
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    birthdate: user?.birthdate || "",
    adresse: user?.adresse || "",
    country: "FR",
    nif: "",
    recto: null as PickedDocument,
    verso: null as PickedDocument,
    consent: false,
  });

  const pickDoc = async (field: string) => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const img = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
      setForm({ ...form, [field]: { ...img, data: base64 } });
    }
  };

  const validate = () => {
    createCompanyProfile(form);
    navigation.navigate({
      name: '(tabs_worker)',
      params: { screen: 'account_worker' },
    } as never);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Formulaire Worker Particuliers</Text>
        <Text>Numéro d’Identification Fiscale (NIF) <Text style={{ color: "red" }}>*</Text>
          <TouchableOpacity onPress={() => setVisible(true)}>
            <Text style={{ color: "blue" }}>?</Text>
          </TouchableOpacity>
        </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.nif}
        onChangeText={(t) => setForm({ ...form, nif: t })}
      />
      <Text>Upload pièce d’identité (Recto) <Text style={{ color: "red" }}>*</Text></Text>
      <Button title="Choisir un fichier" onPress={() => pickDoc("recto")} />
      {form.recto && <Text style={styles.file}>{form.recto.name || form.recto.uri}</Text>}

      <Text>Upload pièce d’identité (Verso) <Text style={{ color: "red" }}>*</Text></Text>
      <Button title="Choisir un fichier" onPress={() => pickDoc("verso")} />
      {form.verso && <Text style={styles.file}>{form.verso.name || form.verso.uri}</Text>}

      <View style={styles.row}>
        <Checkbox
          value={form.consent}
          onValueChange={(value) => setForm({ ...form, consent: value })}
        />
        <Text style={{ flex: 1 }}>
          Je certifie l’exactitude des informations et accepte la transmission DAC7
        </Text>
      </View>

      <Button title="Valider" onPress={validate} color="#0ea5e9" disabled={!form.consent || !form.nif || !form.recto || !form.verso || haveCompany} />

      <NifInfoModal visible={visible} onClose={() => setVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: 'black'
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    color: 'black'
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  file: {
    fontSize: 12,
    color: "gray",
    marginBottom: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export default WorkerForm;

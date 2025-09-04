import NifInfoModal from '@/components/InfoNIFModal';
import { useUser } from '@/context/userContext';
import { useNavigation } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
    const response = await fetch(`${config.backendUrl}/api/company/create-company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form }),
    });

    if (!response.ok) throw new Error('Erreur réseau');

    return await response.json();
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

const WorkerProForm = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser();
    const [haveCompany, setHaveCompany] = useState(false);
  
    useEffect(() => {
      const checkCompany = async () => {
        const exists = await checkCompanyExists(user?.id, false);
        setHaveCompany(exists);
      };
      checkCompany();
    }, [user?.id]);
  type PickedDocument = {
    id: string;
    name: string;
    uri: string;
    size?: number;
    mimeType?: string;
    data?: string;
    [key: string]: any;
  } | null;
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    userId: user?.id,
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    birthdate: user?.birthdate || new Date("1994-10-06"),
    raisonSociale: "",
    formeJuridique: "",
    adresseSiege: "",
    pays: "FR",
    siren: "",
    nif: "",
    tva: "",
    kbis: null as PickedDocument,
    recto: null as PickedDocument,
    verso: null as PickedDocument,
    consent: false,
  });

  // Upload fichier
  const pickDoc = async (field: string) => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const img = result.assets[0];
          const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
          setForm({ ...form, [field]: { ...img, data: base64 } });
        }
  };

  // Validation basique
  const validate = () => {
    if (!form.raisonSociale || !form.formeJuridique || !form.adresseSiege)
      return Alert.alert("Erreur", "Les infos entreprise sont obligatoires");
    if (!form.siren) return Alert.alert("Erreur", "Numéro SIREN/SIRET obligatoire");
    if (!form.nif) return Alert.alert("Erreur", "NIF entreprise obligatoire");
    if (!form.kbis) return Alert.alert("Erreur", "Kbis obligatoire");
    if (!form.consent) return Alert.alert("Erreur", "Certification DAC7 obligatoire");
    createCompanyProfile(form);
    navigation.navigate({
      name: '(tabs_worker)',
      params: { screen: 'account_worker' },
    } as never);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Formulaire Worker Professionnels</Text>

      {/* ENTREPRISE */}
      <Text style={styles.section}>Entreprise</Text>

      <Text>Raison sociale <Text style={{ color: "red" }}>*</Text></Text>
      <TextInput
        style={styles.input}
        value={form.raisonSociale}
        onChangeText={(text) => setForm({ ...form, raisonSociale: text })}
      />

      <Text>Forme juridique <Text style={{ color: "red" }}>*</Text></Text>
      <TextInput
        style={styles.input}
        value={form.formeJuridique}
        onChangeText={(text) => setForm({ ...form, formeJuridique: text })}
      />

      <Text>Adresse siège <Text style={{ color: "red" }}>*</Text></Text>
      <TextInput
        style={styles.input}
        value={form.adresseSiege}
        onChangeText={(text) => setForm({ ...form, adresseSiege: text })}
      />

      <Text>Pays de résidence fiscale <Text style={{ color: "red" }}>*</Text></Text>
      <TextInput
        style={styles.input}
        value={form.pays}
        onChangeText={(text) => setForm({ ...form, pays: text })}
      />

      <Text>N° SIREN/SIRET <Text style={{ color: "red" }}>*</Text></Text>
      <TextInput
        style={styles.input}
        value={form.siren}
        onChangeText={(text) => setForm({ ...form, siren: text })}
      />

      <Text>NIF
        <TouchableOpacity onPress={() => setVisible(true)}>
          <Text style={{ color: "blue" }}>?</Text>
        </TouchableOpacity>
        entreprise <Text style={{ color: "red" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={form.nif}
        onChangeText={(text) => setForm({ ...form, nif: text })}
      />

      <Text>TVA (optionnel)</Text>
      <TextInput
        style={styles.input}
        value={form.tva}
        onChangeText={(text) => setForm({ ...form, tva: text })}
      />

      <Text>Upload extrait Kbis <Text style={{ color: "red" }}>*</Text></Text>
      <Button title="Choisir un fichier" onPress={() => pickDoc("kbis")} />
      {form.kbis && <Text style={styles.file}>{form.kbis.name}</Text>}
      
      <Text>Upload pièce d’identité (Recto) <Text style={{ color: "red" }}>*</Text></Text>
      <Button title="Choisir un fichier" onPress={() => pickDoc("recto")} />
      {form.recto && <Text style={styles.file}>{form.recto.name || form.recto.uri}</Text>}

      <Text>Upload pièce d’identité (Verso) <Text style={{ color: "red" }}>*</Text></Text>
      <Button title="Choisir un fichier" onPress={() => pickDoc("verso")} />
      {form.verso && <Text style={styles.file}>{form.verso.name || form.verso.uri}</Text>}

      {/* CONSENT */}
      <View style={styles.row}>
        <Checkbox value={form.consent} onValueChange={(value) => setForm({ ...form, consent: value })} />
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
    padding: 15
   },
  title: { 
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: 'black'
   },
  section: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
    color: "#0ea5e9"
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
    marginVertical: 10
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
    marginBottom: 10
  },
});

export default WorkerProForm;
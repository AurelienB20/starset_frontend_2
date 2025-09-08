import NifInfoModal from '@/components/InfoNIFModal';
import { useUser } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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
  View,
} from 'react-native';
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
    birthdate: user?.birthdate || new Date("1994-10-06").toISOString().split("T")[0],
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
    Alert.alert('Succès', 'Votre type de profil a été mis à jour.');
    navigation.navigate({
      name: '(tabs_worker)',
      params: { screen: 'account_worker' },
    } as never);
  };

  const handleSkip = () => {
    navigation.navigate({
      name: '(tabs)',
      params: { screen: 'account' },
    } as never);
  };

  return (
    <ScrollView style={styles.container}>
    
      <Text style={styles.subtitle}>
        Quelques <Text style={styles.link}>documents</Text> sont indispensables pour{" "}
        <Text style={styles.link}>finaliser</Text> votre compte et{" "}
        <Text style={styles.bold}>commencer vos activités</Text>
      </Text>

        <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.country}
          onValueChange={(itemValue) => setForm({ ...form, country: itemValue })}
        >
          <Picker.Item label="-- Sélectionnez un pays de résidence fiscale --" value=""  style={{ color: "#999" }} />
          <Picker.Item label="🇫🇷 France" value="FR" style={{ color: "#999" }} />
          <Picker.Item label="🇧🇪 Belgique" value="BE" style={{ color: "#999" }} />
          <Picker.Item label="🇨🇭 Suisse" value="CH" style={{ color: "#999" }} />
          <Picker.Item label="🇨🇦 Canada" value="CA" style={{ color: "#999" }} />
          <Picker.Item label="🇺🇸 États-Unis" value="US" style={{ color: "#999" }} />
          <Picker.Item label="🇩🇪 Allemagne" value="DE" style={{ color: "#999" }} />
        </Picker>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.nif}
        placeholder="Numéro d’identification fiscale (NIF)"
        placeholderTextColor="#999"
        onChangeText={(t) => setForm({ ...form, nif: t })}
      />
       <TouchableOpacity onPress={() => setVisible(true)}>
            <Ionicons name="information-circle-outline" size={22} color="#333" style={{ marginLeft: 10, marginBottom: 5  }} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => pickDoc("recto")}>
        <Text  style={ styles.button}>Upload pièce d’identité (Recto)</Text>
      </TouchableOpacity>
      {form.recto && <Text style={styles.file}>{form.recto.name || form.recto.uri}</Text>}

      <TouchableOpacity onPress={() => pickDoc("verso")}>
        <Text  style={styles.button}>Upload pièce d’identité (Verso)</Text>
      </TouchableOpacity>
      {form.verso && <Text style={styles.file}>{form.verso.name || form.verso.uri}</Text>}

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={form.consent}
          onValueChange={(value) => setForm({ ...form, consent: value })}
        />
        <Text style={styles.checkboxLabel}>
          Je certifie l’authenticité des documents transmis ainsi que leur transmission
          dans le cadre de la DAC7.
        </Text>
      </View>

      <Button title="Valider" onPress={validate} color="#00C851" disabled={!form.consent || !form.nif || !form.recto || !form.verso || haveCompany} />

      <TouchableOpacity onPress={handleSkip}>
        <Text style={styles.skip}>Passer cette étape {">>"}</Text>
      </TouchableOpacity>

      <NifInfoModal visible={visible} onClose={() => setVisible(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    bold: {
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    fontFamily : 'LexendDeca'
  },
  link: {
    textDecorationLine: "underline",
  },
  container: {
    flex: 1,
    padding: 15,
    marginTop: '20%',
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: 'black',
    fontFamily : 'LexendDeca'
  },
   pickerWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  pickerInput: {
    fontSize: 16,
    color: "#000",
  },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    color: 'black',
    fontFamily : 'LexendDeca'
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
  button: {
  borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#7ed957',
    color: 'white',
  },
    checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 15,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#333",
  },
   skip: {
    color: "#000",
    textAlign: "center",
    marginTop: 20,
    textDecorationLine: "underline",
    marginBottom: 20,
  },
});

export default WorkerForm;

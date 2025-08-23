import { useUser } from '@/context/userContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../config.json';

const ModifyLocationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute() as any;
  const { user, setUser } = useUser();

  const [query, setQuery] = useState(user?.address || '');
  const [coordinates, setCoordinates] = useState<any>(null);
  const [suggestions, setSuggestions] = useState([]);

  const searchAddress = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text
      )}&key=${config.googleApiKey}&language=fr&components=country:fr`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'OK') {
        setSuggestions(json.predictions);
      } else {
        console.warn('Erreur API Google Places:', json.status);
      }
    } catch (err) {
      console.error('Erreur fetch autocomplete:', err);
    }
  };

  const getCoordinatesFromPlaceId = async (placeId: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${config.googleApiKey}&language=fr`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'OK') {
        const location = json.result.geometry.location;
        setCoordinates(location);
        console.log('Coordonnées récupérées :', location);
      } else {
        console.warn('Erreur API Place Details:', json.status);
      }
    } catch (err) {
      console.error('Erreur fetch détails:', err);
    }
  };

  const handleSelect = async (item: any) => {
    setQuery(item.description);
    setSuggestions([]);
    await getCoordinatesFromPlaceId(item.place_id);
  };

  const updateLocation = async () => {
    try {
      const updatedUser = { ...user, address: query, location: coordinates };
      setUser(updatedUser);

      const response = await fetch(`${config.backendUrl}/api/auth/update-location-and-adress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user?.id, address : query, location : coordinates }),
      });

      
      const data = await response.json();
      if (!data.success) throw new Error('Erreur de réseau');
      console.log('Mise à jour réussie:', data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compte:', error);
    }
  };

  const getLocation = async () => {
    await updateLocation();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier votre adresse</Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={searchAddress}
        placeholder="Entrez votre adresse..."
      />

      <FlatList
        data={suggestions}
        keyExtractor={(item : any) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)} style={styles.item}>
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.confirmButton} onPress={getLocation}>
        <Text style={styles.buttonText}>Confirmer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: 'white',
    color: 'black',
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#00743C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default ModifyLocationScreen;

import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFonts } from 'expo-font';
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

const LocationPickerScreen = () => {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<any>(null);
  const [suggestions, setSuggestions] = useState([]);

  const route = useRoute() as any;
  const { email, password, preferredFields } = route.params || {};
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({        
    LexendDeca : LexendDeca_400Regular,
    LeagueSpartanBold : LeagueSpartan_700Bold
  });

  const searchAddress = async (text: string) => {
    setAddress(text);
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
        console.log('📍 Coordonnées récupérées :', location);
      } else {
        console.warn('Erreur API Place Details:', json.status);
      }
    } catch (err) {
      console.error('Erreur fetch détails:', err);
    }
  };

  const handleSelect = async (item: any) => {
    setAddress(item.description);
    setSuggestions([]);
    await getCoordinatesFromPlaceId(item.place_id);
  };

  const getLocation = () => {
    console.log(coordinates);
    navigation.navigate({
      name: 'accountInfo',
      params: {
        email,
        password,
        preferredFields,
        address,
        coordinates,
      },
    } as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrer votre adresse postale (optionnel)</Text>
      <Text style={styles.subTitle}>
        si vous n'ajoutez pas votre adresse vous ne pourrez commander que les
        services en distanciel
      </Text>

      <TextInput
        style={styles.input}
        value={address}
        onChangeText={searchAddress}
        placeholder="Entrez votre adresse..."
        placeholderTextColor="#808080"
      />

      <FlatList
        data={suggestions}
        keyExtractor={(item : any) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            style={styles.item}
          >
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
    fontFamily: 'LeagueSpartanBold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  subTitle: {
    fontSize: 14,
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
    backgroundColor: '#5fc85fff',
    
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

export default LocationPickerScreen;

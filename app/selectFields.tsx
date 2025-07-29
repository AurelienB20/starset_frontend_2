import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../config.json';


const InterestsScreen = () => {
    const [interests, setInterests] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set()); // Stocke les items sélectionnés
    const [loading, setLoading] = useState<boolean>(true);
    const route = useRoute() as any;
    const { email, password} = route.params || {};
    
    const navigation = useNavigation();

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/get-unique-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: "", test2: "" }),
      });
      const data = await response.json();

      console.log("data.fields", data.fields);
      if (data.success) {
        const cleanedFields : any = Array.from(
          new Set(
            data.fields
              .map((field: string) => field.trim().toLowerCase()) // si tu veux ignorer la casse
              .filter((field: string) => field.length > 0)
          )
        );
        
        setInterests(cleanedFields);
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer les centres d’intérêts');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sélectionner/désélectionner un item
  const toggleSelection = (interest: string) => {
    setSelectedInterests((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(interest)) {
        newSelected.delete(interest); // Si déjà sélectionné, on le retire
      } else {
        newSelected.add(interest); // Sinon, on l'ajoute
      }
      return newSelected;
    });
  };

  // Fonction pour récupérer tous les items sélectionnés
  const getSelectedInterests = () => {
    let preferredFields =  Array.from(selectedInterests).join(', '); // Convertit en chaîne séparée par des 
    

    navigation.navigate({
        name: 'getLocation',
        params: {email : email, password : password, preferredFields : preferredFields},
      } as never);
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VOS CENTRES D’INTÉRÊTS</Text>
      <Text style={styles.subtitle}>Quels sont vos besoins ? Dites-nous tout 🤩</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <ScrollView contentContainerStyle={styles.interestContainer}>
          {interests.map((interest, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.interestButton,
                selectedInterests.has(interest) && styles.selectedInterestButton, // Applique le style vert si sélectionné
              ]}
              onPress={() => toggleSelection(interest)}
            >
              <Text style={[
                  styles.interestText,
                  selectedInterests.has(interest) && styles.selectedInterestText, // Applique le style vert si sélectionné
                ]}>{interest}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => getSelectedInterests()}
      >
        <Text style={styles.buttonText}>Confirmer</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Star Set</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    color: 'black',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: 'gray',
    marginVertical: 10,
  },
  interestContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
    paddingBottom: 20,
  },
  interestButton: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
  },
  selectedInterestButton: {
    backgroundColor: 'green', // Change en vert quand l’item est sélectionné
    borderColor: 'darkgreen',
    
  },
  interestText: {
    fontSize: 12,
    color: 'black',
  },

  selectedInterestText: {
    fontSize: 12,
    color: 'white',
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#70FF70',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  footer: {
    marginVertical: 30,
    fontSize: 16,
    
    color: 'black',
  },
});

export default InterestsScreen;

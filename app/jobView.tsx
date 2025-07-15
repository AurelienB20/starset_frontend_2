import { useAllWorkerPrestation } from '@/context/userContext';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import config from '../config.json';

const JobViewScreen = () => {
  const [metier, setMetier] = useState<any>(null);
  const { allWorkerPrestation,setAllWorkerPrestation } = useAllWorkerPrestation()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation()
  const route = useRoute() as any;
  
  const {selectedJob} = route.params || ''; 
  // Fonction pour récupérer le métier "Professeur particulier à domicile"


  const handleValidation = async () => {
    if (isSubmitting) return;
  
    try {
      setIsSubmitting(true); // 🔐 Empêche plusieurs clics
  
      const selectedJob = metier.name;
      const account_id = await getAccountId();
      const response = await fetch(`${config.backendUrl}/api/mission/create-prestation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_id, selectedJob }),
      });
  
      const data = await response.json();
      console.log(data);

      if (data?.newPrestation) {
        // ⬇️ Ajout de la nouvelle prestation dans le contexte global
        setAllWorkerPrestation((prev: any[]) => [...prev, data.newPrestation]);
      }
  
      navigation.navigate({
        name: '(tabs_worker)',
        params: { screen: 'Jobs' },
      } as never);
    } catch (error) {
      console.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false); // ✅ Réactive le bouton après
    }
  };

  let [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,    
  });

  const getAccountId = async () => {
    try {
      const accountId = await AsyncStorage.getItem('account_id');
      if (accountId !== null) {
        return accountId;
      }
    } catch (e) {
      console.error('Erreur lors de la récupération du type de compte', e);
    }
  };

  const getMetierByName = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-metier-by-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedJob),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if(data)
      {
        setMetier(data.metier); // Stocker le métier dans l'état
      }
      
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération du métier:', error);
    }
  };

  // Vérifie si le métier est déjà ajouté
  const isJobAlreadyAdded = allWorkerPrestation?.some(
    (item: any) => item.metier === metier?.name
  );


  // Charger les données au montage du composant
  useEffect(() => {
    getMetierByName();
  }, []);

  if (!metier) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Exemple de missions (tu peux adapter selon les données réelles)
  const missions = metier.mission
    ? metier.mission.split('/').map((m: string) => m.trim()).filter(Boolean)
    : [];

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri : metier.picture_url}} // Remplacer avec l'image appropriée
        style={styles.jobImage}
      />

      {/* Titre du métier */}
      <Text style={styles.jobTitle}>{metier.name.toUpperCase()}</Text>

      {/* Description du métier */}
      <Text style={styles.jobDescription}>{metier.description}</Text>

      {/* Missions */}
      <Text style={styles.sectionTitle}>MISSIONS</Text>
      {missions.map((mission : any, index : any) => (
        <Text key={index} style={styles.missionItem}>
          • {mission}
        </Text>
      ))}

      {/* Documents obligatoires / recommandés */}
      <Text style={styles.sectionTitle}>DOCUMENTS OBLIGATOIRES/RECOMMANDÉS</Text>
      {metier.mandatory_documents ? (
        <Text style={styles.documentText}>Documents obligatoires : {metier.mandatory_documents}</Text>
      ) : (
        <Text style={styles.documentText}>Aucun document obligatoire requis.</Text>
      )}

      {metier.recommended_documents ? (
        <Text style={styles.documentText}>Documents recommandés : {metier.recommended_documents}</Text>
      ) : (
        <Text style={styles.documentText}>Aucun document recommandé.</Text>
      )}

      {/* Bouton Ajouter */}
      <TouchableOpacity
        style={[
          styles.addButton,
          (isJobAlreadyAdded || isSubmitting) && styles.disabledButton,
        ]}
        onPress={!isJobAlreadyAdded && !isSubmitting ? handleValidation : undefined}
        disabled={isJobAlreadyAdded || isSubmitting}
      >
        <Text style={styles.addButtonText}>
          {isJobAlreadyAdded
            ? 'Déjà ajouté'
            : isSubmitting
            ? 'Ajout...'
            : '+ Ajouter'}
        </Text>
      </TouchableOpacity>

      {isJobAlreadyAdded && (
        <Text style={styles.infoText}>
          Vous avez déjà ajouté ce métier.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom : 40
  },
  jobImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: 24,
    fontFamily : 'BebasNeue',
    textAlign: 'center',
    marginBottom: 10,
  },
  jobDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily : 'BebasNeue',
    marginBottom: 10,
  },

  missionItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  
  documentText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#00cc66',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom : 40
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: '#999', // Plus foncé
  },

  infoText: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default JobViewScreen;

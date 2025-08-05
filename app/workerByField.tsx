import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../config.json';

const WorkersByFieldScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { field } = route.params as any;
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  let [fontsLoaded] = useFonts({
      LeagueSpartanBold : LeagueSpartan_700Bold
    });
  const fetchWorkersByField = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/filter-workers-by-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ field : field.name }),

      });
      const data = await response.json();
      if(data)
      {
        console.log(field);
        console.log(data);
        console.log(123);
        console.log(123);
        setWorkers(data.workers);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des travailleurs :', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkersByField();
  }, []);

  const goToPrestationViewWithId = (id : any) => {
    console.log(123)
    navigation.navigate({
      name: 'prestationView',
      params: { id },
    } as never);
  };

  const renderWorker = ({ item }: any) => (
    <TouchableOpacity
      style={styles.profileContainer}
      onPress={() => goToPrestationViewWithId(item.metiers[0]?.id)}
    >
      <Image source={{ uri: item.profile_picture_url }} style={styles.profileImage} />
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item.firstname}</Text>
        <Text style={styles.profilePseudo}>{item.pseudo}</Text>
        <Text style={styles.profileDescription}>{item.description}</Text>
        <View style={styles.profileCategories}>
          {Array.from(new Map(item.metiers.map((m: { name: any; })=> [m.name, m])).values())
  .slice(0, 3)
  .map((metier: any, index: number) => (
    <View key={index} style={styles.categoryBadge}>
      <Text style={styles.badgeText}>{metier.name}</Text>
    </View>
))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{field.name.toUpperCase()}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorker}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

export default WorkersByFieldScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    elevation: 3,
  },

  backButton: {
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontFamily : 'LeagueSpartanBold'
    
    
  },

  profileContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 10,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  profilePseudo: {
    fontSize: 14,
    color: '#888',
  },

  profileDescription: {
    fontSize: 12,
    marginVertical: 5,
  },

  profileCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  categoryBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
    marginTop: 5,
  },

  badgeText: {
    fontSize: 10,
  },
});

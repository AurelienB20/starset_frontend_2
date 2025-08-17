import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import config from '../../config.json';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CategorySkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryImageSkeleton}>
        <Animated.View
          style={[
            styles.shimmerOverlay,
            { transform: [{ translateX }] }
          ]}
        />
      </View>
    </View>
  );
};

const AddJobScreen = () => {
  const navigation = useNavigation();
  const [metierNames, setMetierNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  let [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
  });

  useEffect(() => {
    getAllMetierNames();
    fetchFields();
  }, []);

  const getAllMetierNames = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-all-metier-names`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data) setMetierNames(data.metierNames || []);
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des métiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-all-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log(data.fields)
      if (data) setFields(data.fields || []);
    } catch (error) {
      console.error('Erreur récupération catégories :', error);
    }
  };

  const gotoJobView = (selectedJob: any) => {
    navigation.navigate({
      name: 'jobView',
      params: { selectedJob },
    } as never);
  };

  const goToMetierList = (field: string) => {
    navigation.navigate({
      name: 'metierList',
      params: { field },
    } as never);
  };

  const filteredMetiers = metierNames.filter((metier: any) =>
    metier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ADD A JOB</Text>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un métier..."
        placeholderTextColor="#999"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Display either metiers or categories */}
      {searchTerm.trim() !== '' ? (
        <>
          {loading ? (
            <ActivityIndicator size="large" color="#333" />
          ) : (
            filteredMetiers.map((metier: any, index: number) => (
              <TouchableOpacity key={index} style={styles.jobCardFiltered} onPress={() => gotoJobView(metier)}>
                <Image
                  source={{
                    uri: metier.picture_url || 'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
                  }}
                  style={styles.jobImageFiltered}
                />
                <Text style={styles.jobTitleFiltered}>
  {(metier.name ?? '').toUpperCase()}
</Text>

              </TouchableOpacity>
            ))
          )}
        </>
      ) : (
        <>
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => {
  if (index % 2 === 0) {
    return (
      <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <CategorySkeleton />
        
      </View>
    );
  }
  return null;
})
          ) : (
            
            <FlatList
              data={fields}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => goToMetierList(item)}
                >
                  <Image source={{ uri: item.picture_url }} style={styles.categoryImage} />
                  <View style={styles.overlay}>
                    <Text style={styles.categoryText}>{item.name.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item: any) => item.name}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
            />
          )}
        </>
      )}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom : 40
  },
  title: {
    fontWeight: 'bold',
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 20,
    color : 'black'
  },
  

  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },

  jobImage: {
    width: 50,
    height: 50,
    marginRight: 20,
    borderRadius: 25,
    backgroundColor: '#DDD',
  },

  jobTitle: {
    fontSize: 24,
    fontFamily : 'BebasNeue',
    flexShrink: 1,
  },

  skeletonTextWrapper: {
    flex: 1,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#DDD',
    overflow: 'hidden',
  },

  skeletonText: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DDD',
  },
  
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  categoryImageSkeleton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  
  categoryCard: {
    height: 130,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    width: (SCREEN_WIDTH - 60) / 2, // 👈 Ajuste largeur pour 2 colonnes (avec padding/margin)
  },

  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  // Pour les métiers filtrés
  jobCardFiltered: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    paddingRight: 80,
  },
  jobImageFiltered: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  jobTitleFiltered: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'BebasNeue',
    flexWrap: 'wrap',
    color : 'black'
  },
});

export default AddJobScreen;

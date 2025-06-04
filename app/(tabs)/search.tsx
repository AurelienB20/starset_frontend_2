import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { JosefinSans_100Thin, JosefinSans_700Bold } from '@expo-google-fonts/josefin-sans';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../../config.json';
//import axios from '../api/axios';
import * as Font from 'expo-font';

const profilePictures = [
  "https://www.utopix.com/fr/blog/wp-content/uploads/2024/04/Mzk0NGJkOWEtY2ZlYS00MjVjLTkwNTAtOGY5OWQzN2IzNGVi_762cec57-2eaf-4eaf-9a0d-2e7860147e48_profilhomme7-scaled.jpg",
  "https://st4.depositphotos.com/10313122/39913/i/450/depositphotos_399138226-stock-photo-portrait-young-handsome-persian-businessman.jpg",
  "https://www.utopix.com/fr/blog/wp-content/uploads/2024/04/d34203d9-3bea-4d9e-9e83-e445d3e754de_instagram3-scaled.jpg",
  "https://c.superprof.com/i/a/14131262/7200420/600/20230925185954/coach-sportif-nutrition-seances-personnalisees-adaptees-objectifs-capacites-service-personne.jpg",
  "https://www.missnumerique.com/blog/wp-content/uploads/une-bonne-photo-de-profil-cest-quoi-jurica-koletic.jpg",
  "https://c.superprof.com/i/a/22899983/10725281/600/20220930153117/seance-sport-personnalisee-adaptee-profil-coach-sportive-diplomee.jpg",
  "https://www.pagesjaunes.fr/media/agc/d8/de/74/00/00/f9/7f/0c/cd/a2/624ed8de740000f97f0ccda2/624ed8de740000f97f0ccda3.jpg",
  "https://www.utopix.com/fr/blog/wp-content/uploads/2024/04/Y2E4OTI3NzQtNmUyOC00YmU2LWE5ZjctODcxY2RlMzg2ZDIy_26dfc43e-31dd-463f-ad04-56f39a430691_profilhomme1-scaled.jpg"
];

const SearchScreen = () => {
  const [loadingMore, setLoadingMore] = useState(false);
  const navigation = useNavigation()
  const [prestations, setPrestations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [mostLikedImages, setMostLikedImages] = useState([]);
  let [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    LexendDeca : LexendDeca_400Regular,
    JosefinRegular : JosefinSans_700Bold,
    JosefinBold : JosefinSans_100Thin,
  });

  const handleEndReached = () => {
    setLoadingMore(true);
    setTimeout(() => setLoadingMore(false), 1500); // Simulation d'attente
  };

  const goToProfile = async () => {
    navigation.navigate('profile' as never)
  }

  const goToPrestationView = (prestation : any) => {
    const id = prestation.id
    console.log(123)
    navigation.navigate({
      name: 'prestationView',
      params: { id },
    } as never);
  };

  const goToSearchInHomeScreen = (metierName: string) => {
    
    //navigation.navigate({
    //  name: 'index',
    //  params: { searchQuery : metierName },
    //} as never);

    navigation.navigate({
      name: '(tabs)',
      params: { screen: 'Account_Worker', searchQuery : metierName},
    } as never);
  };

  const goToPrestationViewWithId = (id : any) => {
    
    console.log(123)
    navigation.navigate({
      name: 'prestationView',
      params: { id },
    } as never);
  };

  const fetchPrestations = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-all-prestation-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await response.json() 
      console.log(1)
      console.log(data)
      console.log(data.prestations)
      setPrestations(data.prestations);
    } catch (error) {
      console.error('Erreur lors de la récupération des prestations :', error);
    }
  };

  const fetchMetiers = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-job-of-the-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Échec lors de la récupération des métiers');
      const data = await response.json();
      setMetiers(data.metiers || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des métiers :", error);
    }
  };
  

  const fetchMostLikedImages = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/uploads/most-liked-images`);
      const data = await response.json();
      if (data.success) {
        setMostLikedImages(data.most_liked_images);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des images populaires :", error);
    }
  };

  const getWorkers = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-workers-with-metiers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const data = await response.json() 
      console.log(1)
      console.log(data)
      setWorkers(data.workers)
      
    } catch (error) {
      console.error('Erreur lors de la récupération des prestations :', error);
    }
  };

  const renderProfileItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.profileContainerList}
      onPress={() => goToPrestationViewWithId(item.metiers[0]?.id)}
    >
      {item.profile_picture_url ? (
      <Image source={{ uri: item.profile_picture_url }} style={styles.profileImage} />
    ) : (
      <Image source={{ uri: "https://static.vecteezy.com/ti/vecteur-libre/p1/7033146-icone-de-profil-login-head-icon-vectoriel.jpg"}} style={styles.profileImage} />
    )}
      <View style={styles.profileInfo}>
        <View style={styles.nameAndRating}>
          
          <View>
            <Text style={styles.profileName}>{item.firstname}</Text>
            <Text style={styles.pseudo}>@{item.pseudo}</Text>
          </View>
          <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Ionicons key={index} name="star" size={16} color="gold" />
          ))}
        </View>
      </View>
      <View style={styles.profileDescriptionContainer}>
        <Text style={styles.profileDescription}>
          {item.description}
        </Text>
      </View>
        
        <View style={styles.profileCategories}>
          {item.metiers.slice(0, 3).map((metier: any, index: any) => (
            <View key={index} style={styles.categoryBadge}>
              <Text style={styles.categoryText2}>{metier.name}</Text>
            </View>
          ))}
          <View  style={styles.categoryBadge}>
              <Text style={styles.categoryText2}>+</Text>
            </View>
        </View>
        
      </View>
    </TouchableOpacity>
  );
  
  const renderMetierItem = ({ item }: any) => (
    <TouchableOpacity style={styles.metierContainer} onPress={() => goToSearchInHomeScreen(item.name)}>
      <Image
        source={{ uri: item.picture_url || 'https://cdn-icons-png.flaticon.com/512/91/91501.png' }}
        style={styles.metierImage}
      />
      <Text style={styles.metierText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item } : any) => (
    <View style={styles.userContainer}>
      <Image source={{ uri: item.image }} style={styles.userImage} />
      <View style={styles.usernameContainer}>
        <Text style={styles.username}>{item.username}</Text>
      </View>
    </View>
  );

  const renderLikedItem = ({ item } : any) => (
    <TouchableOpacity onPress={() => goToPrestationViewWithId(item.id)}>
      <View style={styles.userContainer}>
        <Image source={{ uri: item.image_url }} style={styles.userImage} />
        <View style={styles.usernameContainer}>
          <Text style={styles.username}>@{item.pseudo || 'Utilisateur'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Utiliser useEffect pour charger les prestations lors du montage du composant
  useEffect(() => {
    fetchMetiers();
    fetchPrestations();
    fetchMostLikedImages();
    getWorkers();
    async function loadFonts() {
      await Font.loadAsync({
        'Glacial-Regular': require('../../assets/fonts/GlacialIndifference-Regular.otf'),
        'Glacial-Bold': require('../../assets/fonts/GlacialIndifference-Bold.otf'),
      });
     
    }
    loadFonts();
  }, []);

  /*if (!fontsLoaded) {
    return (
      <View >
        
      </View>
    );
  }*/
  
  return (
    <FlatList
      data={workers}
      renderItem={renderProfileItem}
      keyExtractor={(item : any) => item.worker_id.toString()}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 10 }} // <-- AJOUTE CECI
      ListHeaderComponent={
        <View style={styles.container}>
          <Text style={styles.headerText}>Star Set</Text>
          <TouchableOpacity style={styles.bellIconContainer} onPress={() => console.log('Notifications')}>
            <Ionicons name="notifications-outline" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fakeSearchBar}>
            <Ionicons name="location-sharp" size={16} color="#999" style={{ marginRight: 8 }} />
            <Text style={styles.fakeSearchText}>Top Worker</Text>
          </TouchableOpacity>
          <FlatList
            data={prestations}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.profileContainerFlatList}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => goToPrestationView(item)}>
                <View style={styles.workerContainer}>
                  <Image source={{ uri: profilePictures[index % profilePictures?.length] }} style={styles.profilePicture} />
                  <Image source={require('../../assets/images/valide_or.png')} style={styles.statusIndicator} />
                </View>
              </TouchableOpacity>
            )}
          />
          <FlatList
            data={metiers}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={renderMetierItem}
            contentContainerStyle={styles.metierList}
          />
          
          <FlatList
            data={mostLikedImages}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={renderLikedItem}
            contentContainerStyle={styles.userList}
          />
          <Text style={styles.sectionHeader}>Ce qui pourrait vous plaire</Text>
        </View>
      }
      ListFooterComponent={loadingMore ? <ActivityIndicator size="large" color="#00cc66" style={styles.loader} /> : null}
    />
  );
};

const styles = StyleSheet.create({

  
  container: {
    //flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop : 30
  },

  scrollContainer: {
    //flex: 1,
    
    width : '100%'
  },

  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    marginTop: 30, 
    paddingHorizontal : 20,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    marginHorizontal : 20,
    paddingHorizontal : 20
  },
  step: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginHorizontal : 20,
    fontFamily: 'BebasNeue-Regular', // Utilisation de la police
  },

  profileContainer: {
    //flexGrow: 1, // Assure que le ScrollView peut s'étendre
    alignItems: 'flex-start', // Centre les éléments pour éviter les espaces
    justifyContent : 'flex-start',
    //width : '100%',
    gap : '5%',
    marginBottom: 20,
    paddingLeft : 130,
    borderTopColor: 'black',
    //borderTopWidth: 1, // Ajoute une bordure noire en haut
    borderBottomColor: 'black',
    //borderBottomWidth: 1, // Ajoute une bordure noire en 
    paddingVertical : 10,
    
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginHorizontal : 10
  },
  infoContainer: {
    width: '90%',
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 16,
    fontFamily: 'BebasNeue-Regular', // Utilisation de la police
  },
  descriptionText: {
    fontSize: 16,
    color: '#000',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#00cc66',
    padding: 10,
    marginBottom : 10,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },

  workerContainer : {
    flexDirection : 'column',
    gap : 4,
    fontWeight : 'bold',
  },

  profileContainerList: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal : 10,
    flex :1
  },
  
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginRight: 10,
    
  },
  profileInfo: {
    //backgroundColor : 'red',
    flexDirection : 'column',
    flex : 1,
    justifyContent : 'space-between'
  },
  profileName: {
    fontSize: 19,
    
    fontFamily: 'Glacial-Bold', // Utilisation du nom défini dans useFonts
  },

  profileUsername: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'BebasNeue',
  },

  profileDescription: {
    fontSize: 14,
    marginVertical: 5,
    textAlign : 'center',
    fontFamily: 'BebasNeue',
  },

  profileDescriptionContainer: {
    marginVertical : 5
  },

  profileCategories: {
    flexDirection: 'row',
    flexWrap: 'nowrap',     // Important : on empêche le retour à la ligne
    overflow: 'hidden',     // Cache les badges qui débordent
    maxWidth: '100%',       // Empêche de dépasser le parent
  },

  categoryBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
    marginBottom: 5,
  },

  categoryText2: {
    fontSize: 8,
    color: '#333',
    fontFamily : 'JosefinRegular',
  },

  ratingContainer: {
    flexDirection: 'row',
    marginTop: 5,
    
  },

  nameAndRating: {
    justifyContent : 'space-between',
    
    flexDirection : 'row',
    //backgroundColor : 'green'
  },

  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    width: 25,
    height: 25,
  },

  profileContainerFlatList: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Aligner les items à gauche
    justifyContent: 'flex-start',
    paddingHorizontal: 10, // Un petit padding pour éviter le collage complet à gauche
    marginBottom: 20,
    paddingVertical: 10,
  },

  pseudo: {
    color: '#888',
    fontSize: 12,
    fontFamily : 'LexendDeca'
  },

  loader: {
    marginVertical: 20,
  },

  metierList: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom : 20
  },

  metierContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'gold',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 15,
  },
  
  metierImage: {
    width: 30,
    height: 30,
    marginHorizontal: 10,
  },

  metierText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginRight : 10,
    fontFamily : 'BebasNeue'
  },

  userList: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    
    marginHorizontal: 20, // <-- C'est ça qui fait que la ligne ne va pas jusqu'au bout
    borderRadius: 10, // (optionnel) rend les coins légèrement arrondis
    backgroundColor: '#fff', // (optionnel) si tu veux garder un fond blanc
  },

  userContainer: {
    position: 'relative',
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  userImage: {
    width: 250,
    height: 150,
    borderRadius: 10,
  },
  usernameContainer: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 150, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },

  searchContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '90%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  
  searchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  
  searchInput: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    marginTop: 5,
    color: '#000',
  },

  fakeSearchBar: {
    flexDirection: 'row',
    width : '95%',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    marginHorizontal: 40,
  },
  
  fakeSearchText: {
    fontSize: 14,
    color: '#999',
  },

  bellIconContainer: {
    position: 'absolute',
    top: 40, // Ajuste en fonction de ton padding top ou safe area
    right: 20,
    zIndex: 10,
  },
  
});

export default SearchScreen;

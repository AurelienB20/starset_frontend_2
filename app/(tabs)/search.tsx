import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { JosefinSans_100Thin, JosefinSans_700Bold } from '@expo-google-fonts/josefin-sans';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../../config.json';
//import axios from '../api/axios';
import * as Font from 'expo-font';



const SearchScreen = () => {
  const [loadingMore, setLoadingMore] = useState(false);
  const navigation = useNavigation()
  const [prestations, setPrestations] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [mostLikedImages, setMostLikedImages] = useState([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
const [isModalVisible, setIsModalVisible] = useState(false);
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
    const id = prestation.metiers[0].id
    navigation.navigate({
      name: 'prestationView',
      params: { id },
    } as never);
  };

   const goToNearbyWorkersMap = () => {
    navigation.navigate('nearby' as never);
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
      
      if(data) setPrestations(data.prestations);
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
      if(data)
      {
        setMetiers(data.metiers || []);
      }
      else
      {
        setMetiers([]);
      }
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
      if(data)
      {
        console.log(1);
        console.log(data);
        setWorkers(data.workers);
      }      
    } catch (error) {
      console.error('Erreur lors de la récupération des prestations :', error);
    }
  };

  const renderProfileItem = ({ item }: any) => {
    const fullStars = Math.floor(item.average_rating); // Nombre d’étoiles pleines
    const emptyStars = 5 - fullStars; // Étoiles vides restantes
    const showStars = item.average_rating !== null && item.average_rating !== undefined && item.average_rating > 0;
  
    return (
      <TouchableOpacity
        style={styles.profileContainerList}
        onPress={() => goToPrestationViewWithId(item.metiers[0]?.id)}
      >
        <View>
        {item.profile_picture_url ? (
          <Image source={{ uri: item.profile_picture_url }} style={styles.profileImage} />
        ) : (
          <Image
            source={{
              uri: "https://static.vecteezy.com/ti/vecteur-libre/p1/7033146-icone-de-profil-login-head-icon-vectoriel.jpg",
            }}
            style={styles.profileImage}
          />
        )}
        <Image source={require('../../assets/images/valide_or.png')} style={styles.statusIndicator} />
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameAndRating}>
            <View>
              <Text style={styles.profileName}>{item.firstname}</Text>
              <Text style={styles.pseudo}>@{item.pseudo}</Text>
            </View>
  
            {showStars && (
              <View style={styles.ratingContainer}>
                {[...Array(fullStars)].map((_, index) => (
                  <Ionicons key={`full-${index}`} name="star" size={16} color="gold" />
                ))}
                {[...Array(emptyStars)].map((_, index) => (
                  <Ionicons key={`empty-${index}`} name="star-outline" size={16} color="gray" />
                ))}
              </View>
            )}
          </View>
  
          <View style={styles.profileDescriptionContainer}>
            <Text style={styles.profileDescription}>{item.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderMetierItem = ({ item }: any) => (
  <TouchableOpacity
    style={styles.metierContainer}
    onPress={() => {
      setSelectedJob(item);
      setIsModalVisible(true);
    }}
  >
    <Image
      source={{ uri: item.picture_url || 'https://cdn-icons-png.flaticon.com/512/91/91501.png'}}
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
        <Image source={{ uri: item.image_url }} style={styles.userImage}/>
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
          <Image style ={styles.tinyLogo}source={require('../../assets/images/starset-icon.png')}/>
          <TouchableOpacity style={styles.bellIconContainer} onPress={() => console.log('Notifications')}>
            <Ionicons name="notifications-outline" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fakeSearchBar} onPress={goToNearbyWorkersMap}>
            <Ionicons name="location-sharp" size={16} color="#999" style={{ marginRight: 8 }} />
            <Text style={styles.fakeSearchText}>Autour de vous</Text>
          </TouchableOpacity>
          <Text style={styles.sectionHeader}>Top Worker</Text>
          <FlatList
            data={workers}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.profileContainerFlatList}
            renderItem={({ item , index } : { item: any; index: number }) => (
              <TouchableOpacity onPress={() => goToPrestationView(item )}>
                <View style={styles.workerContainer}>
                   {item.profile_picture_url ? (
      <Image source={{ uri: item.profile_picture_url }} style={styles.profilePicture} />
    ) : (
      <Image source={{ uri: "https://static.vecteezy.com/ti/vecteur-libre/p1/7033146-icone-de-profil-login-head-icon-vectoriel.jpg"}} style={styles.profilePicture} />
    )}
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
          <Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {/* Titre du métier */}
      <Text style={styles.jobTitle}>{selectedJob?.name?.toUpperCase()}</Text>

      {/* Description */}
      <Text style={styles.jobDescription}>{selectedJob?.description}</Text>

      

      {/* Bouton de fermeture */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(false)}
      >
        <Text style={styles.addButtonText}>Fermer</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

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

  tinyLogo: {
    marginTop:20,
    width: 250,
    height: 100
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    alignSelf: 'flex-start',
    marginTop: 10,
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

  modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},

modalContent: {
  backgroundColor: '#FFFFFF',
  padding: 20,
  borderRadius: 10,
  width: '90%',
},

jobTitle: {
  fontSize: 24,
  fontFamily: 'BebasNeue',
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
  fontFamily: 'BebasNeue',
  marginBottom: 10,
},

missionItem: {
  fontSize: 16,
  color: '#555',
  marginBottom: 5,
},

addButton: {
  backgroundColor: '#00cc66',
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 20,
},

addButtonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},

markerContainer: {
  alignItems: 'center',
},

nameTag: {
  backgroundColor: 'white',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 6,
  marginTop: 4,
},
nameText: {
  fontSize: 12,
  color: '#333',
},

  
});

export default SearchScreen;

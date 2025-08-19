import { LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import config from '../../config.json';
/*
const profiles = [
  {
    id: '1',
    name: 'Louise MARTIN',
    username: '@louisemartin87',
    description: '"J\'aime aider et je serais ravie de vous partager mon expérience"',
    rating: 5,
    categories: ['Babysitting', 'Pet Sitting', 'Cours'],
    image: 'https://fr.web.img6.acsta.net/c_310_420/pictures/20/01/15/12/35/3532251.jpg',
  },
  {
    id: '2',
    name: 'Antoine GARDIN',
    username: '@antogardin_75',
    description: '"J\'aime travailler et aider ceux qui m\'entourent"',
    rating: 4,
    categories: ['Babysitting', 'Parenting', 'Cours'],
    image: 'https://www.influenceur.promo/wp-content/uploads/2024/03/maghla-788x788.jpg',
  },
  {
    id: '3',
    name: 'Céline Claire-Marie',
    username: '@celineclairemarie09',
    description: '"Babysitting, animaux, assistance quotidienne, je suis là pour vous servir !"',
    rating: 5,
    categories: ['Babysitting', 'Pet Sitting', 'Parenting'],
    image: 'https://assets.afcdn.com/album/D20211115/phalbm26023325_w320.webp',
  },
  {
    id: '4',
    name: 'Lisa Karino',
    username: '@lisakarin07',
    description: '"Bienvenue sur mon compte Starset !"',
    rating: 4,
    categories: ['Babysitting', 'Cours'],
    image: 'https://photos.tf1.fr/1280/720/enjoyphoenix-2-49caba-0@3x.webp',
  },
];
*/
const HomeScreen = () => {
  const [search, setSearch] = useState('');
  const [showProfiles, setShowProfiles] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState([]); // Nouvel état pour stocker les catégories
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation()
  const route = useRoute() as any;

  let [fontsLoaded] = useFonts({
      
      LexendDeca : LexendDeca_400Regular,
      
      LeagueSpartanRegular : LeagueSpartan_400Regular,
      LeagueSpartanBold : LeagueSpartan_700Bold
    });
  
  const suggestions = [
    'Babysitter de nuit',
  ];
  const [recentSearches, setRecentSearches] = useState([]); // Historique de recherche

  // Met à jour la recherche sans déclencher l'affichage
  const handleInputChange = (text: any) => {
    setSearch(text);
    setShowSuggestions(true); // Affiche les suggestions dès qu'on clique sur la barre de recherche
  };

  // Sauvegarder une nouvelle recherche
  const saveRecentSearch = async (query: any) => {
    try {
      let updatedSearches: any = [...recentSearches];
      if (!updatedSearches.includes(query)) {
        updatedSearches.unshift(query); // Ajouter en haut de la liste
        if (updatedSearches.length > 5) updatedSearches.pop(); // Limiter à 5 recherches
        await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        console.log(updatedSearches)
        setRecentSearches(updatedSearches);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la recherche:', error);
    }
  };

  // Affiche les profils lorsque l'utilisateur appuie sur la loupe
  const handleSearchSubmit = async () => {
    setShowSuggestions(false);
    await saveRecentSearch(search);
    searchWorkers()
    setShowProfiles(true);
  };

  // Réinitialise la recherche et l'affichage
  const clearSearch = () => {
    setSearch('');
    setShowProfiles(false);
  };

  // Charger l'historique des recherches
  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recherches récentes:', error);
    }
  };

  const searchWorkers = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/search-workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({searchString : search}),
      });
      const data = await response.json(); 
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

  const searchWorkersByField = async (field : any) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.backendUrl}/api/mission/filter-workers-by-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field }),
      });
      const data = await response.json();
      if(data)
      {
        setWorkers(data.workers);
        setShowProfiles(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des travailleurs :', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSuggestion = ({ item } : any) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        setSearch(item);
        setShowSuggestions(false);
        setShowProfiles(true);
      }}
    >
      <Ionicons name="search" size={20} color="black" style={styles.suggestionIcon} />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  const goToPrestationViewWithId = (id : any) => {
    
    console.log(123)
    navigation.navigate({
      name: 'prestationView',
      params: { id },
    } as never);
  };

  const goToWorkerByField = (field : any) => {
    console.log(123)
    navigation.navigate({
      name: 'workerByField',
      params: { field },
    } as never);
  };


  const renderProfileItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.profileContainerList}
      onPress={() => goToPrestationViewWithId(item.metiers[0]?.id)}
    >
      <Image source={{ uri: item.profile_picture_url }} style={styles.profileImage} />
      <View style={styles.profileInfo}>
        <View style={styles.nameAndRating}>
          <View>
            <Text style={styles.profileName}>{item.firstname}</Text>
            <Text style={styles.pseudo}>{item.pseudo}</Text>
          </View>
          <View style={styles.ratingContainer}>
          {[...Array(0)].map((_, index) => (
            <Ionicons key={index} name="star" size={16} color="gold" />
          ))}
        </View>
      </View>
        <Text style={styles.profileDescription}>
          {item.description}
        </Text>
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

  const renderProfileSuggestion = ({ item } : any) => (
    <View style={styles.profileSuggestionContainer}>
      <Image source={{ uri: item.image }} style={styles.profileSuggestionImage} />
      <View style={styles.profileSuggestionInfo}>
        <Text style={styles.profileSuggestionName}>{item.name}</Text>
        <Text style={styles.profileSuggestionUsername}>{item.username}</Text>
        <View style={styles.profileSuggestionCategories}>
          {item.categories.map((category : any, index : any) => (
            <View key={index} style={styles.profileSuggestionBadge}>
              <Text style={styles.profileSuggestionBadgeText}>{category}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
 
  const CategoryItem = ({ item } : any) => {
    const [isPressed, setIsPressed] = useState(false);
  
    return (
      <TouchableOpacity
        style={[
          styles.categoryContainer,
         
        ]}
        onPress={() => goToWorkerByField(item)}
        onPressIn={() => setIsPressed(true)} // Activer le zoom
        onPressOut={() => setIsPressed(false)} // Désactiver le zoom
      >
      <Image source={{ uri: item.picture_url }} style={[styles.categoryImage,  isPressed && styles.pressedStyle]}  />
        <View style={styles.overlay}>
          <Text style={styles.categoryText}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Fonction pour rendre les items dans FlatList ou autre
  const renderCategoryItem = ({ item } : any) => {
    return <CategoryItem item={item} />;
  };

  const CategorySkeleton = () => (
    <View style={[styles.categoryContainer, styles.skeleton]}>
      <View style={styles.skeletonOverlay} />
    </View>
  );

  useEffect(() => {
    fetchCategories();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    fetchCategories();
    loadRecentSearches();
  
    if (route.params?.searchQuery) {
      const query = route.params.searchQuery;
      setSearch(query);
      setShowProfiles(true);
      setShowSuggestions(false);
      saveRecentSearch(query);
      setTimeout(() => {
        searchWorkersByField(query);
      }, 100); // léger délai pour laisser React rendre le composant
    }
  }, [route.params?.searchQuery]);
  

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-all-field`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
      });
      const data = await response.json();
      if(data)
      {
        console.log(data);
        setFetchedCategories(data.fields); // Mise à jour des catégories avec les données récupérées
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
    behavior={Platform.OS === "ios" ? "padding" : "height"} 
    style={{ flex: 1 }}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={handleInputChange}
          placeholder="Babysitter autour de moi"
          placeholderTextColor="#808080"
          onFocus={() => setShowSuggestions(true)} // Affiche les suggestions au clic
          onBlur={() => setShowSuggestions(false)} // Cache les suggestions lorsqu'on quitte la barre de recherche
        />
        {search.length > 0 ? (
          <TouchableOpacity style={styles.clearIcon} onPress={clearSearch}>
            <Ionicons name="close-circle" size={24} color="black" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.searchIcon} onPress={handleSearchSubmit}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Suggestions de recherche */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          
          <ScrollView style={styles.suggestionsScroll}>
          {recentSearches.length > 0 && (
            <>
            <Text style={styles.sectionTitle}>Recherches récentes</Text>
              <FlatList
                data={recentSearches}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderSuggestion}
              />
              </>
            )}
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) => index.toString()}
            />

            <FlatList
              data={null}
              renderItem={renderProfileSuggestion}
              keyExtractor={(item) => item.id}
              style={styles.profileSuggestionList}
            />
          </ScrollView>
        </View>
      )}

      {/* Affichage conditionnel : profils ou catégories */}
      {showProfiles ? (
        <FlatList
          data={workers}
          renderItem={renderProfileItem}
          keyExtractor={(item : any) => item.id}
          nestedScrollEnabled={true} // Permet le scrolling imbriqué
        />
      ): loading ? (
        <>
          <Text style={styles.sectionTitle}>En ce moment</Text>
          <FlatList
            data={Array.from({ length: 8 })}
            renderItem={({ index }) => <CategorySkeleton key={index} />}
            keyExtractor={(_, index) => index.toString()}
            numColumns={1}
            showsVerticalScrollIndicator={false} //
            
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>En ce moment</Text>
          <FlatList
            data={fetchedCategories} 
            renderItem={renderCategoryItem}
            keyExtractor={(item : any) => item.name}
            numColumns={1}
            showsVerticalScrollIndicator={false} //
          />
        </>
      )}
    </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop : 30
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    fontFamily : 'LexendDeca'
  },
  searchIcon: {
    marginLeft: 10,
  },
  clearIcon: {
    position: 'absolute',
    right: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily : 'LeagueSpartanBold',
    marginBottom: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical : 10,
    
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    
    
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal : 10

  },
  categoryText: {
    fontSize: 22,
    color: '#ffffff',
    fontFamily : 'LeagueSpartanBold',
    marginBottom: 10,
    textAlign : 'center'
  },
  profileContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginRight: 10,
  },
  profileInfo: {
    
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileUsername: {
    color: '#888',
    fontSize: 14,
  },
  profileDescription: {
    fontSize: 12,
    marginVertical: 5,
    textAlign : 'center',
    fontFamily: 'BebasNeue',
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
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },

  nameAndRating: {
    justifyContent : 'space-between',
    width : '100%',
    flexDirection : 'row',
  },

  profileContainerList: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal : 10,
    width : '70%'
  },

  categoryText2: {
    fontSize: 7,
    color: '#333',
  },

  pressedStyle: {
    transform: [{ scale: 1.1 }], // Appliquer un léger zoom
  },

  suggestionsContainer: {
    position : 'absolute',
    top: 100, // Positionne le conteneur en dessous de la barre de recherche
    left: 0,
    right: 0,
    zIndex: 1000, // Assure que les suggestions apparaissent au-dessus du contenu
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 10,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 16,
    color: 'black',
  },
  

  profileSuggestionList: {
    marginTop: 10,
  },
  profileSuggestionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileSuggestionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  profileSuggestionInfo: {
    flex: 1,
  },
  profileSuggestionName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileSuggestionUsername: {
    fontSize: 14,
    color: '#808080',
  },
  profileSuggestionCategories: {
    flexDirection: 'row',
    marginTop: 5,
  },
  profileSuggestionBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
  },
  profileSuggestionBadgeText: {
    fontSize: 12,
    color: '#333',
  },

  suggestionsScroll: {
    maxHeight: 250, // Limite la hauteur pour éviter que ça couvre tout l'écran
  },

  pseudo: {
    color: '#888',
    fontSize: 14,
    
  },

  skeleton: {
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  
  skeletonOverlay: {
    flex: 1,
    backgroundColor: '#ccc',
    opacity: 0.3,
  },

});

export default HomeScreen;



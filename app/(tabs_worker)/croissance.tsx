import { useAllWorkerPlannedPrestation, useUser } from '@/context/userContext';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import config from '../../config.json';

const CroissanceScreen = () => {
  const [jobsOfTheDay, setJobsOfTheDay] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const { user } = useUser(); // Utilisation du contexte pour récupérer les infos utilisateur
  const [otherJobs, setOtherJobs] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
const [loadingWorkers, setLoadingWorkers] = useState(false);
const navigation = useNavigation()
const { allWorkerPlannedPrestation } = useAllWorkerPlannedPrestation();
const insets = useSafeAreaInsets();

let [fontsLoaded] = useFonts({       
  LexendDeca : LexendDeca_400Regular,
  BebasNeue: BebasNeue_400Regular,
  LeagueSpartanBold : LeagueSpartan_700Bold
});

const completedCount = allWorkerPlannedPrestation?.filter(
  (p: any) => p.status === 'finished' || p.status === 'completed'
).length || 0;


  const news = {
    title: 'Big Announcement',
    date: 'September 22, 2024',
    description:
      'We are excited to introduce new features to our platform that will make your job search easier and more efficient!',
  };
  const simpleArticle = `
[TITLE] Bienvenue sur STARSET [/TITLE]

[SUBTITLE] Retour sur la Soirée de Lancement de STARSET [/SUBTITLE]

[DATE] 21/08/2025 [/DATE]

[TEXT]
Le 11 juillet dernier, STARSET a officiellement pris son envol lors d’une soirée de lancement exceptionnelle au prestigieux Relais Spa de Marne-la-Vallée. 
Un moment fort, à la hauteur de l’ambition de notre application : devenir la plateforme de référence en jobbing, connectant particuliers et professionnels 
pour des missions du quotidien comme du babysitting...
[/TEXT]

[ROWIMAGES]
https://api.starsetfrance.com/media/news/starset_news_1_image_1.png
https://api.starsetfrance.com/media/news/starset_news_1_image_2.png
[/ROWIMAGES]
`;




  useEffect(() => {
  fetchJobsOfTheDay();
  fetchJobsThatNeedHelp();
  fetchWorkers();
}, []);

const goToPrestationViewWithId = (id : any) => {
    
  console.log(123)
  navigation.navigate({
    name: 'prestationView',
    params: { id },
  } as never);
};

const parseSimpleArticle = (raw: string) => {
  const getBetween = (tag: string) => {
    const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'm');
    const match = raw.match(regex);
    return match ? match[1].trim() : "";
  };

  const getRowImages = () => {
    const regex = /\[ROWIMAGES\]([\s\S]*?)\[\/ROWIMAGES\]/m;
    const match = raw.match(regex);
    if (match) {
      return match[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((l) => l.length > 0);
    }
    return [];
  };

  return {
    title: getBetween("TITLE"),
    subtitle: getBetween("SUBTITLE"),
    date: getBetween("DATE"),
    text: getBetween("TEXT"),
    images: getRowImages(),
  };
};

const fetchWorkers = async () => {
  try {
    setLoadingWorkers(true);
    const res = await fetch(`${config.backendUrl}/api/mission/get-workers-with-metiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (data?.workers) setWorkers(data.workers);
  } catch (e) {
    console.error('Erreur lors de la récupération des workers :', e);
  } finally {
    setLoadingWorkers(false);
  }
};


const fetchJobsOfTheDay = async () => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/get-job-of-the-day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch jobs of the day');
    const data = await response.json();
    
    const jobOfTheDay = data.metiers.slice(0, 4);
    setJobsOfTheDay(jobOfTheDay);
  } catch (error) {
    console.error('Erreur lors de la récupération des jobs of the day:', error);
  }
};

const fetchJobsThatNeedHelp = async () => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/get-job-of-the-day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch other jobs');
    const data = await response.json();

    
    const jobsNeedingHelp  = data.metiers.slice(0, 4);

    setOtherJobs(jobsNeedingHelp.slice(0, 4));
  } catch (error) {
    console.error('Erreur lors de la récupération des jobs qui ont besoin de vous:', error);
  } finally {
    setLoading(false);
  }
};

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setIsModalVisible(true);
  };

  const goToNews = () => {
    
    navigation.navigate('news' as never)
  };

  const article = parseSimpleArticle(simpleArticle);

  return (
    <ScrollView contentContainerStyle={[
      styles.container,
      { paddingBottom: insets.bottom + 20 }, // 👈 ajoute marge dynamique
    ]}
    showsVerticalScrollIndicator={false}>
      <View style={styles.croissanceContainer}>
        <Image style ={styles.tinyLogo}source={require('../../assets/images/Croissance.png')}/>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/864/864685.png',
            }}
            style={styles.icon}
          />
          <Text style={styles.statText}>TOP JOB</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statText}>Missions accomplies</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2%</Text>
          <Text style={styles.statText}>Activité</Text>
        </View>
      </View>

      <Text style={[styles.sectionHeader, { marginTop: 40 }]}>WORKERS OF THE DAY</Text>
      {loadingWorkers ? (
        <View style={{ paddingVertical: 12 }}>
          <Text style={{ textAlign: 'center' }}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={workers}
          keyExtractor={(item, index) => (item.worker_id?.toString?.() ?? String(index))}
          renderItem={({ item }) => {
            // récupère la photo
            const photo =
              item.profile_picture_url ||
              'https://static.vecteezy.com/ti/vecteur-libre/p1/7033146-icone-de-profil-login-head-icon-vectoriel.jpg';

            // récupère un id de prestation/métier si dispo (comme SearchScreen)
            const firstMetierId = item?.metiers?.[0]?.id;

            return (
              <TouchableOpacity
                style={styles.workerWrapper}
                onPress={() => {
                  if (firstMetierId) {
                    // ouvre la page prestation si dispo
                    // (enlève si tu ne veux pas de navigation ici)
                    // @ts-ignore
                    goToPrestationViewWithId(firstMetierId);
                  }
                }}
              >
                <Image source={{ uri: photo }} style={styles.workerImage} />
                <View style={styles.badge}>
                  <FontAwesome name="check" size={12} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        />
      )}

      <Text style={[styles.sectionHeader, { marginTop: 30 }]}>JOBS OF THE DAY</Text>
      <FlatList
        horizontal
        data={jobsOfTheDay}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleJobClick(item)}>
            <View style={styles.jobItem}>
              <Image
                source={{
                  uri: item.picture_url || 'https://cdn-icons-png.flaticon.com/512/91/91501.png',
                }}
                style={styles.jobIcon}
              />
            </View>
          </TouchableOpacity>
        )}
        
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      />

      <Text style={[styles.sectionHeader, { marginTop: 30 }]}>CES JOBS QUI ONT BESOIN DE VOUS</Text>
      <FlatList
        horizontal
        data={otherJobs}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleJobClick(item)}>
            <View style={styles.jobItem}>
              <Image
                source={{
                  uri: item.picture_url || 'https://cdn-icons-png.flaticon.com/512/91/91501.png',
                }}
                style={styles.jobIcon}
              />
            </View>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      />

<Text style={[styles.sectionHeader, {textAlign : 'left'}]}>STARSET NEWS</Text>

<TouchableOpacity style={styles.articleContainer} onPress={goToNews}>
  {/* 3 images à gauche */}
  <View style={styles.articleImages}>
    {article.images.map((url, i) => (
      <Image key={i} source={{ uri: url }} style={styles.articleImage} />
    ))}
  </View>

  {/* Contenu texte au milieu (qui prendra toute la largeur dispo) */}
  <View style={styles.articleContent}>
    <Text style={styles.articleTitle}>{article.title}</Text>
    {article.subtitle ? (
      <Text style={styles.articleSubtitle}>{article.subtitle}</Text>
    ) : null}
    <Text
      style={styles.articleText}
      numberOfLines={5}
      ellipsizeMode="tail"
    >
      {article.text}
    </Text>
  </View>

  {/* Date flottante en absolute */}
  <Text style={styles.articleDate}>{article.date}</Text>
</TouchableOpacity>

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
            {/* Description du métier */}
            <Text style={styles.jobDescription}>{selectedJob?.description}</Text>

            {/* Autres informations */}
            

            {/* Bouton fermer */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.addButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
   tinyLogo: {
    marginTop:20,
    width: 250,
    height: 100
  },
  croissance: {
    resizeMode: 'contain',
    height: 10,
    width: '80%',
  },
  croissanceContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 10,
    justifyContent: 'flex-end',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  statText: {
    fontSize: 14,
    color: '#000',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  icon: {
    width: 35,
    height: 35,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    marginTop : 20,
    textAlign : 'center'
  },
  
  workerImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  
  jobsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  jobItem: {
    alignItems: 'center',
    justifyContent : 'center',
    marginRight: 15,
    backgroundColor: '#E3E3E3',
    borderRadius: 6,
    padding: 10,
    paddingHorizontal: 10,
    width: 80,
    height : 80
  },
  jobIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  jobText: {
    fontSize: 10,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  newsCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  newsDate: {
    fontSize: 12,
    color: '#888',
  },
  newsDescription: {
    fontSize: 14,
    color: '#666',
  },

  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 4,
    zIndex: 2,
  },
  workerWrapper: {
    marginRight: 15,
    position: 'relative',
    paddingBottom: 5, // évite que le badge dépasse du FlatList
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
    color : 'black'
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
    color : 'black'
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
    width: '98%',
    paddingTop : 10
  },

  articleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 20,
    position: "relative", // ← nécessaire pour le absolute
  },
  
  articleImages: {
    
    flexDirection: "column",
    //height : '100%',
    justifyContent : 'center',
    marginRight : 10
    
  },
  
  articleImage: {
    width: 90,
    height: 60,
    marginBottom: 8,
    borderRadius: 6,
  },
  
  articleContent: {
    flex: 2,
    paddingTop : 10,
    paddingRight : 8
    //paddingHorizontal: 10,
  },
  
  articleTitle: {
    fontSize: 15,
    fontFamily : 'BebasNeue',
    color: "#000",
    marginBottom: 6,
  },
  
  articleSubtitle: {
    fontSize: 12,
    fontFamily : 'LeagueSpartanBold',
    color: "#333",
    marginBottom: 6,
  },
  
  articleText: {
    fontSize: 8,
    color: "#444",
    fontFamily : 'LexendDeca'
  },
  
  articleDate: {
    position: "absolute",
    top: 0,          // ← colle en haut
    right: 0,        // ← colle à droite
    fontSize: 10,
    color: "#888",
  },
  
  
});

export default CroissanceScreen;

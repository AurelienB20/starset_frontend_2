import { useAllWorkerPrestation } from '@/context/userContext';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import { Alert, Image, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import config from '../../config.json';

const dayImages: { [key: number]: any } = {
  1: require('../../assets/images/day_icon/1.png'),
  2: require('../../assets/images/day_icon/2.png'),
  3: require('../../assets/images/day_icon/3.png'),
  4: require('../../assets/images/day_icon/4.png'),
  5: require('../../assets/images/day_icon/5.png'),
  6: require('../../assets/images/day_icon/6.png'),
  7: require('../../assets/images/day_icon/7.png'),
  8: require('../../assets/images/day_icon/8.png'),
  9: require('../../assets/images/day_icon/9.png'),
  10: require('../../assets/images/day_icon/10.png'),
  11: require('../../assets/images/day_icon/11.png'),
  12: require('../../assets/images/day_icon/12.png'),
  13: require('../../assets/images/day_icon/13.png'),
  14: require('../../assets/images/day_icon/14.png'),
  15: require('../../assets/images/day_icon/15.png'),
  16: require('../../assets/images/day_icon/16.png'),
  17: require('../../assets/images/day_icon/17.png'),
  18: require('../../assets/images/day_icon/18.png'),
  19: require('../../assets/images/day_icon/19.png'),
  20: require('../../assets/images/day_icon/20.png'),
  21: require('../../assets/images/day_icon/21.png'),
  22: require('../../assets/images/day_icon/22.png'),
  23: require('../../assets/images/day_icon/23.png'),
  24: require('../../assets/images/day_icon/24.png'),
  25: require('../../assets/images/day_icon/25.png'),
  26: require('../../assets/images/day_icon/26.png'),
  27: require('../../assets/images/day_icon/27.png'),
  28: require('../../assets/images/day_icon/28.png'),
  29: require('../../assets/images/day_icon/29.png'),
  30: require('../../assets/images/day_icon/30.png'),
  31: require('../../assets/images/day_icon/31.png'),
};

const JobsScreen = () => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false); // Modal for "Nouveau"
  const [isRequestModalVisible, setRequestModalVisible] = useState(false); // New modal for "Demande de missions"
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [prestations, setPrestations] = useState([]); 
  const [metierNames, setMetierNames] = useState([]); 
  const [isInProgressModalVisible, setInProgressModalVisible] = useState(false); // Popup "En Cours"
  const [workerPlannedPrestations, setWorkerPlannedPrestations] = useState<any[]>([]);
  const [isWorkerRequestModalVisible, setWorkerRequestModalVisible] = useState(false); // Modal qui affiche les missions planifiées du worker
  const { allWorkerPrestation, setAllWorkerPrestation } = useAllWorkerPrestation();
  const [selectedPrestationToDelete, setSelectedPrestationToDelete] = useState<any>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  const groupMissionsByMonth = (missions: any[]) => {
    const grouped: { [key: string]: any[] } = {};

    missions.forEach((mission) => {
      const date = new Date(mission.start_date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${month}-${year}`;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(mission);
    });

    return Object.entries(grouped).sort((a, b) => {
      const [monthA, yearA] = a[0].split('-').map(Number);
      const [monthB, yearB] = b[0].split('-').map(Number);
      return new Date(yearA, monthA).getTime() - new Date(yearB, monthB).getTime();
    });
  };

  const handleJobSelection = (jobTitle : any) => {
    setSelectedJob(jobTitle);
  };

  const getWorkerId = async () => {
    console.log("debut de get worker id")
    try {
      const worker_id = await AsyncStorage.getItem('worker_id');
      if (worker_id !== null) {
        console.log("worker_id")
        console.log(worker_id)
        return worker_id;
      }
    } catch (e) {
      
      console.error('Erreur lors de la récupération du type de compte', e);
    }
  };
  
const onRefresh = React.useCallback(() => {
  setRefreshing(true);
  setTimeout(() => {
    setRefreshing(false);
  }, 2000);
  getAllPrestation();
  getWorkerPlannedPrestation()
}, []);

  const getAllPrestation = async () => {
    try {
      const account_id = await getAccountId();
      const response = await fetch(`${config.backendUrl}/api/mission/get-all-prestation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_id }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if(data)
      {
        setPrestations(data.prestations);
        setAllWorkerPrestation(data.prestations);
      }
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des prestations:', error);
    }
  };

  const goToPrestation = (prestation : any) => {
    const id = prestation.id;
    console.log(123);
    navigation.navigate({
      name: 'prestation',
      params: { id },
    } as never);
  };

  const getAllMetierNames = async () => {
    try {
      const account_id = await getAccountId();
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
      if(data) setMetierNames(data.metierNames);
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des prestations:', error);
    }
  };

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

  const getWorkerPlannedPrestation = async () => {
    try {
      const worker_id = await getWorkerId();
      const response = await fetch(`${config.backendUrl}/api/mission/get-worker-planned-prestation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ worker_id: worker_id }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      if(data)
      {
        console.log('Worker Planned Prestation:', data.plannedPrestations);
        setWorkerPlannedPrestations(data.plannedPrestations);
      }
    } catch (error) {
      console.error('Error fetching worker planned prestations:', error);
    }
  };

  const handleChangePlannedPrestationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/change-planned-prestation-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log(`Prestation mise à jour: ${data.message}`);
  
      // Rafraîchir les prestations après mise à jour
      await getWorkerPlannedPrestation();
      setRequestModalVisible(false); // Fermer le modal après action
  
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleDeletePrestation = async () => {
  if (!selectedPrestationToDelete) return;

  try {
    const response = await fetch(`${config.backendUrl}/api/mission/delete-prestation-if-no-planned`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prestation_id: selectedPrestationToDelete.id }),
    });

    const data = await response.json();

    if (data.success) {
      // Mise à jour de la liste
      await getAllPrestation();
      setShowDeleteConfirmation(false);
      setSelectedPrestationToDelete(null);
    } else {
      alert(data.message || "Impossible de supprimer la prestation.");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    alert("Erreur serveur.");
  }
};
  
  
  const openWorkerRequestModal = async () => {
    setWorkerRequestModalVisible(true);
  };

  useEffect(() => {
    getAllPrestation();
    getAllMetierNames();
    getWorkerPlannedPrestation()
  }, []);

  const isSelected = (jobTitle : any) => selectedJob === jobTitle;


  const filteredPrestations = allWorkerPrestation?.filter((prestation: any) =>
    prestation.metier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => setInProgressModalVisible(true)}>
          <View style={styles.iconCircle}>
            <FontAwesome name="coffee" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>MY JOBS</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher"
        placeholderTextColor="#808080"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      
      <TouchableOpacity style={styles.missionBanner} onPress={openWorkerRequestModal}>
        <Text style={styles.missionText}>
          Demande de missions : {workerPlannedPrestations.filter(p => p.status === 'waiting').length}
        </Text>
      </TouchableOpacity>

      {filteredPrestations.map((prestation: any, index: number) => (
        <TouchableOpacity 
  key={index} 
  style={styles.jobCard}
  onPress={() => goToPrestation(prestation)}
>
  <View style={styles.jobCardContent}>
    {/* Image à gauche */}
    <Image
      source={{ uri: prestation.picture_url || 'https://via.placeholder.com/100' }}
      style={styles.prestationImage}
    />

    {/* Texte et infos à droite */}
    <View style={{ flex: 1 }}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle}>{prestation.metier}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButtonTouchable}
          onPress={() => {
            setSelectedPrestationToDelete(prestation);
            setShowDeleteConfirmation(true);
          }}
        >
          <FontAwesome name="ellipsis-v" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.jobStats}>({prestation.completedprestation}) Missions effectuées</Text>
      <Text style={styles.jobStats}>(0) Multimédia</Text>
      <Text style={styles.jobRequests}>(0) Demandes missions</Text>
      <View style={[styles.statusBadge, { backgroundColor: prestation.published ? '#00cc66' : '#cc0000' }]}>
        <Text style={styles.statusText}>{prestation.published ? 'Publié' : 'Not Published'}</Text>
      </View>
    </View>
  </View>
</TouchableOpacity>
      ))}

      {/* New Modal for "Demande de missions" */}
      <Modal
        transparent={true}
        visible={isRequestModalVisible}
        animationType="slide"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.offerModalContent}>
            
            {/* Bouton de fermeture en haut à droite */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setRequestModalVisible(false)}>
              <FontAwesome name="times" size={20} color="black" />
            </TouchableOpacity>

            {/* Titre */}
            <Text style={styles.modalTitle}>Détails de la mission</Text>

            {/* Affichage des infos de la mission */}
            {selectedJob && (
              <View style={styles.missionInProgressItemContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width : "100%"  }}>
                <Image
                  source={dayImages[new Date(selectedJob.start_date).getUTCDate()]}
                  style={styles.dayImage}
                />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.missionInProgressText}>{selectedJob.metier}</Text>
                    <Text style={styles.missionTime}>
                      {selectedJob.start_time} → {selectedJob.end_time}
                    </Text>
                  </View>
                </View>
                <Text style={styles.missionPrice}>{selectedJob.remuneration}€</Text>
              </View>
            )}

            {/* Boutons Accepter & Refuser */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleChangePlannedPrestationStatus(selectedJob.id, 'rejected')}
              >
                <Text style={styles.modalButtonText}>Refuser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleChangePlannedPrestationStatus(selectedJob.id, 'inProgress')}
              >
                <Text style={styles.modalButtonText}>Accepter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent={true} visible={isInProgressModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>MISSIONS EN COURS</Text>
            <ScrollView contentContainerStyle={styles.missionInProgressItemContainer}>
  {workerPlannedPrestations.filter(p => p.status === 'inProgress').length > 0 ? (
    groupMissionsByMonth(workerPlannedPrestations.filter(p => p.status === 'inProgress')).map(([key, prestations]) => {
      const [monthIndex, year] = key.split('-');
      const monthLabel = `${monthNames[+monthIndex]} ${year}`;

      return (
        <View key={key} style={styles.missionList}>
          <Text style={styles.modalSubtitle}>
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </Text>

          {prestations.map((prestation: any, index: number) => (
            <TouchableOpacity key={index} style={styles.missionItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                
                <Image
                  source={dayImages[new Date(prestation.start_date).getUTCDate()]}
                  style={styles.dayImage}
                />
                
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.missionInProgressText}>{prestation.metier}</Text>
                  <Text style={styles.missionTime}>
                    {prestation.start_time} → {prestation.end_time}
                  </Text>
                </View>
              </View>
              <Text style={styles.missionPrice}>{prestation.remuneration}€</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    })
  ) : (
    <Text style={styles.noMissionsText}>Aucune mission en cours.</Text>
  )}
</ScrollView>

            <TouchableOpacity onPress={() => setInProgressModalVisible(false)}
              style={styles.inProgressCloseButton}>
              <Text style={styles.inProgressCloseButtonText}>FERMER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={isWorkerRequestModalVisible}
        animationType="slide"
        onRequestClose={() => setWorkerRequestModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DEMANDES DE MISSIONS</Text>
            <Text style={styles.modalSubtitle}>Missions en attente</Text>

            {/* Liste des prestations récupérées */}
           <ScrollView contentContainerStyle={styles.missionInProgressItemContainer}>
  {workerPlannedPrestations.filter(p => p.status === 'waiting').length > 0 ? (
    groupMissionsByMonth(workerPlannedPrestations.filter(p => p.status === 'waiting')).map(([key, prestations]) => {
      const [monthIndex, year] = key.split('-');
      const monthLabel = `${monthNames[+monthIndex]} ${year}`;

      return (
        <View key={key} style={styles.missionList}>
          <Text style={styles.modalSubtitle}>
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </Text>

          {prestations.map((prestation: any, index: number) => (
            <View key={index} style={styles.missionItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={dayImages[new Date(prestation.start_date).getUTCDate()]}
                style={styles.dayImage}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.missionInProgressText}>{prestation.metier}</Text>
                <Text style={styles.missionTime}>
                  {prestation.start_time} → {prestation.end_time}
                </Text>
              </View>
            </View>
            <Text style={styles.missionPrice}>{prestation.remuneration}€</Text>
          
            {/* Boutons Accepter / Refuser */}
            <View style={[styles.modalButtons, { marginTop: 10 }]}>
  <TouchableOpacity
    style={styles.rejectButton}
    onPress={() =>
      Alert.alert(
        "Confirmation",
        "Voulez-vous vraiment refuser cette mission ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Refuser",
            style: "destructive",
            onPress: () => handleChangePlannedPrestationStatus(prestation.id, 'rejected'),
          },
        ]
      )
    }
  >
    <Text style={styles.modalButtonText}>Refuser</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.acceptButton}
    onPress={() =>
      Alert.alert(
        "Confirmation",
        "Voulez-vous vraiment accepter cette mission ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Accepter",
            onPress: () => handleChangePlannedPrestationStatus(prestation.id, 'inProgress'),
          },
        ]
      )
    }
  >
    <Text style={styles.modalButtonText}>Accepter</Text>
  </TouchableOpacity>
</View>

          </View>
          ))}
        </View>
      );
    })
  ) : (
    <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>
      Aucune mission en attente.
    </Text>
  )}
</ScrollView>


            {/* Bouton pour fermer le modal */}
            <TouchableOpacity
              style={styles.inProgressCloseButton}
              onPress={() => setWorkerRequestModalVisible(false)}
            >
              <Text style={styles.inProgressCloseButtonText}>FERMER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={showDeleteConfirmation}
        animationType="slide"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Supprimer la prestation ?</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              Cette action est irréversible. Voulez-vous vraiment continuer ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => setShowDeleteConfirmation(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleDeletePrestation}
              >
                <Text style={styles.modalButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    marginTop : 30
  },
  title: {
    fontWeight: 'bold',
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 20,
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
  missionBanner: {
    backgroundColor: '#00cc66',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  missionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  jobCard: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  jobStats: {
    fontSize: 16,
    color: '#666',
  },
  jobRequests: {
    fontSize: 16,
    color: 'red',
  },
  newJobButton: {
    backgroundColor: '#00cc66',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  newJobButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalOptionText: {
    fontSize: 18,
  },
  selectedOption: {
    backgroundColor: '#00cc66',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  validateButton: {
    backgroundColor: '#00cc66',
    padding: 10,
    borderRadius: 5,
  },
  validateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    
    padding: 10,
    borderRadius: 5,
    position: 'absolute', // Permet de positionner l'élément librement
    top: 10, // Marge en haut
    right: 10, // Colle le bouton à droite
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  requestModalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  requestModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  requestModalDetail: {
    fontSize: 16,
    color: '#00cc66',
    marginBottom: 15,
  },

  requestModalSectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },

  requestModalInfo: {
    fontSize: 14,
    marginBottom: 5,
  },

  requestModalTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00cc66',
    marginVertical: 10,
  },

  requestModalLink: {
    color: '#007BFF',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },

  acceptButton: {
    backgroundColor: '#00cc66',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },

  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  iconContainer: {
    width : '100%',
    alignItems : 'flex-end',
    justifyContent  : 'flex-end',
    marginTop : 10,
    zIndex: 10, // Assure que l'icône est au-dessus du reste du contenu
  },

  iconCircle: {
    backgroundColor: '#00cc66', // Vert
    width: 40, // Taille du cercle
    height: 40,
    borderRadius: 20, // Cercle parfait
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalSubtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
    textAlign: 'left',
  },
  
  missionItem: {
    width : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Équilibre entre les éléments
    marginVertical: 10,
    padding: 10,
    paddingRight : 50,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0', // Couleur claire pour la bordure
    position: 'relative',
  },

  missionInProgressItemContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginVertical: 10,
    width : '100%',
    
  },

  missionInProgressText: {
    marginLeft: 10,
    fontSize: 13,
    color: '#333',
  },
  inProgressCloseButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  inProgressCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  missionTime: {
    fontSize: 14,
    color: '#666', // Gris clair
  },
  missionPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#00cc66', // Vert
    position: 'absolute',
    right: 10, // Alignement à droite
  },

  dayText: {
    color : 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign : 'center'
  },
  
  dayContainer: {
    width : 30,
    height : 30,
    backgroundColor : '#1E90FF',
    borderRadius : 5
  },

  dayImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },

  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  offerModalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  
  rejectButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 5,
    
    alignItems: 'center',
    marginHorizontal: 5,
  },

  noMissionsText: { 
    textAlign: 'center', 
    color: '#999', 
    marginVertical: 10 
  },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 5,
  },

  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  deleteButtonTouchable: {
    padding: 10,       // augmente la zone cliquable autour de l'icône
    justifyContent: 'center',
    alignItems: 'center',
  },

  missionList: {
    width : "100%",
    
  },

  
  
  jobTitleContainer: {
    flex: 1,
    paddingRight: 10, // pour ne pas chevaucher l'icône
  },

  jobCardContent: {
  flexDirection: 'row',
  alignItems: 'center',
},

prestationImage: {
  width: 100,
  height: 100,
  borderRadius: 10,
  marginRight: 10,
  
},
  
  
  
});

export default JobsScreen;
function setRefreshing(arg0: boolean) {
  throw new Error('Function not implemented.');
}


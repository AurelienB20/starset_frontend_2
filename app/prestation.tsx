import CertificationFormModal from '@/components/CertificationModal';
import ExperienceModal from '@/components/ExperienceModal';
import { useAllWorkerPrestation, useCurrentWorkerPrestation } from '@/context/userContext';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { IconButton, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import config from '../config.json';


import {
  getAllExperience,
  getPrestation
} from '../api/prestationApi';

const emptyCertification = {
  title: '',
  institution: '',
  date: '',
  description: '',
  images: [],
};

const emptyExperience = {
  title: '',
  date: '',
  description: '',
  images: [],
};


const PrestationScreen = () => {
  const [description, setDescription] = useState('');
  const [selectedTab, setSelectedTab] = useState('photos'); // 'photos', 'experiences', or 'certifications'
  const [isEditing, setIsEditing] = useState(false);
  const [prestationPhotos, setPrestationPhotos] = useState<any>([])
  const [uploading, setUploading] = useState<boolean>(false);
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);
  //const [prestation, setPrestation] = useState<any>({});
  const { currentWorkerPrestation: prestation, setCurrentWorkerPrestation } = useCurrentWorkerPrestation();

  const [experiences, setExperiences] = useState<any[]>([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // État pour gérer la visibilité du popup

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [experienceDescription, setExperienceDescription] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [remuneration, setRemuneration] = useState(prestation?.remuneration || ''); // Assurez-vous que prestation.remuneration est disponible

  const [certifications, setCertifications] = useState<any>([]);
  const [isCertificationFormVisible, setCertificationFormVisible] = useState(false);
  const [certificationTitle, setCertificationTitle] = useState('');
  const [certificationInstitution, setCertificationInstitution] = useState('');
  const [certificationDate, setCertificationDate] = useState('');
  const [isImageModalVisible, setImageModalVisible] = useState(false); // Contrôle de la visibilité du modal
  const [selectedImage, setSelectedImage] = useState(null); // Image sélectionnée
  const { allWorkerPrestation, setAllWorkerPrestation } = useAllWorkerPrestation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showExperienceCalendar, setShowExperienceCalendar] = useState(false);
  const [experienceDate, setExperienceDate] = useState('');
  const [selectedMode, setSelectedMode] = useState<'sur place' | 'distanciel'>(prestation?.is_remote ? 'distanciel' : 'sur place');

  const [selectedTarifMode, setSelectedTarifMode] = useState<'heure' | 'prestation'>(prestation?.type_of_remuneration === 'hourly' ? 'heure' : 'prestation');
  const [certificationImages, setCertificationImages] = useState<any[]>([]);
  const [experienceImages, setExperienceImages] = useState<string[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<'experience' | 'certification' | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInstitution, setEditInstitution] = useState(''); // uniquement pour certification
  const [editImages, setEditImages] = useState<string[]>([]);
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [isExperienceModalVisible, setExperienceModalVisible] = useState(false);
  const [isTarifChangePopupVisible, setIsTarifChangePopupVisible] = useState(false);
const [newTarifMode, setNewTarifMode] = useState<'heure' | 'prestation'>('heure');
const [mandatoryDocuments, setMandatoryDocuments] = useState<any[]>([]);


 

  // Ouvre le menu pour une certification spécifique
  const openMenu = (id: string) => setMenuVisibleId(id);
  // Ferme le menu
  const closeMenu = () => setMenuVisibleId(null);

  const route = useRoute() as any;
  const prestation_id = route.params?.id;
  const maxDescriptionLength = 300;
  
  const navigation = useNavigation();
  const goToAvailability = async () => {
    navigation.navigate('availability' as never);
  };

  const getWorkerId = async () => {
    try {
      const worker_id = await AsyncStorage.getItem('worker_id');
      if (worker_id !== null) {
        return worker_id;
      }
    } catch (e) {
      console.error('Erreur lors de la récupération du type de compte', e);
    }
  };

  const openOptions = (item: any, type: 'experience' | 'certification') => {
  setSelectedItem(item);
  setEditType(type);
  setEditModalVisible(true);
};

  const openEditForm = () => {
    if (!selectedItem) return;

    setEditTitle(selectedItem.title);
    setEditDate(selectedItem.date);
    setEditDescription(selectedItem.description);
    if (editType === 'certification') {
      setEditInstitution(selectedItem.institution || '');
    }
    setEditImages(selectedItem.images || []);
    setEditModalVisible(false);
    setShowExperienceForm(false); // cacher formulaire création normal
    setCertificationFormVisible(false);

    // ouvrir formulaire édition selon type
    if (editType === 'experience') setShowExperienceForm(true);
    else if (editType === 'certification') setCertificationFormVisible(true);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleEditCertification = (certification: any) => {
    closeMenu();
    // Ta logique d'édition ici (ex: setSelectedItem, ouvrir formulaire...)
    //openEditFormForCertification(certification);
  };

  const handleDeleteCertification = (certification: any) => {
    closeMenu();
    // Ta logique de suppression ici (ex: setSelectedItem, confirmer suppression...)
    setSelectedItem(certification);
    setEditType('certification');
    //confirmDeleteCertification(); // Ou ta fonction d’alerte de confirmation
  };

  const handleDateSelect = (day: any) => {
    const formatted = moment(day.dateString).format('DD/MM/YYYY');
    setCertificationDate(formatted);
    setShowCalendar(false);
  };

  const handleExperienceDateSelect = (day: any) => {
    const formatted = moment(day.dateString).format('DD/MM/YYYY');
    setExperienceDate(formatted);
    setShowExperienceCalendar(false);
  };

  // Pour ajouter une certification
  const handleAddCertificationClick = () => {
    setEditType('certification');
    setSelectedItem({ ...emptyCertification });
    setCertificationFormVisible(true);
  };

  // Pour ajouter une expérience
  const handleAddExperienceClick = () => {
    setEditType('experience');
    setSelectedItem({ ...emptyExperience });
    setExperienceModalVisible(true);
  };
  
  const getExperienceMarkedDates = () => {
    if (!experienceDate) return {};
    const dateISO = moment(experienceDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    return {
      [dateISO]: {
        selected: true,
        selectedColor: '#00cc66',
      },
    };
  };

  const getMarkedDates = () => {
    if (!certificationDate) return {};
  
    const dateISO = moment(certificationDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
    return {
      [dateISO]: {
        selected: true,
        selectedColor: '#00cc66',
      },
    };
  };

  const handleDelete = async () => {
    if (!selectedItem || !editType) return;

    Alert.alert(
      `Supprimer cette ${editType} ?`,
      "Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const url = editType === 'experience' ? 
                `${config.backendUrl}/api/mission/delete-experience` : 
                `${config.backendUrl}/api/mission/delete-certification` ;

              const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedItem.id }),
              });

              if (!response.ok) throw new Error('Erreur réseau');

              if (editType === 'experience') {
                setExperiences(prev => prev.filter(e => e.id !== selectedItem.id));
              } else {
                setCertifications((prev: any[]) => prev.filter(c => c.id !== selectedItem.id));
              }
              setEditModalVisible(false);
              setSelectedItem(null);
              Alert.alert('Succès', `${editType} supprimée.`);
            } catch (error : any) {
              Alert.alert('Erreur', `Impossible de supprimer la ${editType}. `);
              console.log(error?.message)
            }
          },
        },
      ]
    );
  };

  const updateCertification = async () => {
    try {
      const base64Images = [];
  
      for (const uri of selectedItem.images || []) {
        if (uri.startsWith('data:image')) {
          base64Images.push(uri); // déjà encodée
        } else if (uri.startsWith('file://')) {
          // Image locale à convertir
          const response = await fetch(uri);
          const blob = await response.blob();
          const reader = new FileReader();
          const base64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          base64Images.push(base64 as string);
        } else {
          // Image distante déjà hébergée, on la garde
          base64Images.push(uri);
        }
      }
  
      const response = await fetch(`${config.backendUrl}/api/mission/update-certification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          title: selectedItem.title,
          institution: selectedItem.institution,
          date: selectedItem.date,
          description: selectedItem.description,
          images: base64Images,
          prestation_id,
        }),
      });
  
      if (!response.ok) throw new Error('Erreur réseau');
  
      const data = await response.json();
  
      setCertifications((prev: any[]) =>
        prev.map(cert => cert.id === selectedItem.id ? (data ? data.certification:cert): cert)
      );
  
      setCertificationFormVisible(false);
      setSelectedItem(null);
      Alert.alert('Succès', 'Certification mise à jour');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la certification');
    }
  };

  const confirmToggleIsRemote = () => {
    const nextMode = selectedMode === 'sur place' ? 'distanciel' : 'sur place';
  
    Alert.alert(
      "Confirmer le changement",
      `Voulez-vous vraiment passer en mode ${nextMode.toUpperCase()} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: toggleIsRemote, // Appelle la vraie fonction ici
        },
      ]
    );
  };

  const toggleIsRemote = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/toggle-is-remote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prestation_id: prestation_id }), // ou prestation.id si c’est déjà dans le state
      });
  
      if (!response.ok) throw new Error('Erreur réseau');
  
      const data = await response.json();
  
      if (data.success) {
        setSelectedMode(prev => (prev === 'sur place' ? 'distanciel' : 'sur place'));
        setCurrentWorkerPrestation((prev: any) => ({
          ...prev,
          is_remote: !prev?.is_remote,
        }));
        Alert.alert('Succès', `Mode de prestation mis à jour.`);
      } else {
        Alert.alert('Erreur', data.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error('Erreur toggleIsRemote :', error);
      Alert.alert('Erreur', 'Impossible de modifier le mode de prestation.');
    }
  };
  


  const updateExperience = async () => {
  try {
    // Convertir les images si besoin comme pour création
    const base64Images = [];
    for (const uri of selectedItem.images || []) {
      if (uri.startsWith('data:image')) {
        base64Images.push(uri); // déjà encodée
      } else if (uri.startsWith('file://')) {
        // Image locale à convertir
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        base64Images.push(base64 as string);
      } else {
        // Image distante (hébergée) : on garde l'URL
        base64Images.push(uri);
      }
    }

    console.log("donnees pour la mise a jour de l'experience")
    console.log(selectedItem)
    //console.log(base64Images)

    const response = await fetch(`${config.backendUrl}/api/mission/update-experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedItem.id,
        title: selectedItem.title,
        date: selectedItem.date,
        experienceDescription: selectedItem.description,
        images: base64Images,
        prestation_id,
      }),
    });

    if (!response.ok) throw new Error('Erreur réseau');

    const data = await response.json();
    
    setExperiences(prev => prev.map(e => e.id === selectedItem.id ? (data ? data.experience:e) : e));
    setExperienceModalVisible(false);
    setSelectedItem(null);
    Alert.alert('Succès', 'Expérience mise à jour');
  } catch (error) {
    Alert.alert('Erreur', 'Impossible de mettre à jour l\'expérience');
  }
};

  const handleDeletePhoto = async (index : any) => {
    const photoToDelete = prestationPhotos[index]; // Récupérer la photo à supprimer
    const photoAdress = photoToDelete.adress; // Assurez-vous que l'ID de la photo est disponible
  
    Alert.alert(
      "Supprimer la photo",
      "Êtes-vous sûr de vouloir supprimer cette photo ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          onPress: async () => {
            try {
              const response = await fetch(`${config.backendUrl}/api/uploads/delete-photo`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adress: photoAdress }),
              });
  
              if (!response.ok) {
                //console.log(response)
                throw new Error('Erreur lors de la suppression de la photo');
              }
  
              const data = await response.json();

              if (data.success) {
                // Supprimez la photo localement
                const updatedPhotos = [...prestationPhotos];
                updatedPhotos.splice(index, 1); // Supprimez la photo à l'index donné
                setPrestationPhotos(updatedPhotos);
                Alert.alert("Succès", "La photo a été supprimée avec succès.");
              } else {
                Alert.alert("Erreur", data.message || "Une erreur est survenue.");
              }
            } catch (error) {
              console.error("Erreur lors de la suppression de la photo :", error);
              Alert.alert("Erreur", "Impossible de supprimer la photo.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const pickEditImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.5,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
  
      // Mise à jour de selectedItem (images)
      setSelectedItem((prevItem: { images: any; }) => ({
        ...prevItem,
        images: [...(prevItem.images || []), base64Image],
      }));
    }
  };

  const pickExperienceImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Autorisez l'accès à la galerie.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
  
    if (!result.canceled && result.assets && experienceImages.length < 3) {
      setExperienceImages(prev => [...prev, result.assets[0].uri]);
    } else if (experienceImages.length >= 3) {
      Alert.alert("Limite atteinte", "Vous ne pouvez ajouter que 3 images.");
    }
  };

  const pickCertificationImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert("Permission refusée", "Autorisez l'accès à la galerie.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.5,
  });

  if (!result.canceled && result.assets && certificationImages.length < 3) {
    setCertificationImages(prev => [...prev, result.assets[0].uri]);
  } else if (certificationImages.length >= 3) {
    Alert.alert("Limite atteinte", "Vous ne pouvez ajouter que 3 images.");
  }
};

  const addPrestationPhoto = async () => {
    // Demander la permission d'accès à la bibliothèque d'images
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (!permissionResult.granted) {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie pour continuer.');
      return;
    }
  
    // Ouvrir la bibliothèque d'images
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //allowsEditing: true, // Permet de recadrer l'image si besoin
      quality: 0.5, // Qualité maximale
    });
  
    if (result.canceled) {
      //console.log('L\'utilisateur a annulé la sélection d\'image.');
      Alert.alert('Erreur', 'Aucune photo sélectionnée');
      return;
    }
  
    const photo = { uri: result.assets[0].uri };

    setUploading(true);

    try {
      // Convertir l'image en base64 pour envoyer directement via JSON
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Data = reader.result;

        // Créer un objet JSON avec les informations du fichier
        const file = {
          filename: 'profile-photo.jpg',
          mimetype: 'image/jpeg', // Type MIME de l'image
          data: base64Data,   // Base64 ou blob
        };
        
        const object_id=prestation?.id
        const type_object = 'prestation'

        // Envoyer l'image au serveur
        const uploadResponse = await fetch(`${config.backendUrl}/api/uploads/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({file,object_id,type_object}), // Envoyer l'objet JSON directement
        });

        if (uploadResponse.ok) {
          const responseData = await uploadResponse.json();
          //console.log('Upload success:', responseData);
          Alert.alert('Succès', 'Photo téléchargée avec succès');
          if (responseData.dbRecord) {
            setPrestationPhotos((prevPhotos : any) => [...prevPhotos, responseData.dbRecord]);
          }
        } else {
          console.log('Upload failed:', uploadResponse.status);
          Alert.alert('Erreur', 'Échec du téléchargement');
        }
      };

      reader.readAsDataURL(blob); // Lire le blob comme une chaîne base64
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setUploading(false);
    }
  }



  const handleSaveRemuneration = async () => {
    // Code pour sauvegarder la rémunération
    setModalVisible(false);
    Alert.alert("Succès", "La rémunération a été enregistrée.");
    const response = await fetch(`${config.backendUrl}/api/mission/update-remuneration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prestation_id,remuneration }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    

  };

  const handleFormattedRemuneration = (text: string) => {
    // Enlève tout sauf les chiffres
    const cleaned = text.replace(/[^0-9]/g, '');
  
    let number = parseInt(cleaned || '0', 10);
  
    // Divise par 100 pour avoir deux décimales
    const formatted = (number / 100).toFixed(2);
  
    setRemuneration(formatted);
  };

  const fetchMetierDocuments = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/document/get-metier-document-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metier_name: prestation?.metier }),
      });
  
      if (!response.ok) {
        console.warn("Erreur lors de la récupération des documents métier.");
        return;
      }
  
      const data = await response.json();
  
      if (data.success && data.documents) {
        const mandatory = data.documents.filter((doc: any) => doc.type === 'mandatory');
        setMandatoryDocuments(mandatory);
      }
    } catch (error) {
      console.error("Erreur lors de fetchMetierDocuments :", error);
    }
  };
  

  const getAllCertification = async () => {
    try {
      
      
      const response = await fetch(`${config.backendUrl}/api/mission/get-all-certification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prestation_id }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      //console.log('certification :', data.certifications);

      // Stocker les prestations dans l'état
      if(data) setCertifications(data.certifications);
      
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des experiences:', error);
    }
  };

  
  const getPrestationPhotos = async () => {
    try {
      //console.log('debut get experiences')
      
      const response = await fetch(`${config.backendUrl}/api/mission/get-all-experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prestation_id }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      //console.log('experiences :', data.experiences);

      // Stocker les prestations dans l'état
      if(data) setExperiences(data.experiences);
      
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des experiences:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveDescription = async () => {
    setIsEditing(false);
    // Vous pouvez ajouter ici le code pour sauvegarder la nouvelle description, si nécessaire
    try {
      
      
      const response = await fetch(`${config.backendUrl}/api/mission/save-prestation-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prestation_id, description }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if(data) console.log('prestation modifié:', data.prestation[0]);

      // Stocker les prestations dans l'état
      
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des prestations:', error);
    }
  };

  const handleTarifModeChange = (newValue : any) => {
    // Afficher l'alerte de confirmation
    Alert.alert(
      "Confirmer le changement",
      `Voulez-vous vraiment passer au tarif par ${newValue === 'heure' ? 'heure' : 'prestation'} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => {
            // Appel API
            fetch('https://api.starsetfrance.com/api/mission/update-type-of-remuneration', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prestation_id: prestation_id,
                type_of_remuneration: newValue,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  setSelectedTarifMode(newValue);
                  setCurrentWorkerPrestation({
                    ...prestation,
                    type_of_remuneration: newValue,
                  });
                  Alert.alert("Succès", "Type de rémunération mis à jour.");
                } else {
                  Alert.alert("Erreur", data.message || "Une erreur est survenue.");
                }
              })
              .catch((error) => {
                console.error("Erreur réseau :", error);
                Alert.alert("Erreur", "Impossible de contacter le serveur.");
              });
          }
        }
      ]
    );
  };

  const createExperience = async () => {
    try {
      if (!selectedItem) return;
  
      const base64Images = [];
  
      for (const uri of selectedItem.images || []) {
        if (uri.startsWith('data:image')) {
          base64Images.push(uri); // déjà en base64
        } else {
          const response = await fetch(uri);
          const blob = await response.blob();
  
          const reader = new FileReader();
          const base64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
  
          base64Images.push(base64);
        }
      }
  
      const response = await fetch(`${config.backendUrl}/api/mission/create-experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedItem.title,
          date: selectedItem.date,
          description: selectedItem.description,
          images: base64Images,
          prestation_id,
        }),
      });
  
      if (!response.ok) throw new Error('Erreur réseau');
  
      const data = await response.json();
      if(data) setExperiences(prev => [...prev, data.experience]);
  
      // Reset
      setExperienceModalVisible(false)
      setSelectedItem(null);
  
      Alert.alert('Succès', 'Expérience ajoutée avec succès');
    } catch (error) {
      console.error('Erreur création expérience:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'expérience');
    }
  };

  const openImageModal = (imageUri : any) => {
    setSelectedImage(imageUri);
    setImageModalVisible(true);
  };
  
  const closeImageModal = () => {
    setSelectedImage(null);
    setImageModalVisible(false);
  };

  const goToMultiplePrestation = () => {
    navigation.navigate('multiplePrestation' as never) 
  }

  const handleAddCertification = async () => {
    try {
      if (!selectedItem || (selectedItem.images || []).length === 0) {
        Alert.alert('Erreur', 'Veuillez ajouter au moins une image de certification.');
        return;
      }
  
      const base64Images = [];
  
      for (const uri of selectedItem.images || []) {
        if (uri.startsWith('data:image')) {
          base64Images.push(uri);
        } else {
          const response = await fetch(uri);
          const blob = await response.blob();
  
          const reader = new FileReader();
          const base64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
  
          base64Images.push(base64);
        }
      }
  
      const response = await fetch(`${config.backendUrl}/api/mission/create-certification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedItem.title,
          institution: selectedItem.institution,
          date: selectedItem.date,
          description: selectedItem.description,
          images: base64Images,
          prestation_id,
        }),
      });
  
      if (!response.ok) throw new Error("Erreur lors de l'ajout de la certification");
  
      const data = await response.json();
      if(data) setCertifications((prev: any[]) => [...prev, data.certification]);
  
      // Reset
      setCertificationFormVisible(false);
      setSelectedItem(null);
  
      Alert.alert('Succès', 'Certification ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la certification:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la certification');
    }
  };


  const confirmTogglePrestationPublished = () => {
    const action = prestation?.published ? "dépublier" : "publier";
  
    Alert.alert(
      ``,
      `Voulez-vous vraiment ${action} cette prestation ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: prestation?.published ? "Dépublier" : "Publier",
          style: "destructive",
          onPress: togglePrestationPublished, // Appelle la fonction qui gère la publication
        },
      ]
    );
  };

  const togglePrestationPublished = async () => {
    try {
      console.log('Début toggle prestation published');
  
      const response = await fetch(`${config.backendUrl}/api/mission/toggle-prestation-published`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: prestation_id }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Mise à jour de la publication :', data);
  
      // Mettre à jour l'état de la prestation en inversant la valeur de published
      setCurrentWorkerPrestation((prevPrestation : any) => ({
        ...prevPrestation,
        published: !prevPrestation.published,
      }));

      setAllWorkerPrestation((prev: any[]) =>
        prev.map(prestation =>
          prestation.id === prestation_id
            ? { ...prestation, published: !prestation.published }
            : prestation
        )
      );
    } catch (error) {
      console.error('Une erreur est survenue lors de la mise à jour de la publication:', error);
    }
  };

  const handleEditDescription = () => {
    setIsEditing(true); // Active le mode édition local
  };
  

  useEffect(() => {
    getPrestation(prestation_id).then((data: any) => {
      setCurrentWorkerPrestation(data.prestation);
      setSelectedTarifMode(data.prestation.type_of_remuneration)
      setPrestationPhotos(data.images);
      setRemuneration(data.prestation.remuneration);
    }).catch((error: any)  => console.error(error));
    
    getAllExperience(prestation_id).then((data : any) => {
      
      setExperiences(data.experiences);
    }).catch((error: any) => console.error(error));
    getAllCertification();
    fetchMetierDocuments();
  }, []);

  useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
        <Text style={{ marginRight: 8, fontWeight: 'bold', fontSize: 12 }}>
          {prestation?.published ? 'Publié' : 'Non publié'}
        </Text>
        <TouchableOpacity onPress={confirmTogglePrestationPublished}>
          <View
            style={{
              width: 40,
              height: 24,
              borderRadius: 12,
              backgroundColor: prestation?.published ? '#4cd137' : '#e84118',
              justifyContent: 'center',
              padding: 2,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#fff',
                alignSelf: prestation?.published ? 'flex-end' : 'flex-start',
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
    ),
  });
}, [navigation, prestation?.published]);



  useEffect(() => {
    if (prestation?.description) {
      console.log(prestation)
      setDescription(prestation.description as any);
    }
  }, [prestation]); // Cette fonction s'exécute quand 'prestation' est mis à jour

  return (
    <ScrollView style={styles.container}>
      <View style={styles.iconContainer}>
        {prestation?.picture_url ? (
          <Image
            source={{ uri: prestation.picture_url }}
            style={{ width: 60, height: 60, borderRadius: 30 }}
            resizeMode="cover"
          />
        ) : (
          <FontAwesome name="child" size={60} color="black" />
        )}
      </View>
      <Text style={styles.title}>{prestation?.metier}</Text>
      <View style={styles.widthMax}>
      <View style={styles.descriptionRow}>
        <View style={{ flex: 1, width : '100%' }}>
          <Text style={styles.infoLabel}>Description</Text>
          {isEditing ? (
            <TextInput
              style={styles.descriptionInput}
              multiline
              value={description}
              onChangeText={setDescription}
              maxLength={maxDescriptionLength}
            />
          ) : (
            <Text style={styles.infoValue}>{description || 'Aucune description'}</Text>
          )}
        </View>
        {isEditing ? (
          <TouchableOpacity
            onPress={handleSaveDescription}
            style={{
              backgroundColor: '#e0e0e0', // fond gris clair
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              width: '100%',
              marginTop: 10
            }}
          >
            <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }}>Valider</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleEditDescription}
            style={{
              backgroundColor: '#e0e0e0',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              width: '100%',
              marginTop: 10
            }}
          >
            <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold' }}>Modifier</Text>
          </TouchableOpacity>
        )}
      </View>

      
      
      <Text style={styles.characterCount}>{maxDescriptionLength - description.length} caractères</Text>
      <View style={{ marginVertical: 20 }}>
        
      <View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Mode de tarification<Text style={[{color: 'red'}]}> *</Text></Text>
  <View style={styles.toggleContainer}>
    <TouchableOpacity
      onPress={() => handleTarifModeChange('prestation')}
      style={[
        styles.toggleButton,
        selectedTarifMode === 'prestation' && styles.toggleButtonActive,
      ]}
    >
      <Text style={[
        styles.toggleText,
        selectedTarifMode === 'prestation' && styles.toggleTextActive,
      ]}>
        /PRESTATION
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => handleTarifModeChange('heure')}
      style={[
        styles.toggleButton,
        selectedTarifMode === 'heure' && styles.toggleButtonActive,
      ]}
    >
      <Text style={[
        styles.toggleText,
        selectedTarifMode === 'heure' && styles.toggleTextActive,
      ]}>
        /HEURE
      </Text>
    </TouchableOpacity>
  </View>
</View>

<View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Mode de prestation<Text style={[{color: 'red'}]}> *</Text></Text>
  <View style={styles.toggleContainer}>
    <TouchableOpacity
      onPress={() => selectedMode !== 'sur place' && confirmToggleIsRemote()}
      style={[
        styles.toggleButton,
        selectedMode === 'sur place' && styles.toggleButtonActive,
      ]}
    >
      <Text style={[
        styles.toggleText,
        selectedMode === 'sur place' && styles.toggleTextActive,
      ]}>
        PRÉSENTIEL
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => selectedMode !== 'distanciel' && confirmToggleIsRemote()}
      style={[
        styles.toggleButton,
        selectedMode === 'distanciel' && styles.toggleButtonActive,
      ]}
    >
      <Text style={[
        styles.toggleText,
        selectedMode === 'distanciel' && styles.toggleTextActive,
      ]}>
        DISTANCIEL
      </Text>
    </TouchableOpacity>
  </View>
</View>

      </View>

         {/* Section pour les horaires */}
      
      <View style={styles.availabilitySection}>
        <Text style={styles.availabilityTitle}>Ajouter mes disponibilités</Text>
        
        <TouchableOpacity
          style={styles.availabilityButton}
          onPress={goToAvailability}
        >
          <FontAwesome name="calendar" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {mandatoryDocuments.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Documents obligatoires</Text>
          {mandatoryDocuments.map((doc, index) => (
            <Text key={index} style={styles.documentItem}>
              • {doc.name}
            </Text>
          ))}
        </View>
      )}
      
      {/* Section pour les tarifs */}
      {!prestation?.type_of_remuneration?.toLowerCase().includes('heure') &&
 !prestation?.type_of_remuneration?.toLowerCase().includes('hourly') ? (
       <View style={styles.tarifSection}>
        <Text style={styles.tarifTitle}>Ajouter mes tarifs</Text>
        <TouchableOpacity
          style={prestation?.remuneration ? styles.tarifDisplay : styles.tarifButton}
          onPress={goToMultiplePrestation}
        >
          <FontAwesome name="euro" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    ) : (
      
      <View style={styles.tarifSection}>
        <Text style={styles.tarifTitle}>Ajouter mes tarifs</Text>

        <TouchableOpacity
          style={prestation?.remuneration ? styles.tarifDisplay : styles.tarifButton}
          onPress={() => setModalVisible(true)}
        >
          {prestation?.remuneration ? (
            <Text style={styles.tarifText}>{prestation.remuneration} €</Text>
          ) : (
            <FontAwesome name="euro" size={30} color="black" />
          )}
        </TouchableOpacity>
      </View>
    )}

      {/* Modal pour la saisie de la rémunération */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            
            {/* CROIX pour fermer */}
            <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>TARIF PAR HEURE</Text>
            
            <View style={styles.inputWithCurrency}>
              <TextInput
                style={styles.inputModal}
                placeholder="0,00"
                keyboardType="numeric"
                value={remuneration}
                onChangeText={handleFormattedRemuneration}
              />
              <Text style={styles.currency}>€</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveRemuneration}>
              <Text style={styles.saveButtonText}>ENREGISTRER</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedTab === 'photos' && styles.activeCategoryButton]}
          onPress={() => setSelectedTab('photos')}
        >
          <Text style={styles.categoryButtonText}>Photos ({prestationPhotos.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, selectedTab === 'experiences' && styles.activeCategoryButton]}
          onPress={() => setSelectedTab('experiences')}
        >
          <Text style={styles.categoryButtonText}>Expériences</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, selectedTab === 'certifications' && styles.activeCategoryButton]}
          onPress={() => setSelectedTab('certifications')}
        >
          <Text style={styles.categoryButtonText}>Certifications</Text>
        </TouchableOpacity>
      </View>
      </View>

      {selectedTab === 'photos' && (
        <View style={styles.photoGrid}>
          
          {prestationPhotos.map((photo : any, index : any) => (
            <TouchableWithoutFeedback
              key={index}
              onLongPress={() => handleDeletePhoto(index)} // Déclenche une alerte sur pression longue
              onPress={() => openImageModal(photo.adress)}
            >
              <Image source={{ uri: photo.adress }} style={styles.photo} />
            </TouchableWithoutFeedback>
            
          ))}
          <TouchableOpacity style={styles.addPhotoButton} onPress={addPrestationPhoto}>
            <FontAwesome name="plus" size={40} color="gray" />
          </TouchableOpacity>
        </View>
      )}

{selectedTab === 'experiences' && (
  <View>
    {/* Liste des expériences */}
    {experiences.map((experience: any) => (
      <View key={experience.id} style={styles.experienceCard}>
        <View style={styles.experienceHeader}>
          <Text style={styles.experienceTitle}>
            {experience?.title} <FontAwesome name="smile-o" size={20} />
          </Text>
          <Text style={styles.experienceDate}>{experience.date}</Text>
        </View>
        <Text style={styles.experienceDescription}>{experience.description}</Text>
        <View style={styles.experienceImages}>
          {experience.images?.map((imageUri: string, index: number) => (
            <Image key={index} source={{ uri: imageUri }} style={styles.experienceImage} />
          ))}
        </View>

        {/* Menu des 3 points */}
        <View style={styles.experienceMenuContainer}>
          <Menu
            visible={menuVisibleId === experience.id}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={() => openMenu(experience.id)}
                style={styles.menuIconButton}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                openOptions(experience, 'experience'); // remplit les states
                closeMenu();
                setExperienceModalVisible(true); // ensuite on ouvre le modal
              }}
              title="Modifier"
            />
            <Menu.Item
              
              onPress={() => {
                setEditType('experience');
                setSelectedItem(experience);
                handleDelete(); // ← là ça passe car setSelectedItem est juste avant
                closeMenu();
              }}
              title="Supprimer"
              titleStyle={{ color: 'red' }}
            />
          </Menu>
        </View>
      </View>
    ))}

    {/* Formulaire d’édition ou de création */}
    {isExperienceModalVisible && (
  <ExperienceModal
      visible={isExperienceModalVisible}
      onClose={() => {
        setExperienceModalVisible(false);
        if (editType === 'experience') {
          setEditType(null);
          setSelectedItem(null);
          setEditTitle('');
          setEditDescription('');
          setEditDate('');
          setEditImages([]);
        } else {
          setTitle('');
          setExperienceDescription('');
          setExperienceDate('');
          setExperienceImages([]);
        }
      }}
      isEditMode={editType === 'experience'}
      item = {selectedItem}
      showCalendar={showExperienceCalendar}
      onChange={(updatedItem) => {setSelectedItem(updatedItem), console.log(updatedItem)}}
      onAddImage={editType === 'experience' ? pickEditImage : pickExperienceImage}
      onSubmit={editType === 'experience' ? updateExperience : createExperience}
      onToggleCalendar={() => setShowExperienceCalendar(!showExperienceCalendar)}
    />)}
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => setExperienceModalVisible(true)}
    >
      <Text style={styles.addButtonText}>
        Ajouter une experience
      </Text>
    </TouchableOpacity>
    </View>
  )}


  <Modal
    animationType="slide"
    transparent={true}
    visible={showExperienceCalendar}
    onRequestClose={() => setShowExperienceCalendar(false)}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={() => setShowExperienceCalendar(false)} style={styles.closeIcon}>
          <Icon name="close" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.modalTitle}>Choisissez une date</Text>
        <Calendar
          onDayPress={handleExperienceDateSelect}
          markedDates={getExperienceMarkedDates()}
          style={styles.calendar}
        />
      </View>
    </View>
  </Modal>

      {/* Placeholder for the "Certifications" tab */}
      {selectedTab === 'certifications' && (
  <View>
    {certifications.length > 0 ? (
      certifications.map((certification: any, index: number) => (
        <View key={index} style={styles.certificationCardUpdated}>
  <View style={styles.certificationHeader}>
    {/* Colonne images */}
    <View
      style={[
        styles.certificationImagesColumn,
        {
          width: certification.images && certification.images.length > 0 ? 80 : 0,
          marginRight: certification.images && certification.images.length > 0 ? 10 : 0,
        },
      ]}
    >
      {certification.images && certification.images.length === 3 ? (
        <>
          <Image source={{ uri: certification.images[0] }} style={styles.certificationBigImage} />
          <View style={styles.certificationSmallImagesRow}>
            <Image source={{ uri: certification.images[1] }} style={styles.certificationSmallImage} />
            <Image source={{ uri: certification.images[2] }} style={styles.certificationSmallImage} />
          </View>
        </>
      ) : (
        certification.images?.map((uri: string, i: number) => (
          <Image key={i} source={{ uri }} style={styles.certificationMiniImage} />
        ))
      )}
    </View>

    {/* Contenu texte + menu */}
    <View style={{ flex: 1 }}>
      <View style={styles.certificationTextWithMenu}>
        <View style={{ flex: 1 }}>
          <Text style={styles.certificationTitle}>{certification.title}</Text>
          <Text style={styles.certificationDate}>{certification.date}</Text>
          <Text style={styles.certificationInstitution}>
            <Text style={{ fontStyle: 'italic' }}>{certification.establishment}</Text>
          </Text>
          <Text style={styles.certificationDescription}>{certification.description}</Text>
        </View>

        {/* Menu paramètres */}
        <View style={styles.certificationMenuContainer}>
          <Menu
            visible={menuVisibleId === certification.id}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={() => openMenu(certification.id)}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                openOptions(certification, 'certification');
                setCertificationFormVisible(true);
                closeMenu();
              }}
              title="Modifier"
            />
            <Menu.Item
              onPress={() => {
                setEditType('certification');
                setSelectedItem(certification);
                handleDelete();
                closeMenu();
              }}
              title="Supprimer"
              titleStyle={{ color: 'red' }}
            />
          </Menu>
        </View>
      </View>
    </View>
  </View>
  <View style={styles.separator} />
</View>

      ))
    ) : (
      <Text style={{ textAlign: 'center' }}>Aucune certification disponible</Text>
    )}

{isCertificationFormVisible && (
<CertificationFormModal
      onClose={() => {
        setCertificationFormVisible(false);
      }}
      isEditMode={editType === 'certification'}
      item={selectedItem || {
        title: '',
        institution: '',
        date: '',
        description: '',
        images: certificationImages,
      }}
      showCalendar={showCalendar}
      onChange={(updatedItem) => {
        setSelectedItem(updatedItem);
      }}
      onAddImage={editType === 'certification' ? pickEditImage : pickCertificationImage}
      onSubmit={editType === 'certification' ? updateCertification : handleAddCertification}
      onToggleCalendar={() => setShowCalendar(!showCalendar)}
      onDateSelect={(date: string) => {
        setSelectedItem((prev: any) => ({ ...prev, date }));
        setShowCalendar(false);
      }}
    />)}

<TouchableOpacity
      style={styles.addButton}
      onPress={() => setCertificationFormVisible(true)}
    >
      <Text style={styles.addButtonText}>
        Ajouter une certification
      </Text>
    </TouchableOpacity>
    
    
      </View>
      )}
      <View style={styles.publishContainer}>
        {/*<TouchableOpacity
            style={[
            styles.publishButton,
            prestation?.published ? styles.unpublishButton : styles.publishButton,
            ]}
            onPress={confirmTogglePrestationPublished}
        >
            <Text style={styles.publishButtonText}>
            {prestation?.published ? "Retirer" : "Publier"}
            </Text>
        </TouchableOpacity>*/}
        </View>
      
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackground} onPress={closeImageModal}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCalendar}
        onRequestClose={toggleCalendar}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Petite croix pour fermer le modal */}
            <TouchableOpacity onPress={toggleCalendar} style={styles.closeIcon}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Choisissez une date</Text>
            <Calendar
              onDayPress={handleDateSelect}
              
              markedDates={getMarkedDates()}
              style={styles.calendar}
            />

            {/* Bouton Horaires */}
           
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
    
    paddingVertical: 20,
  } as ViewStyle,
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily:"../assets/fonts/BebasNeue_Regular.ttf",
  },

  descriptionInput: {
    height : 100,
    width : '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 14,
    marginBottom: 10,
    justifyContent : 'flex-start',
    alignItems : 'flex-start',
    textAlignVertical: 'top', // 👈 Ceci colle le texte en haut
    
  },

  modifyButton: {
    alignSelf: 'center',
    backgroundColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  modifyButtonText: {
    color: '#000',
    fontSize: 16,
  },
  
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#808080',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    //justifyContent: 'space-around',
    marginVertical: 20,
  },
  categoryButton: {
    padding: 15,
    borderRadius: 30,
    margin : 5,
    backgroundColor: '#00cc66',
  },
  activeCategoryButton: {
    backgroundColor: '#7ed957',
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  photo: {
    width: '33.33%',
    height : 1,
    aspectRatio: 1,
  },
  addPhotoButton: {
    width: '33.33%',
    height : 1,
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  experienceCard: {
    backgroundColor: '#EEEEEE',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    margin : 10
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  experienceTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#000',
  flexShrink: 1,
  flex: 1, // pour occuper l'espace restant
  marginRight: 8, // petit espace avant la date
},
  experienceDate: {
    fontSize: 14,
    color: '#666',
  },
  experienceDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  experienceImages: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  experienceImage: {
    width: 80,
    height: 80,
    
    marginRight: 10,
  },
  experienceForm: {
    marginTop: 20,
    padding : 10,
    borderRadius : 10,
    backgroundColor: '#F0F0F0'
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
  },

  descriptionInput2: {
    
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
  },

  submitButton: {
    backgroundColor: '#00cc66',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  descriptionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },

  widthMax : {
    paddingHorizontal : 20
  },

  remunerationContainer: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  remunerationSet: {
    backgroundColor: '#FFD700', // Couleur pour la rémunération définie
  },
  remunerationAdd: {
    backgroundColor: '#FFCC00', // Couleur pour ajouter la rémunération
  },
  remunerationText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  availabilityContainer: {
    marginVertical: 10,
    
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButton: {
    alignSelf: 'stretch',
    backgroundColor: '#7ED957',
    paddingVertical: 15,
    marginHorizontal : 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 20,
  },
  inputWithCurrency: {
    position: 'relative',
    backgroundColor: '#ccc',
    borderRadius: 10,
    width: '80%',
    alignSelf: 'center',
  },
  
  inputModal: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',     
    paddingVertical: 10,
    paddingRight: 50,         
    paddingLeft: 15,
  },
  
  currency: {
    position: 'absolute',         
    right: 15,
    top: '50%',
    transform: [{ translateY: -15 }],
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  
  
  saveButton: {
    backgroundColor: '#006400',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  certificationCard: {
    backgroundColor: '#D5D5D5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    margin : 15
  },
  
  certificationInstitution: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  
  certificationDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  certificationImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  certificationForm: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    margin : 15
  },
  cancelButton: {
    backgroundColor: '#FF6666',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer2: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalOption: {
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: '#fff',
    textAlign: 'center',
  },

  tarifPopupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarifPopupContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  tarifPopupSectionContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  tarifPopupSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tarifPopupInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    color: '#888', // Text color to simulate placeholder text
  },
  tarifPopupDescriptionInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  tarifPopupTarifContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tarifPopupTarifInput: {
    flex: 1,
  },
  tarifPopupButton: {
    backgroundColor: '#FFD700',
    borderRadius: 5,
    padding: 10,
    marginLeft: 10,
  },
  tarifPopupSaveButton: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  tarifPopupSaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tarifPopupAddButton: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  tarifPopupAddButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tarifPopupCloseButton: {
    backgroundColor: '#dc3545',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  tarifPopupCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  fullScreenImage: {
    width: '90%', // Adapte l'image à l'écran
    height: '90%',
    resizeMode: 'contain',
  },

  publishContainer: {
    width : '100%',
    alignItems : 'center', 
    marginVertical : 20,
    marginBottom : 40,
    height : 50 
  },
  publishButton: {
    backgroundColor: '#00cc66',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: 300,
  },
  publishButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight : 'bold'
  },

  unpublishButton: {
    backgroundColor: '#cc0000', // Rouge
  },

  calendar: {
    marginBottom: 10,
  },

  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  horairesButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#00cc66', // Couleur du bouton Horaires
    width: '100%',
    alignItems: 'center',
  },
  horairesButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  timePickerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  descriptionRow: { 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderTopWidth: 1, 
    borderBottomColor: '#E0E0E0',
    borderTopColor: '#E0E0E0'  ,

  },

  infoLabel: {
    fontFamily: "../assets/fonts/JosefinSans-Regular.ttf",
    fontWeight: 'bold', 
    fontSize: 16,
    alignSelf : 'flex-start'
  },

  infoValue: { 
    fontSize: 16, 
    color: '#000' 
  },
  
  availabilitySection: {
    marginVertical: 10,
    
  },
  
  availabilityTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  
  availabilityButton: {
    backgroundColor: '#7ed957', // Vert clair
    borderRadius: 5,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  tarifSection: {
    //marginVertical: 20,
    
  },
  
  tarifTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  
  tarifButton: {
    backgroundColor: '#f7b500', // Jaune
    borderWidth: 2,
    borderColor: 'purple', // Contour violet
    borderRadius: 10,
    
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  tarifDisplay: {
    backgroundColor: '#f7b500',
    
    borderRadius: 5,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  tarifText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },

  inputLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  
  certificationImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  certificationCardUpdated: {
  padding: 15,
  marginBottom: 10,
},


certificationTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#000',
  flexShrink: 1,
},
certificationDate: {
  fontSize: 12,
  color: '#555',
},

certificationDateRight: {
  fontSize: 12,
  color: '#555',
},

certificationImagesRow: {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: 10,
  marginBottom: 10,
},

certificationMiniImage: {
  width: 80,
  height: 60,
  borderRadius: 6,
  marginRight: 8,
},

separator: {
  height: 1,
  backgroundColor: '#ccc',
  marginTop: 10,
},

experienceMenuContainer: {
  position: 'absolute',
  bottom: 10,
  right: 10,
},

menuContent: {
  borderRadius: 12,
},

menuIconButton: {
  margin: 0, // pour réduire l'espace autour de l'icône
  padding: 0,
},

certificationHeader: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 5,
},

certificationImagesColumn: {
  flexShrink: 0,
  //width: 120, // Largeur fixe à gauche pour images
  marginRight: 10,
},

certificationBigImage: {
  width: '100%',
  aspectRatio: 16 / 9,
  marginBottom: 5,
},

certificationSmallImagesRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

certificationSmallImage: {
  width: '48%',
  aspectRatio: 16 / 9,
  
},

certificationTextContent: {
  flex: 1,
  justifyContent: 'flex-start',
},

certificationTextWithMenu: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 10,
},

certificationMenuContainer: {
  alignSelf: 'flex-start',
},

sectionContainer: {
  marginBottom: 20,
},

sectionTitle: {
  fontWeight: 'bold',
  fontSize: 16,
  marginBottom: 5,
},

toggleContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

toggleButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
  backgroundColor: '#e0e0e0',
  marginHorizontal: 4,
},

toggleButtonActive: {
  backgroundColor: '#7ed957',
},

toggleButtonActiveGray: {
  backgroundColor: '#e0e0e0',
},

toggleText: {
  fontWeight: 'bold',
  color: '#000',
},

toggleTextActive: {
  color: '#fff',
},

toggleTextGrayActive: {
  color: '#000',
},

documentItem: {
  fontSize: 14,
  color: '#d63031',
  marginVertical: 2,
},


});

export default PrestationScreen;

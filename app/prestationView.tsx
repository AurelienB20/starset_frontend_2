import DateTimeSelectionModal from '@/components/DateTimeSelectionModal'; // ajuste le chemin si besoin
import SignupPromptModal from '@/components/SignupPromptModal';
import { useCart, useCurrentWorkerPrestation, useUser } from '@/context/userContext';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { JosefinSans_100Thin, JosefinSans_700Bold } from '@expo-google-fonts/josefin-sans';
import { Lexend_400Regular, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Font from 'expo-font';
import { useFonts } from 'expo-font';
import moment, { MomentInput } from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assurez-vous d'avoir installé cette bibliothèque
import config from '../config.json';

const PrestationViewScreen = () => {
  const [selectedTab, setSelectedTab] = useState('photos'); // Onglet par défaut: 'photos'
  const navigation = useNavigation()
  const route = useRoute() as any;
  const prestation_id = route.params?.id;
  const prestationRef = useRef(null);
  const [account, setAccount] = useState<any>(null);
  const [metiers, setMetiers] = useState<any>([]);
  const [prestation, setPrestation] = useState<any>({});
  const [prestationImages, setPrestationImages] = useState<any>([]);
  const [comments , setComments] = useState<any>([])
  const [experiences, setExperiences] = useState([])
  const [certifications, setCertifications] = useState([])
  const [isDatePickerVisible, setDatePickerVisible] = useState(false); // State for the date picker modal
  const [selectedDate, setSelectedDate] = useState('');
  const [isCalendarVisible, setCalendarVisible] = useState(false); // State for the calendar modal
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [isArrivalTimePickerVisible, setArrivalTimePickerVisible] = useState(false);
  const [isDepartureTimePickerVisible, setDepartureTimePickerVisible] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false); // Contrôle de la visibilité du modal
  const [selectedImage, setSelectedImage] = useState<any>(null); // Image sélectionnée
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false); // Pour le pop-up
  const [likedImages, setLikedImages] = useState<string[]>([]);
  
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')); // Array from "00" to "23"
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')); // Array from "00" to "59"

  const [arrivalHour, setArrivalHour] = useState('');
  const [arrivalMinute, setArrivalMinute] = useState('');
  const [departureHour, setDepartureHour] = useState('');
  const [departureMinute, setDepartureMinute] = useState('');
  const [selectedMetier, setSelectedMetier] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [modalType, setModalType] = useState<string | null>('date'); // 'date', 'arrival', 'departure'
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const { addToCart } = useCart();
  const { user, setUser} = useUser()
  const { currentWorkerPrestation, setCurrentWorkerPrestation} = useCurrentWorkerPrestation()
  const [isProfileInfoVisible, setProfileInfoVisible] = useState(false);
  const [availabilityByDate, setAvailabilityByDate] = useState<any>({});
  const [selectedDates, setSelectedDates] = useState<any>({});
  const [signupPromptModalVisible, setSignupPromptModalVisible] = useState(false);


    const profileImageSize = scrollY.interpolate({
      inputRange: [0, 70],
      outputRange: [120, 80],
      extrapolate: 'clamp',
    });

    const [fontsLoaded] = useFonts({
      BebasNeue_400Regular,
      Lexend_400Regular,
      Lexend_700Bold,
      JosefinSans_700Bold,
      JosefinSans_100Thin,
    });



  const handleHourChange = (text : any, setHour : any) => {
    const value = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 23)) {
      setHour(value);
    }
  };

  // Function to validate minute input
  const handleMinuteChange = (text : any, setMinute : any) => {
    const value = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 59)) {
      setMinute(value);
    }
  };

  const handleDepartureHourChange = (text : any, setHour : any) => {
    const value = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 23)) {
      setHour(value);
    }
  };

  // Function to validate minute input
  const handleDepartureMinuteChange = (text : any, setMinute : any) => {
    const value = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 59)) {
      setMinute(value);
    }
  };

  const confirmReport = () => {
    Alert.alert(
      "Confirmer le signalement",
      "Êtes-vous sûr de vouloir signaler cette personne ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Oui", onPress: () => sendReport() }
      ],
      { cancelable: false }
    );
    setMenuVisible(false);
  };

  const sendReport = async () => {
    try {
      const reporter_id = await getAccountId(); // L'utilisateur qui signale
      const reported_id = prestation.worker_id;
      const reported_name = account?.firstname + ' ' + account?.lastname;
      const prestation_title = prestation?.title || prestation?.metier;
      const prestation_description = prestation?.description || '';

      const response = await fetch(`${config.backendUrl}/api/auth/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter_id,
          reported_id,
          reported_name,
          prestation_id,
          prestation_title,
          prestation_description,
          type: 'worker',
          reason: 'Comportement inapproprié', // Tu peux remplacer ou laisser l'utilisateur choisir
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        Alert.alert('Merci', 'Le signalement a bien été envoyé.');
      } else {
        Alert.alert('Erreur', 'Le signalement n’a pas pu être envoyé.');
      }
    } catch (error) {
      console.error('Erreur lors de l’envoi du signalement:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  const toggleDatePicker = () => {
    setDatePickerVisible(!isDatePickerVisible); // Toggle the visibility of the date picker
  };

  const toggleLikeImage = async (image: any) => {
    const user_id = await getAccountId();
  
    const isLiked = likedImages.includes(image);
  
    const endpoint = isLiked
      ? `${config.backendUrl}/api/uploads/unlike-image`
      : `${config.backendUrl}/api/uploads/like-image`;
  
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, image_adress: image.adress }),
      });
  
      if (!response.ok) {
        throw new Error('Erreur lors de la requête');
      }
  
      setLikedImages((prev) =>
        isLiked ? prev.filter((id) => id !== image.id) : [...prev, image.id]
      );
    } catch (error) {
      console.error('Erreur lors du like/unlike:', error);
    }
  };
  

  const goToChoosePrestation = async () => {
    
    navigation.navigate({
      name: 'choosePrestation',
      params: { prestation_id },
    } as never);
  };

  const toggleArrivalTimePicker = () => {
    //setCalendarVisible(false)
    //setArrivalTimePickerVisible(!isArrivalTimePickerVisible);
    
    openModal('arrival'); // Ouvre le modal pour l'heure d'arrivée
  }

  const toggleDepartureTimePicker = () => {
    //setArrivalTimePickerVisible(false)
    //setDepartureTimePickerVisible(!isDepartureTimePickerVisible);
    openModal('departure'); // Ouvre le modal pour l'heure d'arrivée
  }

  const toggleTimePicker = () => {
    setTimePickerVisible(!isTimePickerVisible);
  };

  const toggleCalendar = () => {
    setCalendarVisible(!isCalendarVisible); // Toggle the visibility of the calendar
  };

  const handleDateSelectAncien = (day : any) => {
    const selectedDate = day.dateString;
    if (!startDate) {
      setStartDate(selectedDate); // Si aucune date de début n'est définie, définissez-la
      //console.log("Date de début sélectionnée:", selectedDate);
    } else if (!endDate) {
      setEndDate(selectedDate); // Si aucune date de fin n'est définie, définissez-la
      //console.log("Date de fin sélectionnée:", selectedDate);
      //console.log("Plage de dates sélectionnée:", startDate, "à", selectedDate); // Affiche la plage de dates
      
    } else {
      // Réinitialisez les dates si les deux ont déjà été sélectionnées
      
      setStartDate(selectedDate); // Redémarrez avec la nouvelle date de début
      setEndDate(''); // Réinitialisez la date de fin
    }
  };

  const handleDateSelect = (day : any) => {
    const date = day.dateString;

    if (!availabilityByDate[date]) return;
    setSelectedDates((prev: any) => ({
      ...prev,
      [date]: !prev[date], // toggle selection
    }));
  };

  const getPrestation = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-prestation`, {
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
      if(data)
      {
        // Stocker les prestations dans l'état
        setPrestation(data.prestation);
        setCurrentWorkerPrestation(data.prestation);
        setProfilePictureUrl(data.account.profile_picture_url);
        setMetiers(data.metiers);
        setAccount(data.account);
        setPrestationImages(data.images);
        setComments(data.comments);
        fetchAvailability(data.account.worker)
      }
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des prestations:', error);
    }
  };

  const checkConversation = async () => {
    try {
      const person1_id = await getAccountId();
      const person2_id = await prestation.worker_id;
      const person1_type = 'user';
      const person2_type = 'worker';
      const response = await fetch(`${config.backendUrl}/api/conversation/check-conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1_id, person2_id, person1_type, person2_type }),
      });
      const data = await response.json();

      if (data.exists) {
        // Si la conversation existe, on va directement au chat

        goToChat(data.conversation_id);
      } else {
        // Sinon, on affiche le pop-up de confirmation
        setConfirmModalVisible(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la conversation:', error);
    }
  };

  const openModal = (type: string) => {
    setModalType(type);
    setCalendarVisible(true); // Ouvre le modal
  };

  const createConversation = async () => {
    try {
      const person1_id = await getAccountId();
      const person2_id = prestation.worker_id;
      const person1_type = 'user';
      const person2_type = 'worker';

      const response = await fetch(`${config.backendUrl}/api/conversation/create-conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1_id, person2_id, person1_type, person2_type }),
      });

      const data = await response.json();
      setConfirmModalVisible(false); // Fermer le modal
      if(data) goToChat(data.conversation.id); // Aller au chat avec la nouvelle conversation
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
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

  const goToChat = async (conversation_id : any) => {
    const account_id = await getAccountId()
    navigation.navigate({
      name: 'chat',
      params: {conversation_id : conversation_id , sender_id : account_id , sender_type : 'user', contact_profile_picture_url : profilePictureUrl},
    } as never);
  }

  const goToOtherPrestation = async (prestation_id : any, metier : any) => {
    setSelectedTag(metier)
    navigation.navigate({
      name: 'prestationView',
      params: {id : prestation_id},
    } as never);
  }

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

      // Stocker les prestations dans l'état
      if(data) setCertifications(data.certifications);
      
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des certifications:', error);
    }
  };

  const getAllExperience = async () => {
    try {
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

      // Stocker les prestations dans l'état
      if(data) setExperiences(data.experiences);
      
    } catch (error) {
      console.error('Une erreur est survenue lors de la récupération des experiences:', error);
    }
  };

  const fetchAvailability = async (worker_id : any) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-worker-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id :  worker_id }), // Remplace dynamiquement
      });
      const data = await response.json();
      const currentDate = new Date();

      if (data.success && data.schedule) {
        const map: any = {};
        const today = moment().startOf('day');
      
        data.schedule.forEach((item: { date: MomentInput; start_time: any; end_time: any }) => {
          const dateMoment = moment(item.date);
          if (dateMoment.isBefore(today, 'day')) return; // 🔒 Ignore les dates passées
      
          const date = dateMoment.format('YYYY-MM-DD');
          if (!map[date]) map[date] = [];
          map[date].push(`${item.start_time} - ${item.end_time}`);
        });
      
        setAvailabilityByDate(map);
      }
    } catch (err) {
      console.error('Erreur de chargement des disponibilités:', err);
    }
  };


  const getUnavailableDates = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/planned-prestation/get-worker-unavailable-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: prestation.worker_id }),
      });
  
      const data = await response.json();
      if (data.success) {
        setUnavailableDates(data.unavailableDates);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des dates indisponibles:', error);
    }
  };

  const getMarkedDates = () => {
    const marked : any = {};
    const allDates : any = Object.keys(availabilityByDate);

    // Grise tous les jours sans dispo + ajoute couleur aux dispo
    for (let i = 0; i < 31; i++) {
      const date = moment().startOf('month').add(i, 'days').format('YYYY-MM-DD');
      if (availabilityByDate[date]) {
        marked[date] = {
          marked: true,
          selected: selectedDates[date],
          customStyles: {
            container: {
              backgroundColor: selectedDates[date] ? '#4CAF50' : '#C6F6D5',
            },
            text: {
              color: '#000',
              fontWeight: 'bold',
            },
          },
        };
      } else {
        marked[date] = {
          disabled: true,
          disableTouchEvent: true,
          customStyles: {
            container: {
              backgroundColor: '#e0e0e0',
            },
            text: {
              color: '#999',
            },
          },
        };
      }
    }

    return marked;
  };
  

  const openImageModal = (image : any) => {
    setSelectedImage(image);
    setImageModalVisible(true);
  };

  const openImageModalFromUri = (imageUri : string) => {
    const image = {adress: imageUri};
    setSelectedImage(image);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setImageModalVisible(false);
  };

  const getLikedImages = async () => {
    const user_id = await getAccountId();

    try {
      const response = await fetch(`${config.backendUrl}/api/uploads/get-liked-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      });

      const data = await response.json();
      if (data.success) {
        setLikedImages(data.likedImages); // Un tableau d'IDs ou d'adresses d'images
      }
    } catch (error) {
      console.error('Erreur lors du chargement des likes:', error);
    }
  };

  const likeImage = async (imageId: string) => {
  const user_id = await getAccountId();

  try {
    await fetch(`${config.backendUrl}/api/upload/like-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, image_id: imageId }),
    });
    setLikedImages((prev) => [...prev, imageId]);
  } catch (error) {
    console.error('Erreur lors du like:', error);
  }
};

const unlikeImage = async (imageId: string) => {
  const user_id = await getAccountId();

  try {
    await fetch(`${config.backendUrl}/api/upload/unlike-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, image_id: imageId }),
    });
    setLikedImages((prev) => prev.filter((id) => id !== imageId));
  } catch (error) {
    console.error('Erreur lors du unlike:', error);
  }
};

  useEffect(() => {
    
    getPrestation();
    getAllExperience();
    getAllCertification()
    getUnavailableDates();
    
    getLikedImages()
    async function loadFonts() {
      await Font.loadAsync({
        'Glacial-Regular': require('../assets/fonts/GlacialIndifference-Regular.otf'),
        'Glacial-Bold': require('../assets/fonts/GlacialIndifference-Bold.otf'),
      });
    }
    loadFonts();
    
  }, []);

  useEffect(() => {
    // Ajoutez ici la logique pour recharger les données avec l'ID
    getPrestation()
    getAllExperience()
    getAllCertification()
    getLikedImages()
    
  }, [route.params.id]);

  useEffect(() => {
    prestationRef.current = prestation;  // Met à jour la référence à chaque changement de prestation
  }, [prestation]);

  useEffect(() => {
    if (
      modalType === 'arrival' &&
      arrivalHour.length === 2 &&
      arrivalMinute.length === 2
    ) {
      const hour = parseInt(arrivalHour, 10);
      const minute = parseInt(arrivalMinute, 10);
      if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        setTimeout(() => {
          setModalType('departure');
        }, 300); // Petite pause pour laisser le champ se remplir visuellement
      }
    }
  }, [arrivalHour, arrivalMinute]);

  const handleAddToCart = () => {
     // Si aucune date de début n'est sélectionnée, afficher une alerte
    if (!startDate) {
      Alert.alert("Erreur", "Merci de sélectionner une date de début.");
      return;
    }

    // Si aucune date de fin, on utilise la date de début
    const end = endDate ? new Date(endDate) : new Date(startDate);
    const endDateUsed = endDate || startDate; // pour afficher ou enregistrer dans le panier

    // Vérification des heures
    if (arrivalHour.length !== 2 || arrivalMinute.length !== 2 || departureHour.length !== 2 || departureMinute.length !== 2) {
      Alert.alert("Erreur", "Merci de remplir toutes les informations de date et horaire.");
      return;
    }

    const arrivalTime = new Date();
    arrivalTime.setHours(parseInt(arrivalHour, 10), parseInt(arrivalMinute, 10), 0);

    const departureTime = new Date();
    departureTime.setHours(parseInt(departureHour, 10), parseInt(departureMinute, 10), 0);

    const start = new Date(startDate);

    const daysWorked = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const hoursWorked = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60 * 60);
    const totalRemuneration = prestation.remuneration * hoursWorked * daysWorked;

    const cartItem = {
      prestation,
      startDate,
      endDate: endDateUsed,
      arrivalTime,
      departureTime,
      totalRemuneration,
      daysWorked,
      hoursWorked,
      profilePictureUrl,
      type_of_remuneration : 'hour',
      location : user?.location
    };

    addToCart(cartItem);

    Alert.alert("Succès", "La prestation a été ajoutée au panier.");

    setStartDate('');
    setEndDate('');
    setArrivalHour('');
    setArrivalMinute('');
    setDepartureHour('');
    setDepartureMinute('');
    setCalendarVisible(false);
    setModalType('date')
  };

  /*const goToSummary = () => {
    const arrivalTime = new Date();
    arrivalTime.setHours(parseInt(arrivalHour, 10), parseInt(arrivalMinute, 10),  0);
    const departureTime = new Date();

    departureTime.setHours(parseInt(departureHour, 10), parseInt(departureMinute, 10),  0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysWorked = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1; // inclure le dernier jour

    toggleCalendar()
    setCalendarVisible(false); // Toggle the visibility of the calendar

    const hoursWorked = (departureTime.getTime() - arrivalTime.getTime()) / (1000 * 60 * 60); // conversion ms → heures

    const totalRemuneration = prestation.remuneration * hoursWorked * daysWorked;
    console.log('Total Rémunération:', totalRemuneration);

    navigation.navigate({
      name: 'summary',
      params: {startDate : startDate, endDate: endDate, arrivalTime : arrivalTime, departureTime : departureTime, prestation : prestation, profilePictureUrl : profilePictureUrl, totalRemuneration: totalRemuneration, },
    } as never);
  }*/

    const goToSummary = () => {
      navigation.navigate({
        name: 'summary',
        
      } as never);
    }


  return (
    <View>
      <Animated.View style={[styles.profileContainer]}>
        {account && (
            <View style={styles.peopleIconContainer}>
              <Image
                source={
                  account.is_company
                    ? require('../assets/images/company.png')
                    : require('../assets/images/people.png')
                }
                style={styles.peopleIcon}
              />
            </View>
          )}      
        
        <TouchableOpacity onPress={() => setProfileInfoVisible(true)}>
          <Animated.Image
            source={{ uri: profilePictureUrl }}
            style={[styles.profilePicture, { width: profileImageSize, height: profileImageSize }]}
          />
        </TouchableOpacity>
      </Animated.View>
      
    <Animated.ScrollView
            style={styles.container}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >

      <View style={styles.header}>
        <Text style={styles.profileName}>{account?.firstname}</Text>
      </View>
      
      

      <View style={styles.tagsContainer}>
      
    <Text style={styles.profileDescription}>
      {account?.description || "Aucune description disponible"}
    </Text>
      <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tagsScrollContainer}
    >
      {metiers.map((item : any, index: any) => (
        <TouchableOpacity
          key={index}
          style={[styles.tag, selectedTag === item.metier && styles.selectedTag]}
          onPress={() => goToOtherPrestation(item.id, item.metier)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.picture_url && (
              <Image
                source={{ uri: item.picture_url }}
                style={{ width: 16, height: 16, marginRight: 6, borderRadius: 8 }}
              />
            )}
            <Text style={[styles.tagText, selectedTag === item.metier && styles.selectedTagText]}>
              {item.metier.includes(' ') ? `${item.metier.split(' ')[0]}...` : item.metier}
            </Text>
          </View>
      </TouchableOpacity>
      ))}
    </ScrollView>
      </View>

      {/* Section des statistiques */}
      <View style={styles.descriptionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          
          <Text style={styles.metierName}>{prestation.metier} {prestation.picture_url && (
            <Image
              source={{ uri: prestation.picture_url }}
              style={{ width: 30, height: 30, marginRight: 8 }}
            />
          )}</Text>
          
        </View>
        <Text style={styles.descriptionContainerText}>
        {prestation.description || "Aucune description disponible"}
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{prestation.completedPrestation || 0}</Text>
            <Text style={styles.statLabel}>Prestations effectuées</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>15</Text>
            <MaterialIcons name="favorite" size={20} color="red" />
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>“Passionée”</Text>
            <Text style={styles.statLabel}>Caractère</Text>
          </View>
        </View>
      </View>

      {/* Onglets pour Photos, Expériences, Certifications */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'photos' && styles.activeTabButton]}
          onPress={() => setSelectedTab('photos')}
        >
          <Text style={styles.tabButtonText}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'experiences' && styles.activeTabButton]}
          onPress={() => setSelectedTab('experiences')}
        >
          <Text style={styles.tabButtonText}>Expériences</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'certifications' && styles.activeTabButton]}
          onPress={() => setSelectedTab('certifications')}
        >
          <Text style={styles.tabButtonText}>Certifications</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu des onglets */}
      {selectedTab === 'photos' && (
        <View style={styles.photosContainer}>
          {prestationImages.map((photo : any, index : any) => (
            <TouchableOpacity key={index} onPress={() => openImageModal(photo)} style={styles.photoButton}>
              <Image source={{ uri: photo.adress }} style={styles.photo} />
            </TouchableOpacity>
          ))}
          
        </View>
        
      )}

      {selectedTab === 'experiences' && (
        <View style={styles.experienceContainer}>
          {experiences.length === 0 ? (
            <Text>Aucune expérience disponible.</Text>
          ) : (
            experiences.map((experience : any, index) => (
              <View style={styles.experienceCard}>
            <View style={styles.experienceHeader}>
              <Text style={styles.experienceTitle}>{experience.title} <FontAwesome name="smile-o" size={20} /></Text>
              <Text style={styles.experienceDate}>{experience.date}</Text>
            </View>
            <Text style={styles.experienceDescription}>{experience.description}</Text>
            <View style={styles.experienceImages}>
              {experience.images?.map((imageUri: string, idx: number) => (
                <TouchableOpacity key={idx} onPress={() => openImageModalFromUri(imageUri)} style={styles.photoButton}>
                <Image key={idx} source={{ uri: imageUri }} style={styles.experienceImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
            ))
          )}
        </View>
      )}

      {selectedTab === 'certifications' && (
        <View>
          {certifications.length > 0 ? (
            certifications.map((certification: any, index: number) => (
              <View key={index} style={styles.certificationCardUpdated}>
                <View style={styles.certificationHeader}>
                  <View
                    style={[
                      styles.certificationImagesColumn,
                      {
                        width: certification.images?.length ? 80 : 0,
                        marginRight: certification.images?.length ? 10 : 0,
                      },
                    ]}
                  >
                    {certification.images?.length === 3 ? (
                      <>
                        <Image
                          source={{ uri: certification.images[0] }}
                          style={styles.certificationBigImage}
                        />
                        <View style={styles.certificationSmallImagesRow}>
                          <Image
                            source={{ uri: certification.images[1] }}
                            style={styles.certificationSmallImage}
                          />
                          <Image
                            source={{ uri: certification.images[2] }}
                            style={styles.certificationSmallImage}
                          />
                        </View>
                      </>
                    ) : (
                      certification.images?.map((uri: string, i: number) => (
                        <TouchableOpacity key={i} onPress={() => openImageModalFromUri(uri)} style={styles.photoButton}>
                        <Image
                          key={i}
                          source={{ uri }}
                          style={styles.certificationMiniImage}
                        />
                        </TouchableOpacity>
                      ))
                    )}
                  </View>

                  <View style={styles.certificationTextContent}>
                    <Text style={styles.certificationTitle}>{certification.title}</Text>
                    <Text style={styles.certificationDate}>{certification.date}</Text>
                    <Text style={styles.certificationInstitution}>
                      <Text style={{ fontStyle: 'italic' }}>{certification.institution}</Text>
                    </Text>
                    <Text style={styles.certificationDescription}>{certification.description}</Text>
                  </View>
                </View>
                <View style={styles.separator} />
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center' }}>Aucune certification disponible</Text>
          )}

      </View>
      )}

      {/* Avis */}
      <View style={styles.reviewsContainer}>
        <Text style={styles.avisHeader}>Avis ({comments.length})</Text>

        <FlatList
          data={comments}
          keyExtractor={(item : any) => item.comment}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reviewsList}
          renderItem={({ item } : any) => (
            <View style={styles.reviewCard}>
              <Text style={styles.reviewName}>{item.firstname} {item.lastname}</Text>
              <Text style={styles.reviewText}>{item.comment}</Text>
            </View>
          )}
        />
      </View>

      {/* Tarification */}
      

      {!prestation?.type_of_remuneration?.toLowerCase().includes('heure') &&
 !prestation?.type_of_remuneration?.toLowerCase().includes('hourly') ? (
        <View style={styles.seeMoreContainer}>
          <TouchableOpacity style={styles.seeMoreButton} onPress={goToChoosePrestation}>
            <Text style={styles.seeMoreText}>Voir les autres prestations</Text>
            <Icon name="arrow-forward" size={20} color="white" style={{ marginLeft: 10 }} />
          </TouchableOpacity>

          <View style={styles.seeMoreDiagonal} />
          <View style={styles.seeMoreDiagonal2} />
        </View>
      ) : (
        <View style={styles.pricingContainer}>
  <Text style={styles.pricingText}>
    {prestation.remuneration ? `${prestation.remuneration}€/heure` : "Tarif non défini"}
  </Text>

  <TouchableOpacity
    style={styles.calendarButton}
    onPress={() => {
      if (!user || Object.keys(user).length === 0) {
        setSignupPromptModalVisible(true);
      } else {
        toggleCalendar();
      }
    }}
  >
    <Text style={styles.calendarButtonText}>Voir le calendrier</Text>
  </TouchableOpacity>

  <View style={styles.diagonal} />
  <View style={styles.diagonal2} />
</View>
      )}

      {/* Date Picker Modal */}
      

      
            {/* Custom Time Input Modal */}
        {/* Arrival Time Input Modal */}
      

      <Modal
        visible={isImageModalVisible}
        transparent={true}
        onRequestClose={closeImageModal}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeImageModal}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBackground}>
            {selectedImage && (
              <>
                <Image source={{ uri: selectedImage?.adress }} style={styles.fullScreenImage} />
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={(e) => {
                    e.stopPropagation(); // Empêche la propagation vers l'overlay
                    toggleLikeImage(selectedImage); // Appelle la fonction dédiée
                  }}
                  style={styles.modalLikeButton}
                >
                  <Icon
                    name={Array.isArray(likedImages) && likedImages.includes(selectedImage?.id) ? 'favorite' : 'favorite-border'}
                    size={32}
                    color={Array.isArray(likedImages) && likedImages.includes(selectedImage?.id) ? 'red' : 'white'}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={isConfirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.conversationModalContainer}>
          <View style={styles.conversationModalContent}>
            <Text style={styles.conversationModalText}>
              Voulez-vous envoyer un message à {account?.firstname} ?
            </Text>

            <View style={styles.conversationModalButtonContainer}>
              <TouchableOpacity style={styles.conversationModalButton} onPress={createConversation}>
                <Text style={styles.conversationModalCancelButtonText}>Oui</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.conversationModalCancelButton} onPress={() => setConfirmModalVisible(false)}>
                <Text style={styles.conversationModalCancelButtonText}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DateTimeSelectionModal
  visible={isCalendarVisible}
  onClose={toggleCalendar}
  modalType={modalType}
  setModalType={setModalType}
  
  availabilityByDate={availabilityByDate}
  onDateSelect={handleDateSelect}
  arrivalHour={arrivalHour}
  arrivalMinute={arrivalMinute}
  setStartDate={setStartDate}
  setEndDate={setEndDate}
  startDate={startDate}
  endDate={endDate}
  departureHour={departureHour}
  departureMinute={departureMinute}
  onArrivalHourChange={(text) => handleHourChange(text, setArrivalHour)}
  onArrivalMinuteChange={(text) => handleMinuteChange(text, setArrivalMinute)}
  onDepartureHourChange={(text) => handleDepartureHourChange(text, setDepartureHour)}
  onDepartureMinuteChange={(text) => handleDepartureMinuteChange(text, setDepartureMinute)}
  onConfirm={handleAddToCart}
/>

      <SignupPromptModal
        visible={signupPromptModalVisible}
        onClose={() => setSignupPromptModalVisible(false)}
      />


      <Modal
  visible={isProfileInfoVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setProfileInfoVisible(false)}
>
  <TouchableOpacity
    style={styles.overlay}
    activeOpacity={1}
    onPressOut={() => setProfileInfoVisible(false)}
  >
    <View style={styles.popupContainer}>
      <Text style={styles.popupTitle}>Informations</Text>
      <Text style={styles.popupText}><Text style={styles.bold}>Prénom :</Text> {account?.firstname}</Text>
      <Text style={styles.popupText}><Text style={styles.bold}>Pseudo :</Text> @{account?.pseudo || 'mariemmm'}</Text>
      <Text style={styles.popupText}><Text style={styles.bold}>Statut :</Text> Étudiante</Text>
      <Text style={styles.popupText}><Text style={styles.bold}>Nombre de métiers effectués :</Text>105</Text>
      <Text style={styles.popupText}>
        <Text style={styles.bold}>Métier favori :</Text>  Petsitting
      </Text>
    </View>
  </TouchableOpacity>
</Modal>
      
    </Animated.ScrollView>

    <View style={styles.headerBar}>
      {/* Flèche retour */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={30} color="black" />
      </TouchableOpacity>
            {/* Icônes à droite */}
      <View style={styles.headerIcons}>
      <TouchableOpacity
        onPress={() => {
          if (!user || Object.keys(user).length === 0) {
            setSignupPromptModalVisible(true);
          } else {
            checkConversation();
          }
        }}
        style={styles.iconButton}
      >
        <Icon name="mail" size={30} color="black" />
      </TouchableOpacity>
    
        <Menu
  visible={menuVisible}
  onDismiss={() => setMenuVisible(false)}
  anchor={
    <IconButton
      icon="dots-vertical"
      size={30}
      
      onPress={() => setMenuVisible(true)}
    />
  }
>
  <Menu.Item onPress={confirmReport} title="Signaler" />
</Menu>
      </View>
    </View>
    {/* Ajouter au panier */}
    
    <View style={styles.addButtonFixedContainer}>
        
    <TouchableOpacity
  style={[
    styles.addButton,
    (!user || Object.keys(user).length === 0) && { backgroundColor: '#ccc' } // Bouton grisé si user vide
  ]}
  onPress={goToSummary}
  disabled={!user || Object.keys(user).length === 0}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={styles.addButtonText}>Ajouter</Text>
    <Icon name="shopping-cart" size={24} color="white" style={{ marginLeft: 8 }} />
  </View>
</TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
    marginTop : 170
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileName: {
    fontSize: 24,
    color: '#000',
    marginTop: 10,
    textAlign : 'center',
    fontFamily : 'JosefinSans_700Bold'
  },

  metierName: {
    fontSize: 20,
    color: '#000',
    marginTop: 10,
    textAlign : 'center',
    fontFamily : 'JosefinSans_700Bold'
  },

  profileDescription: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'Glacial-Regular',
  },
  tagsContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  tagsScrollContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal : 15,
    paddingVertical: 12,
    //backgroundColor: '#f0f0f0', // Couleur par défaut pour les badges
  },

  selectedTag: {
    backgroundColor: 'gold', // Fond grisé
    borderColor: '#999', // Bordure visible
  },

  tagText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'JosefinSans_700Bold',
  },

  selectedTagText: {
    color: '#fff', // Texte plus foncé pour le badge sélectionné
    fontFamily: 'JosefinSans_700Bold',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },

  stat: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 15,
    color: '#000',
    fontFamily : 'Glacial-Regular'
  },
  statLabel: {
    fontSize: 11,
    width : '80%',
    color: '#000',
    textAlign : 'center',
    fontFamily : 'Glacial-Bold',
  },

  descriptionContainer: {
    //backgroundColor: '#f4f4f4',
    //margin : 20,
    textAlign : 'center',
    //marginHorizontal: 10,
    borderRadius: 5,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0', // Couleur claire pour la bordure
  },

  descriptionContainerText: {
    fontSize: 12,
    textAlign : 'center',
    fontFamily : 'Glacial-Regular'
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    marginLeft : 10
  },
  tabButton: {
    padding: 10,
    borderRadius: 20,
    margin : 5,
    marginHorizontal : 10,
    backgroundColor: '#00cc66',
  },
  activeTabButton: {
    backgroundColor: '#7ed957',
  },
  tabButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily : 'JosefinSans_700Bold',
    textAlign: 'center'
  },

  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems : 'center',
  },
  
  photo: {
    width: '98%',
    aspectRatio: 1,
    alignSelf : 'center'
  },

  photoButton: {
    width: '33.33%',
    aspectRatio: 1,
  },

  experienceContainer: {
    padding: 10,
  },
  experienceCard: {
    backgroundColor: '#EEEEEE',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    margin : 10
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
    marginBottom: 10,
  },
  experienceDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  experienceImages: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  experienceImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  certificationsContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsContainer: {
    marginBottom: 20,
  },
  review: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  
  reviewAuthor: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  pricingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 120,
    backgroundColor: '#00743C',
    height: 100,
    marginHorizontal: 10,
    paddingHorizontal: 30,
    position: 'relative',
    overflow: 'hidden',
    
  },
  diagonal: {
    position: 'absolute',
    right: -35,
    top: -35,
    width: 70,
    height: 70,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
  },
  diagonal2: {
    position: 'absolute',
    right: -35,
    bottom: -35,
    width: 70,
    height: 70,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  pricingText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
  },
  calendarButton: {
    color: 'white',
    padding: 10,
    borderRadius: 5,
  },
  calendarButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight : 'bold'
  },
  addButtoncontainer: {
    width: '100%',
    alignItems: 'center',
    
  },
  
  addButtonFixedContainer: {
    position: 'absolute', // Position fixe
    bottom: 0, // Positionné à 10px du bas de l'écran
    left: 0,
    right: 0,
    alignItems: 'center', // Centré horizontalement
    paddingVertical: 10, // Espacement autour du bouton
    zIndex: 1000, // Toujours au-dessus du contenu
  },

  addButton: {
    backgroundColor: '#00BF63',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
  },

  addButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontFamily : 'Glacial-Bold'
  },

  sectionHeader: {
    fontSize : 15,
    fontWeight: 'bold',
    color: '#000',
    marginVertical : 10,
    marginLeft : 5,
    padding : 8,
    backgroundColor : '#d9d9d9',
    borderRadius : 20,
    alignSelf: 'flex-start'
  },

  avisHeader: {
    fontSize : 15,
    
    color: '#000',
    marginVertical : 10,
    marginLeft : 5,
    padding : 8,
    backgroundColor : '#d9d9d9',
    borderRadius : 20,
    alignSelf: 'flex-start',
    fontFamily : 'JosefinSans_100Thin'
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  
  dateButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#00cc66', // Button color
  },
  
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  closeButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FF6666', // Close button color
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    textAlign: 'center',
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

  

  timePickerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  timePickerContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  timePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timePickerItem: {
    fontSize: 40,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  timePickerSeparator: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    width: '50%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  pickerContainer: {
    width: 50,
    height: 150, // Set a fixed height for scrolling
  },
  pickerItem: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 24,
  },
  selectedText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },

  datePicker: {
    width: 300,
    marginBottom: 20,
  },
  
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  
  picker: {
    width: 100,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  input: {
    width: 60,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
  },
  

  backIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fond semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
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

  conversationModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  conversationModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  
  conversationModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  conversationModalText: {
    fontSize: 30,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'BebasNeue_400Regular' ,
  },

  conversationModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical : 20
  },
  conversationModalButton: {
    backgroundColor: 'green',
    padding: 5,
    paddingHorizontal : 15,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  conversationModalButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'BebasNeue_400Regular' 
  },
  conversationModalCancelButton: {
    backgroundColor: 'red',
    padding: 5,
    paddingHorizontal : 15,
    borderRadius: 15,
    marginHorizontal: 10,
  },
  conversationModalCancelButtonText: {
    color: 'white',
    fontSize: 30,
    fontFamily: 'BebasNeue_400Regular' 
  },

  // HEADER
  headerBar: {
    position : 'absolute',
    top: 25, // Positionné à 10px du bas de l'écran
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
    textAlign: 'center', // Centrage du titre
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
  profileContainer: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },

  seeMoreContainer: {
    backgroundColor: '#FFD700',
    marginHorizontal: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 120,
    marginTop: 10,
    paddingRight : 60
  },
  
  seeMoreButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  seeMoreText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  
  seeMoreDiagonal: {
    position: 'absolute',
    right: -35,
    top: -35,
    width: 70,
    height: 70,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  
  seeMoreDiagonal2: {
    position: 'absolute',
    right: -35,
    bottom: -35,
    width: 70,
    height: 70,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },

  reviewsList: {
    paddingHorizontal: 10,
  },
  
  reviewCard: {
    backgroundColor: '#EEEEEE',
    borderRadius: 15,
    padding: 15,
    marginRight: 10,
    width: 250,
  },
  
  reviewName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Glacial-Bold', 
  },
  
  reviewText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Glacial-Regular',
  },

  modalLikeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 25,
    padding: 8,
    zIndex: 10,
  },

  certificationCardStyled: {
  paddingHorizontal: 15,
  marginBottom: 20,
},

certificationRow: {
  flexDirection: 'row',
  marginBottom: 8,
},

certificationImageStyled: {
  width: 80,
  height: 80,
  borderRadius: 8,
  marginRight: 12,
  resizeMode: 'cover',
},

certificationPlaceholderImage: {
  width: 80,
  height: 80,
  backgroundColor: '#ddd',
  borderRadius: 8,
  marginRight: 12,
},

certificationInfo: {
  flex: 1,
  justifyContent: 'space-between',
},

certificationTitleStyled: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#000',
},

certificationInstitutionStyled: {
  fontStyle: 'italic',
  color: '#444',
},

certificationDateStyled: {
  textAlign: 'right',
  color: '#888',
  fontSize: 12,
},

certificationDescriptionStyled: {
  fontSize: 14,
  color: '#333',
  marginTop: 5,
},

certificationSeparator: {
  marginTop: 10,
  height: 1,
  backgroundColor: '#e0e0e0',
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

certificationHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 5,
},

certificationTitle: {
  fontSize: 16,
  fontWeight: 'bold',
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

  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  certificationImagesColumn: {
    flexShrink: 0,
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
  
  certificationDate: {
    fontSize: 12,
    color: '#555',
  },

  peopleIconContainer: {
    position : 'absolute',
    left: 8,
    top : 8,
  },
  peopleIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  popupContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'flex-start',
    elevation: 5,
  },
  
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  
  popupText: {
    fontSize: 16,
    marginBottom: 8,
  },
  
  bold: {
    fontWeight: 'bold',
  }
  
  
});

export default PrestationViewScreen;
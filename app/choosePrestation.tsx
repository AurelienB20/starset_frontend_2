import { useCart, useUser } from '@/context/userContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import config from '../config.json';

const ChoosePrestationScreen = () => {
  const route = useRoute();
  const { prestation_id } = route.params as { prestation_id: number };
  const [customPrestations, setCustomPrestations] = useState([]);

  const { addToCart } = useCart();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrestation, setSelectedPrestation] = useState<any>(null);

  // Date and time inputs
  const [selectedDate, setSelectedDate] = useState('');
  const [arrivalHour, setArrivalHour] = useState('');
  const [arrivalMinute, setArrivalMinute] = useState('');

  // Modal step: 'date' or 'arrival'
  const [modalType, setModalType] = useState<'date' | 'arrival'>('date');
  const { user, setUser} = useUser()

  useEffect(() => {
    getCustomPrestations();
  }, []);

  const getCustomPrestations = async () => {
    try {
      const response = await fetch(
        `${config.backendUrl}/api/prestation/get-all-custom-prestation-by-prestation-id`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prestation_id }),
        }
      );

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setCustomPrestations(data.custom_prestations);
    } catch (error) {
      console.error('Erreur chargement prestations personnalisées:', error);
    }
  };

  const handleHourChange = (text: string, setHour: React.Dispatch<React.SetStateAction<string>>) => {
    const value = text.replace(/[^0-9]/g, '');
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 23)) {
      setHour(value);
    }
  };
  const handleMinuteChange = (text: string, setMinute: React.Dispatch<React.SetStateAction<string>>) => {
    const value = text.replace(/[^0-9]/g, '');
    if (value === '' || (parseInt(value, 10) >= 0 && parseInt(value, 10) <= 59)) {
      setMinute(value);
    }
  };

  // Ouvre modal et reset
  const openAddModal = (item: any) => {
    setSelectedPrestation(item);
    setSelectedDate('');
    setArrivalHour('');
    setArrivalMinute('');
    setModalType('date');
    setModalVisible(true);
  };

  const handleDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
    setModalType('arrival'); // passe à l’étape heure
  };

  const handleAddToCart = () => {
    if (!selectedDate) {
      Alert.alert('Erreur', 'Merci de choisir une date.');
      return;
    }
    if (arrivalHour.length !== 2 || arrivalMinute.length !== 2) {
      Alert.alert('Erreur', 'Merci de renseigner une heure d\'arrivée valide.');
      return;
    }

    const arrivalTime = new Date(selectedDate);
    arrivalTime.setHours(parseInt(arrivalHour, 10), parseInt(arrivalMinute, 10), 0);

    const cartItem = {
      prestation: selectedPrestation,
      startDate: selectedDate,
      endDate: null,
      arrivalTime,
      departureTime: null,
      totalRemuneration: parseFloat(selectedPrestation.price) || 0,
      daysWorked: 1,
      hoursWorked: null,
      profilePictureUrl: selectedPrestation.picture_url || '',
      type_of_remuneration : 'prestation',
      location : user?.location,
      customPrestationId: selectedPrestation.id,
      customPrestationTitle: selectedPrestation.title,
    };

    addToCart(cartItem);
    Alert.alert('Succès', 'Prestation ajoutée au panier.');
    setModalVisible(false);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => openAddModal(item)}>
      <Image
        source={{
          uri: item.picture_url || 'https://radiodisneyclub.fr/wp-content/uploads/2016/02/1CD_4872.jpg',
        }}
        style={styles.thumbnail}
      />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>{item.price ? `${item.price} €` : 'Prix non défini'}</Text>
      </View>
      <FontAwesome name="arrow-circle-right" size={20} color="green" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>MES PRESTATIONS</Text>
      <FlatList
        data={customPrestations}
        renderItem={renderItem}
        keyExtractor={(item: any) => item?.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Aucune prestation personnalisée trouvée.
          </Text>
        }
      />

      {/* Modal calendrier + heure arrivée */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Bouton retour pour l'étape 'arrival' */}
            {modalType === 'arrival' && (
              <TouchableOpacity
                onPress={() => setModalType('date')}
                style={styles.backIcon}
              >
                <Icon name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
            )}


            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeIcon}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            {modalType === 'date' && (
              <>
                <Text style={styles.modalTitle}>Choisissez une date</Text>
                <Calendar
                  onDayPress={handleDateSelect}
                  
                  markedDates={
                    selectedDate ? { [selectedDate]: { selected: true, selectedColor: 'green' } } : {}
                  }
                  style={styles.calendar}
                />
              </>
            )}

            {modalType === 'arrival' && (
              <>
                <Text style={styles.modalTitle}>Heure d'arrivée</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="HH"
                    value={arrivalHour}
                    onChangeText={(text) => handleHourChange(text, setArrivalHour)}
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="MM"
                    value={arrivalMinute}
                    onChangeText={(text) => handleMinuteChange(text, setArrivalMinute)}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    !(arrivalHour.length === 2 && arrivalMinute.length === 2) && { backgroundColor: '#ccc' },
                  ]}
                  disabled={!(arrivalHour.length === 2 && arrivalMinute.length === 2)}
                  onPress={handleAddToCart}
                >
                  <Text style={styles.modalButtonText}>Ajouter au panier</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    padding: 10,
  },
  header: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  calendar: {
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeInput: {
    width: 50,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  modalButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  backIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 5,
    zIndex: 10,
  },
});

export default ChoosePrestationScreen;

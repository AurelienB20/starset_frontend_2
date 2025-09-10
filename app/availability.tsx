import { LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { Menu, Provider as PaperProvider } from 'react-native-paper';
import config from '../config.json';

const ModifyAvailabilityScreen = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);
const [selectedEvent, setSelectedEvent] = useState<any>(null);

let [fontsLoaded] = useFonts({
    
    LeagueSpartanRegular : LeagueSpartan_400Regular,
    LeagueSpartanBold : LeagueSpartan_700Bold
  });

  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem('worker_id');
      if (id) {
        setWorkerId(id);
        fetchSchedule(id);
      }
    })();
  }, []);

  const fetchSchedule = async (id: string) => {
    try {
      const res = await fetch(`${config.backendUrl}/api/mission/get-worker-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: id }),
      });

      const data = await res.json();

      console.log(data)

      if (data.success && data.schedule) {
        const formatted = data.schedule.map((item: any) => {
  const localDate = moment(item.date).local().format('YYYY-MM-DD'); // force la date locale sans heure
  const startStr = item.start_time.slice(0, 5); // ex: "09:00"
  const endStr = item.end_time.slice(0, 5);     // ex: "17:00"

  return {
    title: 'Disponible',
    start: moment(`${localDate}T${startStr}`).toDate(),
    end: moment(`${localDate}T${endStr}`).toDate(),
  };
});
        setEvents(formatted);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du planning :', err);
    }
  };

  const handleDateClick = (date: Date | undefined) => {
    if (!date || isNaN(new Date(date).getTime())) {
      console.warn('Clic ignoré – Date invalide ou absente :', date);
      return;
    }
  
    setSelectedDate(date);
    setTimeRange({ start: '', end: '' });
    setShowModal(true);
  };

  const handleAddAvailability = async () => {
  if (!selectedDate || !timeRange.start || !timeRange.end || !workerId) return;

  const startFormatted = normalizeTimeInput(timeRange.start);
  const endFormatted = normalizeTimeInput(timeRange.end);

  // Vérification validité format horaire HH:mm
  const isValidFormat = (val: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(val);

  if (!isValidFormat(startFormatted) || !isValidFormat(endFormatted)) {
    Alert.alert("Format invalide", "Les heures doivent être au format HH:mm ou 9h00.");
    return;
  }

  const startMoment = moment(`${moment(selectedDate).format("YYYY-MM-DD")}T${startFormatted}`);
  const endMoment = moment(`${moment(selectedDate).format("YYYY-MM-DD")}T${endFormatted}`);

  if (!startMoment.isValid() || !endMoment.isValid() || endMoment.isSameOrBefore(startMoment)) {
    Alert.alert("Heure incorrecte", "L'heure de fin doit être après l'heure de début.");
    return;
  }

  const newEvent = {
    title: 'Disponible',
    start: startMoment.toDate(),
    end: endMoment.toDate(),
  };

  try {
    const res = await fetch(`${config.backendUrl}/api/mission/add-worker-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: workerId,
        date: moment(selectedDate).format('YYYY-MM-DD'),
        start_time: startFormatted,
        end_time: endFormatted,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setEvents([...events, newEvent]);
      setShowModal(false);
    } else {
      console.warn('Erreur côté serveur :', data.message);
      setShowModal(false);
    }
  } catch (err) {
    console.error('Erreur lors de l\'ajout de disponibilité :', err);
    setShowModal(false);
  }
};

  const normalizeTimeInput = (input: string): string => {
  // Supprime les espaces
  input = input.trim().replace(/\s+/g, '');

  // Remplace 'h' ou 'H' par ':'
  input = input.replace(/[hH]/, ':');

  // Si format est par exemple "9:0", complète avec zéros
  const [hour, minute] = input.split(':');

  if (!hour) return '';
  const hh = hour.padStart(2, '0');
  const mm = (minute || '00').padEnd(2, '0');

  // Ne garde que les deux premiers caractères des minutes
  return `${hh}:${mm.slice(0, 2)}`;
};


  const deleteWorkerSchedule = async () => {
  if (!workerId || !selectedEvent) return;

  const date = moment(selectedEvent.start).format('YYYY-MM-DD');
  const start_time = moment(selectedEvent.start).format('HH:mm');
  const end_time = moment(selectedEvent.end).format('HH:mm');

  try {
    const res = await fetch(`${config.backendUrl}/api/mission/delete-worker-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worker_id: workerId,
        date,
        start_time,
        end_time,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setEvents((prev) =>
        prev.filter(
          (ev) =>
            !(
              moment(ev.start).isSame(selectedEvent.start) &&
              moment(ev.end).isSame(selectedEvent.end)
            )
        )
      );
      setMenuVisible(false);
      setSelectedEvent(null);
    } else {
      console.warn('Suppression échouée :', data.message);
    }
  } catch (err) {
    console.error('Erreur suppression :', err);
  }
};

  return (
  <PaperProvider>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Modifier vos disponibilités</Text>
      <Calendar
        events={events}
        height={600}
        mode="week"
        weekStartsOn={1}
        onPressCell={handleDateClick}
        onPressEvent={(event) => {
        setSelectedEvent(event);
        setMenuAnchor(null); // ou { x: 0, y: 0 } pour forcer un coin
        setMenuVisible(true);
      }}
        swipeEnabled
        scrollOffsetMinutes={480}
      />

      <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={menuAnchor}
    >
      <Menu.Item
        onPress={() => {
          setMenuVisible(false);
          Alert.alert(
            'Supprimer ce créneau ?',
            'Cette action est irréversible.',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Supprimer', style: 'destructive', onPress: deleteWorkerSchedule },
            ]
          );
        }}
        title="Supprimer"
      />
    </Menu>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter une disponibilité</Text>
            <Text style={styles.selectedDate}>
              {selectedDate
                ? new Intl.DateTimeFormat('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(selectedDate)
                : 'Date non sélectionnée'}
            </Text>

            <TextInput
  style={styles.input}
  placeholder="Heure de début (ex: 09:00 ou 9h00)"
  placeholderTextColor={"#999"}
  value={timeRange.start}
  onChangeText={(text) => setTimeRange({ ...timeRange, start: text })}
/>

<TextInput
  style={styles.input}
  placeholder="Heure de fin (ex: 17:00 ou 17h00)"
  value={timeRange.end}
  onChangeText={(text) => setTimeRange({ ...timeRange, end: text })}
/>
            <TouchableOpacity style={styles.button} onPress={handleAddAvailability}>
              <Text style={styles.buttonText}>Ajouter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#ccc' }]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color : 'black' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 22, fontFamily : 'LeagueSpartanBold', marginBottom: 20, textAlign: 'center', color : 'black' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 10, paddingHorizontal: 10, color: 'black' },
  button: {backgroundColor: '#00BF63', padding: 10, borderRadius: 8, marginTop: 10 },
  buttonText: { fontSize: 18, textAlign: 'center', fontFamily : 'LeagueSpartanBold', color : 'white' },
  selectedDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
    textTransform: 'capitalize',
  },
});

export default ModifyAvailabilityScreen;

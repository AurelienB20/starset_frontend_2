import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  Modal, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import config from '../config.json';

const ModifyAvailabilityScreen = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const [workerId, setWorkerId] = useState<string | null>(null);

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setTimeRange({ start: '', end: '' });
    setShowModal(true);
  };

  const handleAddAvailability = async () => {
    if (!selectedDate || !timeRange.start || !timeRange.end || !workerId) return;

    const date = moment(selectedDate).format('YYYY-MM-DD');
    const newEvent = {
      title: 'Disponible',
      start: moment(`${date}T${timeRange.start}`).toDate(),
      end: moment(`${date}T${timeRange.end}`).toDate(),
    };

    try {
      const res = await fetch(`${config.backendUrl}/api/mission/add-worker-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: workerId,
          date,
          start_time: timeRange.start,
          end_time: timeRange.end,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setEvents([...events, newEvent]);
        setShowModal(false);
      } else {
        console.warn('Erreur côté serveur :', data.message);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de disponibilité :', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Modifier vos disponibilités</Text>

      <Calendar
        events={events}
        height={600}
        mode="week"
        weekStartsOn={1}
        onPressCell={handleDateClick}
        swipeEnabled
        scrollOffsetMinutes={480}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter une disponibilité</Text>
            {selectedDate && (
              <Text style={styles.selectedDate}>
                {moment(selectedDate).locale('fr').format('dddd D MMMM YYYY')}
              </Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Heure de début (ex: 09:00)"
              value={timeRange.start}
              onChangeText={(text) => setTimeRange({ ...timeRange, start: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Heure de fin (ex: 17:00)"
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 5, marginBottom: 10, paddingHorizontal: 10 },
  button: { backgroundColor: '#70FF70', padding: 10, borderRadius: 8, marginTop: 10 },
  buttonText: { fontSize: 16, textAlign: 'center' },
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

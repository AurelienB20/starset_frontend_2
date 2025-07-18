import moment from 'moment';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar as BigCalendar } from 'react-native-big-calendar';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  visible: boolean;
  onClose: () => void;
  modalType: any;
  setModalType: (type: string) => void;
  availabilityByDate: any;
  onDateSelect: (day: any) => void;
  arrivalHour: string;
  arrivalMinute: string;
  setStartDate: (date: any) => void;
  setEndDate: (date: any) => void;
  startDate: string | null;
endDate: string | null;
  departureHour: string;
  departureMinute: string;
  onArrivalHourChange: (text: string) => void;
  onArrivalMinuteChange: (text: string) => void;
  onDepartureHourChange: (text: string) => void;
  onDepartureMinuteChange: (text: string) => void;
  onConfirm: () => void;
}

const DateTimeSelectionModal = ({
  visible,
  onClose,
  modalType,
  setModalType,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  
  availabilityByDate,
  onDateSelect,
  arrivalHour,
  arrivalMinute,
  departureHour,
  departureMinute,
  onArrivalHourChange,
  onArrivalMinuteChange,
  onDepartureHourChange,
  onDepartureMinuteChange,
  onConfirm,
}: Props) => {

 

const handleDateSelect = (day: any) => {
  const date = day.dateString;

  if (!availabilityByDate[date]) return;

  if (!startDate || (startDate && endDate)) {
    setStartDate(date);
    setEndDate(null);
    
    return;
  }

  const start = moment(startDate);
  const end = moment(date);

  if (end.isBefore(start)) {
    setStartDate(date);
    setEndDate(null);
    
    return;
  }

  const range: Record<string, boolean> = {};
  let cursor = start.clone();
  let isValid = true;

  while (cursor.isSameOrBefore(end)) {
    const current = cursor.format('YYYY-MM-DD');
    if (!availabilityByDate[current]) {
      isValid = false;
      break;
    }
    range[current] = true;
    cursor.add(1, 'day');
  }

  if (!isValid) return;

  setEndDate(date);
  
};

const getSelectedRange = () => {
  if (!startDate || !endDate) return {};
  const range: Record<string, boolean> = {};
  let cursor = moment(startDate);
  const end = moment(endDate);

  while (cursor.isSameOrBefore(end)) {
    range[cursor.format('YYYY-MM-DD')] = true;
    cursor.add(1, 'day');
  }

  return range;
};

const getSelectedRangeArray = () => {
  if (!startDate || !endDate) return [];
  const range: string[] = [];
  let cursor = moment(startDate);
  const end = moment(endDate);

  while (cursor.isSameOrBefore(end)) {
    range.push(cursor.format('YYYY-MM-DD'));
    cursor.add(1, 'day');
  }

  return range;
};

const selectedDates : any = getSelectedRangeArray();

// Transforme availabilityByDate en events pour react-native-big-calendar
const allEvents = Object.keys(availabilityByDate).flatMap((date) =>
  availabilityByDate[date].map((timeRange: string) => {
    const [start, end] = timeRange.split(' - ');
    return {
      title: 'Disponible',
      start: moment(`${date}T${start}`).toDate(),
      end: moment(`${date}T${end}`).toDate(),
    };
  })
);

// Ne garde que les events correspondant aux dates sélectionnées
const filteredEvents = allEvents.filter((event) =>
  selectedDates.includes(moment(event.start).format('YYYY-MM-DD'))
);


const getMarkedDates = () => {
  const marked: any = {};
  const selectedRange = getSelectedRange();

  for (let i = 0; i < 31; i++) {
    const date = moment().startOf('month').add(i, 'days').format('YYYY-MM-DD');

    if (availabilityByDate[date]) {
      marked[date] = {
        marked: true,
        selected: selectedRange[date],
        customStyles: {
          container: {
            backgroundColor: selectedRange[date] ? '#4CAF50' : '#C6F6D5',
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
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>

          {(modalType === 'arrival' || modalType === 'departure') && (
            <TouchableOpacity
              onPress={() => setModalType(modalType === 'arrival' ? 'date' : 'arrival')}
              style={styles.backIcon}
            >
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          )}

          {/* DATE PICKER */}
          {modalType === 'date' && (
            <>
              <Text style={styles.modalTitle}>Choisissez une ou plusieurs dates</Text>
              <Calendar
                onDayPress={handleDateSelect}
                markingType="custom"
                markedDates={getMarkedDates()}
                style={styles.calendar}
              />
              
              {selectedDates.length > 0 && (
                <>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10 }}>Disponibilités :</Text>
                  <View style={{ height: 300, marginTop: 10, width : '100%' }}>
                  <BigCalendar
  events={filteredEvents}
  height={200}
  mode="week"
  date={selectedDates[0]}
  swipeEnabled={true}
  hourRowHeight={30} // 🔽 Réduit la hauteur de chaque heure
  eventCellStyle={() => ({
    paddingVertical: 2,
    paddingHorizontal: 4,
  })}
/>
                  </View>
                </>
              )}
              
              <TouchableOpacity onPress={() => setModalType('arrival')} style={styles.horairesButton}>
                <Text style={styles.horairesButtonText}>Suivant</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ARRIVAL TIME */}
          {modalType === 'arrival' && (
            <>
              <Text style={styles.modalTitle}>Heure d'arrivée</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="HH" value={arrivalHour} onChangeText={onArrivalHourChange} />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="MM" value={arrivalMinute} onChangeText={onArrivalMinuteChange} />
              </View>
              <TouchableOpacity style={styles.horairesButton} onPress={() => setModalType('departure')}>
                <Text style={styles.horairesButtonText}>Suivant</Text>
              </TouchableOpacity>
            </>
          )}

          {/* DEPARTURE TIME */}
          {modalType === 'departure' && (
            <>
              <Text style={styles.modalTitle}>Heure de départ</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="HH" value={departureHour} onChangeText={onDepartureHourChange} />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="MM" value={departureMinute} onChangeText={onDepartureMinuteChange} />
              </View>
              <TouchableOpacity style={styles.horairesButton} onPress={onConfirm}>
                <Text style={styles.horairesButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  input: { width: 60, height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, textAlign: 'center', fontSize: 24 },
  timeSeparator: { fontSize: 40, marginHorizontal: 10 },
  horairesButton: { backgroundColor: '#00cc66', padding: 10, borderRadius: 8, marginTop: 20, width: '100%', alignItems: 'center' },
  horairesButtonText: { color: '#fff', fontSize: 16 },
  closeIcon: { position: 'absolute', top: 10, right: 10, padding: 5 },
  backIcon: { position: 'absolute', top: 10, left: 10, padding: 5 },
  calendar: { alignSelf: 'center' },
});

export default DateTimeSelectionModal;

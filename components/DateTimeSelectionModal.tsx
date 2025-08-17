import { LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { LexendDeca_400Regular } from '@expo-google-fonts/lexend-deca';
import { useFonts } from 'expo-font';
import moment from 'moment';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar as BigCalendar } from 'react-native-big-calendar';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WheelPicker from 'react-native-wheel-picker-expo';

const minutes = Array.from({ length: 60 }, (_, i) => {
  const value = i.toString().padStart(2, '0');
  return { label: value, value };
});

const hours = Array.from({ length: 24 }, (_, i) => {
  const value = i.toString().padStart(2, '0');
  return { label: value, value };
});


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

  let [fontsLoaded] = useFonts({
      
      LexendDeca : LexendDeca_400Regular,
      
      LeagueSpartanBold : LeagueSpartan_700Bold
    });


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

const isHourWithinAvailability = () => {
  if (!startDate || !arrivalHour || !arrivalMinute || !departureHour || !departureMinute) return false;

  const selectedStart = moment(`${startDate}T${arrivalHour.padStart(2, '0')}:${arrivalMinute.padStart(2, '0')}`, moment.ISO_8601);
  const selectedEnd = moment(`${endDate || startDate}T${departureHour.padStart(2, '0')}:${departureMinute.padStart(2, '0')}`, moment.ISO_8601);

  const selectedDates = getSelectedRangeArray();

  for (const date of selectedDates) {
    const availableRanges = availabilityByDate[date] || [];

    // Une date doit avoir au moins une plage qui englobe toute la période
    const hasValidRange = availableRanges.some((range: string) => {
      const [rangeStart, rangeEnd] = range.split(' - ');
      const availableStart = moment(`${date}T${rangeStart}`);
      const availableEnd = moment(`${date}T${rangeEnd}`);
      return (
        selectedStart.isSameOrAfter(availableStart) &&
        selectedEnd.isSameOrBefore(availableEnd)
      );
    });

    if (!hasValidRange) return false;
  }

  return true;
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
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
        <ScrollView
          style={{ height: '100%',}}
          contentContainerStyle={{ paddingBottom: 0 }}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          

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
                theme={{
                  textDayFontFamily: 'LexendDeca_400Regular',
                  textMonthFontFamily: 'LexendDeca_400Regular',
                  
                }}
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
              
              <TouchableOpacity
                style={styles.horairesButton}
                onPress={() => {
                  if (!arrivalHour) onArrivalHourChange('00');
                  if (!arrivalMinute) onArrivalMinuteChange('00');
                  setModalType('arrival');
                }}
              >
                <Text style={styles.horairesButtonText}>Suivant</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ARRIVAL TIME */}
          {modalType === 'arrival' && (
            <>
              <Text style={styles.modalTitle}>Heure d'arrivée</Text>
              <View style={styles.inputRow}>
                {/*<TextInput style={styles.input} keyboardType="numeric" placeholder="HH" value={arrivalHour} onChangeText={onArrivalHourChange} />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholder="MM" value={arrivalMinute} onChangeText={onArrivalMinuteChange} />*/}
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>
                <View style={{ height: 200, overflow: 'hidden', justifyContent: 'center', width : 100 }}>
                  <WheelPicker
                    height={350} // Garder une grande hauteur pour scroll fluide
                    width={100}
                    initialSelectedIndex={parseInt(arrivalHour || '12')}
                    items={hours}
                    onChange={({ index }) => onArrivalHourChange(hours[index].value)}
                    renderItem={(item) => (
                      <Text style={{
                        fontSize: 60,
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}>
                        {item.label}
                      </Text>
                    )}
                  />
                </View>
                
                  <Text style={{ fontSize: 40, alignSelf: 'center', fontWeight : 'bold',marginTop: 5, }}>:</Text>
                  <View style={{ height: 200, overflow: 'hidden', justifyContent: 'center', width : 100 }}>
                  <WheelPicker
                    height={350} // Garder une grande hauteur pour scroll fluide
                    width={100}
                    initialSelectedIndex={parseInt(arrivalMinute || '0')}
                    items={minutes}
                    onChange={({ index }) => onArrivalMinuteChange(minutes[index].value)}
                    renderItem={(item) => (
                      <Text style={{
                        fontSize: 60,
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}>
                        {item.label}
                      </Text>
                    )}
                  />
                </View>
                  
              </View>
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>
                <View style={{ height: 200, overflow: 'hidden', justifyContent: 'center', width : 100 }}>
                  <WheelPicker
                    height={350} // Garder une grande hauteur pour scroll fluide
                    width={100}
                    initialSelectedIndex={parseInt(departureHour || '12')}
                    items={hours}
                    onChange={({ index }) => onDepartureHourChange(hours[index].value)}
                    renderItem={(item) => (
                      <Text style={{
                        fontSize: 60,
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}>
                        {item.label}
                      </Text>
                    )}
                  />
                </View>
                
                  <Text style={{ fontSize: 40, alignSelf: 'center', fontWeight : 'bold',marginTop: 5, }}>:</Text>
                  <View style={{ height: 200, overflow: 'hidden', justifyContent: 'center', width : 100 }}>
                  <WheelPicker
                    height={350} // Garder une grande hauteur pour scroll fluide
                    width={100}
                    initialSelectedIndex={parseInt(departureMinute || '0')}
                    items={minutes}
                    onChange={({ index }) => onDepartureMinuteChange(minutes[index].value)}
                    renderItem={(item) => (
                      <Text style={{
                        fontSize: 60,
                        textAlign: 'center',
                        fontWeight: 'bold',
                      }}>
                        {item.label}
                      </Text>
                    )}
                  />
                </View>
                  
              </View>
              </View>
              <TouchableOpacity style={styles.horairesButton} 
                onPress={() => {
                  if (!departureHour) onDepartureHourChange('00');
                  if (!departureMinute) onDepartureMinuteChange('00');

                  if (isHourWithinAvailability()) {
                    onConfirm();
                  } else {
                    alert("Les horaires sélectionnés ne correspondent pas aux disponibilités.");
                  }
                }}

              >
                <Text style={styles.horairesButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </>
          )}
         </ScrollView>
      </View>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
    
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    maxHeight : '80%'
    // ❌ enlève maxHeight ici
  },
  modalTitle: { fontSize: 20, marginBottom: 10, fontFamily : 'LeagueSpartanBold', marginTop : 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  input: { width: 60, height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, textAlign: 'center', fontSize: 24 },
  timeSeparator: { fontSize: 40, marginHorizontal: 10 },
  horairesButton: { backgroundColor: '#00cc66', padding: 10, borderRadius: 8, marginTop: 20, width: '100%', alignItems: 'center' },
  horairesButtonText: { color: '#fff', fontSize: 16, fontFamily : 'LexendDeca' },
  closeIcon: { position: 'absolute', top: 10, right: 10, padding: 5 },
  backIcon: { position: 'absolute', top: 10, left: 10, padding: 5 },
  calendar: { alignSelf: 'center' },
});

export default DateTimeSelectionModal;


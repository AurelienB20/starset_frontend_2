import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ProfileScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);
  const [currentPicker, setCurrentPicker] = useState<'startDate' | 'endDate' | null>(null);

  const navigation = useNavigation();

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      if (currentPicker === 'startDate') {
        setStartDate(selectedDate);
      } else if (currentPicker === 'endDate') {
        setEndDate(selectedDate);
      }
    }
  };

  const showMode = (currentMode: 'date' | 'time', picker: 'startDate' | 'endDate') => {
    setMode(currentMode);
    setCurrentPicker(picker);
    setShowPicker(true);
  };

  const showDatepicker = (picker: 'startDate' | 'endDate') => {
    showMode('date', picker);
  };

  const showTimepicker = (picker: 'startDate' | 'endDate') => {
    showMode('time', picker);
  };

  const handleValidation = () => {
    setModalVisible(false);
    navigation.navigate({
      name: 'summary',
      params: { startDate, endDate },
    } as never);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png'}}
          style={styles.profilePicture}
        />
        <Text style={styles.profileName}>Chloé</Text>
        <Text style={styles.profileDescription}>
          Salut, je m'appelle Chloé. Je suis actuellement étudiante en droit à la fac d'Assas. Selon moi, le temps libre est une chance, elle permet de développer mes passions, en quelque chose d'utile pour les rêveurs de la communauté #STARSET.
        </Text>
      </View>

      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>👶 Babysitting</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>🐶 Petsitting</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>🛒 Courses</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>🏠 Ménage</Text>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionContainerText}>
          Salut, je m'appelle Chloé. Je suis actuellement étudiante en droit à la fac d'Assas.
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>17</Text>
            <Text style={styles.statLabel}>Prestations effectuées</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>❤️</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>“Passionée”</Text>
            <Text style={styles.statLabel}>Caractère</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text>Photos (25)</Text>
      </View>

      <View style={styles.photosContainer}>
        {/* Repeat Image component for each photo */}
        <Image
          source={{
            uri: 'https://images.ctfassets.net/rc3dlxapnu6k/MbDi9PU80dvyhHG20LQWo/d2baae8aeb075148e697f9832cee605b/Malaysia__Cameron_Highlands.jpg?w=2666&h=1500&fl=progressive&q=50&fm=jpg',
          }}
          style={styles.photo}
        />
        <Image
          source={{
            uri: 'https://images.ctfassets.net/rc3dlxapnu6k/MbDi9PU80dvyhHG20LQWo/d2baae8aeb075148e697f9832cee605b/Malaysia__Cameron_Highlands.jpg?w=2666&h=1500&fl=progressive&q=50&fm=jpg',
          }}
          style={styles.photo}
        />
        <Image source={{ uri : 'https://images3.bovpg.net/r/back/fr/sale/5de4d43dc3140o.jpg'}} style={styles.photo} />
        <Image source={{ uri : 'https://images3.bovpg.net/r/back/fr/sale/5de4d43dc3140o.jpg'}} style={styles.photo} />
        <Image source={{ uri : 'https://images3.bovpg.net/r/back/fr/sale/5de4d43dc3140o.jpg'}} style={styles.photo} />
        <Image source={{ uri : 'https://images3.bovpg.net/r/back/fr/sale/5de4d43dc3140o.jpg'}} style={styles.photo} />
        <Image source={{ uri : 'https://images3.bovpg.net/r/back/fr/sale/5de4d43dc3140o.jpg'}} style={styles.photo} />
        <Image source={{ uri : 'https://images3.bovpg.net/r/back/fr/sale/5de4d43dc3140o.jpg'}} style={styles.photo} />
        <Image source={{ uri : 'https://images3.bovpg.net/r/back/fr/sale/5de4d43dc3140o.jpg'}} style={styles.photo} />
        <Image source={{ uri : 'https://images3.bovpg.net/r/back/fr/sale/5de4d43dc3140o.jpg'}} style={styles.photo} />
        <Image source={{ uri : 'https://images3.bovpg.net/r/back/fr/sale/5de4d43dc3140o.jpg'}} style={styles.photo} />
        {/* Add more images as necessary */}
      </View>

      <View style={styles.reviewsContainer}>
        <Text style={styles.sectionHeader}>Avis (12)</Text>
        <View style={styles.review}>
          <Text style={styles.reviewText}>
            Cela fait maintenant 2 mois que Alicia garde mes enfants, et je suis extrêmement satisfaite de son professionnalisme et de sa générosité. Merci ma chère Alicia ❤️
          </Text>
          <Text style={styles.reviewAuthor}>- Chloé.C</Text>
        </View>
        <View style={styles.review}>
          <Text style={styles.reviewText}>
            Alicia gardée mes neveux pour les vacances, maintenant ils l'adorent !
          </Text>
          <Text style={styles.reviewAuthor}>- Stéphane.G</Text>
        </View>
        <View style={styles.review}>
          <Text style={styles.reviewText}>
            Meilleure Babysitter que j'ai eu pour mes enfants, je pars travailler serein. Merci Alicia !
          </Text>
          <Text style={styles.reviewAuthor}>- Jérôme.B</Text>
        </View>
      </View>

      <View style={styles.pricingContainer}>
        <Text style={styles.pricingText}>15€/heure</Text>
        <TouchableOpacity style={styles.calendarButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.calendarButtonText}>Voir le calendrier</Text>
        </TouchableOpacity>
        <View style={styles.diagonal} />
        <View style={styles.diagonal2} />
      </View>

      <View style={styles.addButtoncontainer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Ajouter au panier</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for DateTime Picker */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Choisissez la date de début:</Text>
            <TouchableOpacity onPress={() => showDatepicker('startDate')} style={styles.dateButton}>
              <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showTimepicker('startDate')} style={styles.timeButton}>
              <Text style={styles.timeText}>{startDate.toLocaleTimeString()}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Choisissez la date de fin:</Text>
            <TouchableOpacity onPress={() => showDatepicker('endDate')} style={styles.dateButton}>
              <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showTimepicker('endDate')} style={styles.timeButton}>
              <Text style={styles.timeText}>{endDate.toLocaleTimeString()}</Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={currentPicker === 'startDate' ? startDate : endDate}
                mode={mode}
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            )}

            
            <TouchableOpacity onPress={() => handleValidation()} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    
    backgroundColor: '#FFFFFF',
    
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal : 10,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  profileDescription: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginVertical: 10,
    paddingHorizontal : 10,
  },
  tag: {
    backgroundColor: 'yellow',
    padding: 10,
    borderRadius: 15,
    margin: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#000',
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
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 11,
    color: '#000',
  },
  photosContainer: {
    marginBottom: 20,
    width: '100%',
    
    justifyContent: 'flex-start',
    flexDirection: 'row',
    flexWrap : 'wrap',
   
    
  },
  sectionHeader: {
    fontSize : 15,
    fontWeight: 'bold',
    color: '#000',
    marginVertical : 10,
    marginLeft : 5,
    padding : 8,
    backgroundColor : 'gray',
    borderRadius : 10,
    alignSelf: 'flex-start'
  },

  sectionHeaderText :{
    fontSize : 15,
    fontWeight: 'bold',
    color: '#000',
  },

  photo: {
    width: '33%',
    aspectRatio : 1,
    maxHeight : 300,
    maxWidth : 300,
    
  },
  reviewsContainer: {
    marginBottom: 20,
  },
  
  review: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal : 10,
  },
  
  reviewText: {
    fontSize: 16,
    color: '#000',
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
    marginBottom: 20,
    backgroundColor : 'green',
    height : 100,
    marginHorizontal : 10,
    paddingHorizontal : 30,
    
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
    color : 'white',
    padding: 10,
    borderRadius: 5,
  },
  calendarButtonText: {
    fontSize: 16,
    color: '#FFF',
  },

  addButtoncontainer : {
    width : '100%',
    alignItems : 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width : 300,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFF',
  },

  descriptionContainer : {
    backgroundColor : 'gray',
    marginHorizontal : 10,
    
    borderRadius : 10,
    padding : 20,
  },

  descriptionContainerText : {
    fontSize : 12,
    color : 'black'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color : 'black'
  },
  dateButton: {
    backgroundColor: '#eee',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  dateText: {
    fontSize: 16,
  },
  timeButton: {
    backgroundColor: '#eee',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  timeText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ProfileScreen;

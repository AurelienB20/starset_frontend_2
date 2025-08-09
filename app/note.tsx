import { useUser } from '@/context/userContext';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import config from '../config.json';

const NoteScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { planned_prestation } = route.params as any;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [prestation, setPrestation] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const { user } = useUser();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const getPrestation = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-prestation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestation_id: planned_prestation.prestation_id }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      if(data)
      {
        setPrestation(data.prestation);
        setAccount(data.account);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la prestation :', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const renderTagItem = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
  
    return (
      <TouchableOpacity
        key={tag}
        onPress={() => toggleTag(tag)}
        style={[styles.tag, isSelected && styles.tagSelected]}
      >
        <Text style={{ color: 'black' }}>{tag}</Text>
      </TouchableOpacity>
    );
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/planned-prestation/add-rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          worker_id: prestation.worker_id,
          prestation_id: prestation.id,
          planned_prestation_id : planned_prestation.id,
          rating,
          comment,
          firstname: account.firstname,
          lastname: account.lastname,
        }),
      });

      if (!response.ok) throw new Error('Échec de l’envoi de la note');

      Alert.alert('Succès', 'Votre note a bien été enregistrée.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erreur lors de l’envoi de la note :', error);
      Alert.alert('Erreur', 'Impossible d’enregistrer la note.');
    }
  };

  useEffect(() => {
    getPrestation();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Image
            source={{
              uri:
                prestation?.profile_picture_url ||
                'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png',
            }}
            style={styles.avatar}
          />
          <Text style={styles.title}>{prestation?.metier}</Text>
          <Text style={styles.subtitle}>
            {account ? `${account.firstname} ${account.lastname}` : ''}
          </Text>

          <Text style={styles.sectionTitle}>APPRÉCIATION</Text>
          <View style={styles.tagsContainer}>
            {['GÉNÉREUSE', 'DYNAMIQUE', 'PONCTUELLE'].map(renderTagItem)}
          </View>

          <Text style={styles.sectionTitle}>NOTEZ LA PRESTATION</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <FontAwesome
                  name={star <= rating ? 'star' : 'star-o'}
                  size={32}
                  color={star <= rating ? '#FFD700' : 'gray'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>LAISSER UN COMMENTAIRE</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Merci pour ton service..."
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Envoyer</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e6f2e6',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 15,
    marginBottom: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    fontSize: 12,
  },

  tagSelected: {
    borderColor: '#00cc44',
    borderWidth: 2,
  },

  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#00cc44',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NoteScreen;

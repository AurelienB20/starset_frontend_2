import { Ionicons } from '@expo/vector-icons'; // You can use icons for the send button
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Provider } from 'react-native-paper';
import config from '../config.json';
import socket from './socket';



const ChatScreen = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any>([]);
  const navigation = useNavigation();
  const route = useRoute() as any;
  const { conversation_id, sender_id, sender_type , contact_profile_picture_url, contact_firstname} = route.params || {};
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[] | null>([]);
  const [isSending, setIsSending] = useState(false);
  const [otherId, setOtherId] = useState<string | null>(null);
  const screenHeight = Dimensions.get('window').height;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [visibleHeight, setVisibleHeight] = useState(screenHeight);
  const seenMessageIds = useRef<any>(new Set());
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const menuAnchorRef = useRef(null);


  const getConversationDetails = async () => {
  try {
    const response = await fetch(`${config.backendUrl}/api/conversation/get-conversation-with-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversation_id }),
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération de la conversation');

    const data = await response.json();
    console.log(data)

    if (data.success && data.conversation) {
      const { person1_id, person2_id } = data.conversation;

      // ✅ Trouve l'autre personne en comparant avec sender_id
      const other = person1_id === sender_id ? person2_id : person1_id;
      setOtherId(other);
      console.log('Autre personne dans la conversation :', other);
    }
  } catch (error) {
    console.error("Erreur dans getConversationDetails:", error);
  }
};


  const getAllMessages = async () => {
    try {
      console.log('Fetching messages');
      const response = await fetch(`${config.backendUrl}/api/conversation/get-all-messages-by-conversation-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation_id }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Messages:', data.messages);
      setMessages(data.messages);
    } catch (error) {
      console.error('An error occurred while fetching messages:', error);
    }
  };

  const getLocalTime = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
  };

  const handleSelectImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Autorisez l'accès à la galerie.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
      allowsMultipleSelection: true, // ⚠️ uniquement sur certains appareils
      selectionLimit: 0, // 0 = illimité (iOS)
    });
  
    if (!result.canceled) {
      const newImages = result.assets.map((img) => `data:image/jpeg;base64,${img.base64}`);
      setSelectedImages((prev) => [...(prev || []), ...newImages]);
    }
  };
  

  const handleSelectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Autorisez l'accès à la galerie.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });
  
    if (!result.canceled) {
      const image = result.assets[0];
      setSelectedImage(`data:image/jpeg;base64,${image.base64}`);
    }
  };

  
 

  const goToPrestationViewWithId = (id: any) => {
  navigation.navigate({
    name: 'prestationView',
    params: { id },
  } as never);
};

const handleDeleteMessage = async (message_id: string) => {
  try {
    const res = await fetch(`${config.backendUrl}/api/conversation/delete-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id }),
    });

    if (!res.ok) throw new Error('Erreur lors de la suppression');
    
    // Mise à jour locale
    setMessages((prev: any[]) =>
      prev.map((msg) =>
        msg.id === message_id
          ? { ...msg, message_text: 'Ce message a été supprimé', picture_url: null }
          : msg
      )
    );
  } catch (err) {
    Alert.alert('Erreur', 'Impossible de supprimer le message.');
  }
};


const fetchPrestationIdByWorker = async (workerId: any) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/mission/get-any`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ worker_id: workerId }),
    });

    const data = await response.json();
    if (data.success && data.prestation_id) {
      goToPrestationViewWithId(data.prestation_id);
    } else {
      Alert.alert("Erreur", "Impossible de récupérer la prestation.");
    }
  } catch (err) {
    console.error("Erreur lors de la récupération du prestation_id :", err);
    Alert.alert("Erreur", "Impossible de naviguer vers la prestation.");
  }
};


  const handleSendMessage = async () => {
    const message_time = getLocalTime();
    const trimmedMessage = newMessage.trim();

    const pendingMessage = {
      conversation_id,
      sender_id,
      sender_type,
      message_text: trimmedMessage || '', // même vide si image seule
      picture_url: selectedImage || null,
      timestamp: message_time,
      local_id: Date.now(), // identifiant temporaire si besoin
    };
    seenMessageIds.current.add(pendingMessage.local_id);

    // 👇 Affiche immédiatement dans la conversation
    //setMessages((prev: any) => [...prev, pendingMessage]);

    // 👇 Nettoie les inputs immédiatement
    setNewMessage('');
    setSelectedImage(null);
  
    // Construction du message de base
    const newMessageObject = {
      conversation_id,
      sender_id,
      sender_type,
      message_text: trimmedMessage,
      timestamp: message_time,
    };
  
    // Si une image est présente, on l’ajoute au payload
    if (selectedImage) {
      const payload = {
        ...newMessageObject,
        file: {
          filename: `image-${Date.now()}.jpg`,
          mimetype: 'image/jpeg',
          data: selectedImage,
        },
      };
  
      try {
        const response = await fetch(`${config.backendUrl}/api/conversation/send-image-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
  
        socket.emit('newMessage', { ...data.message, conversation_id });
        //setMessages((prev: any) => [...prev, data.message]);
      } catch (error) {
        console.error('Erreur envoi image/message :', error);
        Alert.alert('Erreur', "Impossible d'envoyer le message.");
      }
  
    } else {
      // Envoi texte simple
      try {
        const response = await fetch(`${config.backendUrl}/api/conversation/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newMessageObject }),
        });
  
        if (!response.ok) throw new Error('Erreur réseau');
  
        const data = await response.json();
        socket.emit('newMessage', { ...data.message, conversation_id });
        //setMessages((prev: any) => [...prev, data.message]);
      } catch (error) {
        console.error('Erreur envoi message texte :', error);
      }
    }
  
    // Nettoyage à la fin
    setNewMessage('');
    setSelectedImage(null);
  };

  useEffect(() => {

    getAllMessages()
    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height +10);
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      
    };

    }, []);

  useEffect(() => {
    if (!conversation_id) return;
  
    // Joindre la salle de cette conversation
    socket.emit('joinRoom', conversation_id);
  
    socket.on('newMessage', (message) => {
      setMessages((prev: any[]) => {
        const alreadyExists = prev.some((m) => m.timestamp === message.timestamp);
        if (!alreadyExists) {
          return [...prev, message];
        } else {
          return prev;
        }
      });
    });
  
    return () => {
      socket.off('newMessage');
    };
  }, [conversation_id]);
  
  return (
    <Provider>
    <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
      <SafeAreaView style={{ flex: 1 }}>
      {/* Placeholder image at the top center */}
      <View style={styles.header}>
        <TouchableOpacity
  onPress={() => {
    if (sender_type === 'user') {
      if (otherId) {
        fetchPrestationIdByWorker(otherId);
      } else {
        Alert.alert('Erreur', 'Identifiant du contact non disponible.');
      }
    }
    // Si sender_type n'est pas 'user' → ne rien faire
  }}
>
  <Image
    source={{ uri: contact_profile_picture_url }}
    style={styles.headerImage}
  />
</TouchableOpacity>
        <Text style={styles.headerName}>{contact_firstname}</Text>
      </View>

      {/* Scrollable message list */}
      {/*<ScrollView style={styles.messageContainer} contentContainerStyle={{ flexGrow: 1 }}> */}
      <ScrollView style={styles.messageContainer}>
        {messages.map((message: any, index: React.Key | null | undefined) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.sender_id === sender_id ? styles.myMessage : styles.otherMessage,
            ]}
          >
            <View style={message.sender_id === sender_id ? styles.myTextWrapper : styles.otherTextWrapper}>
              <Text style={styles.messageText}>{message.message_text}</Text>
              {message.picture_url ? (
                <Image
                  source={{ uri: message.picture_url }}
                  style={{ width: 200, height: 200, borderRadius: 10, marginTop: 5 }}
                  resizeMode="cover"
                />
              ) : null}
              
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Fixed input bar */}
      <View style={styles.inputContainer}>
      <TouchableOpacity onPress={handleSelectImage}>
        <Ionicons name="camera-outline" size={24} color="#008000" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Ajouter un message..."
        placeholderTextColor="#808080"
      />

      {selectedImage && (
        <TouchableOpacity onPress={() => setSelectedImage(null)}>
          <Image
            source={{ uri: selectedImage }}
            style={{ width: 40, height: 40, marginRight: 8, borderRadius: 5 }}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.sendButton,
          !(newMessage.trim() || selectedImage) && { backgroundColor: '#cccccc' } // gris si rien à envoyer
        ]}
        disabled={!(newMessage.trim() || selectedImage)}
        onPress={handleSendMessage}
      >
        <Ionicons name="send" size={24} color="white" />
      </TouchableOpacity>
    </View>
    </SafeAreaView>
    </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  
  headerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,  // Fine border
    borderColor: 'rgba(0, 0, 0, 0.1)', // Subtle color for the border (almost invisible)
  },

  messageContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 5,
    width: '100%',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    marginRight: 10,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  myTextWrapper: {
    backgroundColor: '#FFEB3B',
    padding: 10,
    borderRadius: 20,
    maxWidth: '70%',
  },
  otherTextWrapper: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 20,
    maxWidth: '70%',
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    marginHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerName: {
    marginTop: 8, // Adds space between the image and the name
    fontSize: 18, // Size of the name text
    fontWeight: 'bold', // Make the name bold
    color: '#333', // Dark color for the name
  },
});

export default ChatScreen;

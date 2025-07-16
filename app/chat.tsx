import { Ionicons } from '@expo/vector-icons'; // You can use icons for the send button
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  const handleSendImage = async () => {
    if (!selectedImage) return;
  
    const message_time = getLocalTime();
  
    const file = {
      filename: `image-${Date.now()}.jpg`,
      mimetype: 'image/jpeg',
      data: selectedImage, // Contient déjà le préfixe data:image/jpeg;base64,...
    };
  
    const payload = {
      conversation_id,
      sender_id,
      sender_type,
      file,
    };
  
    try {
      const response = await fetch(`${config.backendUrl}/api/conversation/send-image-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error('Erreur réseau');
  
      const data = await response.json();
  
      // Émettre via Socket
      socket.emit('newMessage', {
        ...data.message,
        conversation_id,
      });
  
      // Ajouter à l'affichage localement
      setMessages((prev : any) => [...prev, data.message]);
      setSelectedImage(null); // Nettoyer l'image sélectionnée
  
    } catch (error) {
      console.error('Erreur envoi image :', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'image');
    }
  };

  const handleSendMessageMultipleImage = async () => {
    const trimmedMessage = newMessage.trim();
  
    if (!trimmedMessage && (!selectedImages || selectedImages.length === 0)) {
      return; // Rien à envoyer
    }
  
    const message_time = getLocalTime();
  
    const newMessageObject = {
      conversation_id,
      sender_id,
      sender_type,
      message_text: trimmedMessage,
      timestamp: message_time,
    };
  
    // ✅ Envoi avec plusieurs images
    if (selectedImages && selectedImages.length > 0) {
      const files = selectedImages.map((img: any, index: any) => ({
        filename: `image-${Date.now()}-${index}.jpg`,
        mimetype: 'image/jpeg',
        data: img,
      }));
  
      const payload = {
        ...newMessageObject,
        files, // 👈 liste d'images ici
      };
  
      try {
        const response = await fetch(`${config.backendUrl}/api/conversation/send-multiple-images-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) throw new Error('Erreur réseau');
        const data = await response.json();
  
        socket.emit('newMessage', { ...data.message, conversation_id });
        setMessages((prev: any) => [...prev, data.message]);
      } catch (error) {
        console.error('Erreur envoi images/message :', error);
        Alert.alert('Erreur', "Impossible d'envoyer le message.");
      }
  
    } else {
      // ✅ Envoi texte seul
      try {
        const response = await fetch(`${config.backendUrl}/api/conversation/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newMessageObject }),
        });
  
        if (!response.ok) throw new Error('Erreur réseau');
  
        const data = await response.json();
        socket.emit('newMessage', { ...data.message, conversation_id });
        setMessages((prev: any) => [...prev, data.message]);
      } catch (error) {
        console.error('Erreur envoi message texte :', error);
      }
    }
  
    // Nettoyage
    setNewMessage('');
    setSelectedImages([]);
  };
  

  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage && !selectedImage) {
      return; // Rien à envoyer
    }
  
    const message_time = getLocalTime();
  
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
        setMessages((prev: any) => [...prev, data.message]);
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
        setMessages((prev: any) => [...prev, data.message]);
      } catch (error) {
        console.error('Erreur envoi message texte :', error);
      }
    }
  
    // Nettoyage à la fin
    setNewMessage('');
    setSelectedImage(null);
  };

  useEffect(() => {
    getAllMessages();
  }, []);

  useEffect(() => {
    if (!conversation_id) return;
  
    // Joindre la salle de cette conversation
    socket.emit('joinRoom', conversation_id);
  
    socket.on('newMessage', (message) => {
      setMessages((prev : any) => [...prev, message]);
    });
  
    return () => {
      socket.off('newMessage');
    };
  }, [conversation_id]);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Placeholder image at the top center */}
      <View style={styles.header}>
        <Image
          source={{ uri: contact_profile_picture_url }} // Placeholder for user avatar
          style={styles.headerImage}
        />
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
              <Text>message.picture_url</Text>
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

      <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
        <Ionicons name="send" size={24} color="white" />
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
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

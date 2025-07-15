import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import config from '../../config.json';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SkeletonMessage = () => {
  
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, SCREEN_WIDTH],
  });

  return (
    <View style={styles.messageContainer}>
      <View style={[styles.profileImage, { backgroundColor: '#DDD' }]} />
      <View style={styles.skeletonTextWrapper}>
        <View style={styles.skeletonText} />
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const ConversationScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [conversations, setConversations] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pendingConversationsCount = conversations.filter((conv: any) => conv.accepted === false).length;
  const [searchTerm, setSearchTerm] = useState('');

  const getWorkerId = async () => {
    try {
      const worker_id = await AsyncStorage.getItem('worker_id');
      if (worker_id !== null) {
        return worker_id;
      }
    } catch (e) {
      console.error('Erreur lors de la récupération du type de compte', e);
    }
  };

  const getFormattedTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    return date.toLocaleString('fr-FR', {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // === Ajoute cette fonction pour accepter une conversation ===
const acceptConversation = async (conversation_id: string) => {
  try {
    const response = await fetch(`${config.backendUrl}/api/conversation/accept-conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation_id }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l’acceptation de la conversation');
    }

    const data = await response.json();
    console.log('Conversation acceptée:', data);

    // Après acceptation, recharge les conversations
    await getAllConversation();
  } catch (error) {
    console.error('Erreur lors de l’acceptation:', error);
  }
};


  const gotoChat = async (conversationId: string, contactProfilePictureUrl: string, contactFirstname: string) => {
    const worker_id = await getWorkerId();
    navigation.navigate({
      name: 'chat',
      params: {
        conversation_id: conversationId,
        sender_id: worker_id,
        sender_type: 'worker',
        contact_profile_picture_url: contactProfilePictureUrl,
        contact_firstname: contactFirstname,
      },
    } as never);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.messageContainer}
      onPress={() => gotoChat(item.id, item.profile_picture_url, item.firstname)}
    >
      <Image
        source={{ uri: item.profile_picture_url }}
        style={styles.profileImage}
      />
      <View style={styles.messageContent}>
        <Text style={styles.name}>{item.firstname}</Text>
        <Text style={styles.message}>{item.message_text}</Text>
      </View>
      <Text style={styles.time}>{getFormattedTime(item.timestamp)}</Text>
    </TouchableOpacity>
  );

  const getAllConversation = async () => {
    try {
      const worker_id = await getWorkerId();
      const response = await fetch(`${config.backendUrl}/api/conversation/get-all-worker-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ worker_id }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if(data) setConversations(data.conversations);
    } catch (error) {
      console.error('Erreur récupération des conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllConversation();
  }, []);

  const filteredConversations = conversations.filter(
    (conv: any) =>
      conv.accepted === true &&
      conv.firstname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.messagerieContainer}>
         <Image
                  source={ require('../../assets/images/Messagerie.png') }
                  style={styles.messagerie}
                />
      </View>
      <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher"
        placeholderTextColor="#666"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
        <TouchableOpacity style={styles.searchButton} onPress={() => setModalVisible(true)}>
          <View style={styles.searchButton}>
            <FontAwesome name="user" size={25} color="#000" style={styles.searchIcon} />
            {pendingConversationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingConversationsCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <>
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonMessage key={idx} />
          ))}
        </>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}


      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Demandes de conversation</Text>

            {/* Afficher seulement les conversations non acceptées */}
            <FlatList
              data={conversations.filter((conv : any) => conv.accepted === false)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.modalMessageItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={{ uri: item.profile_picture_url }}
                      style={styles.profileImage}
                    />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.name}>{item.firstname}</Text>
                      <Text style={styles.message}>{item.message_text}</Text>
                    </View>
                  </View>

                  <View style={styles.modalButtonsRow}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => acceptConversation(item.id)}
                    >
                      <Text style={styles.buttonText}>Accepter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => console.log('Refuser non implémenté')}
                    >
                      <Text style={styles.buttonText}>Refuser</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messageContent: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  messagerie: {
    height: 80,
    width: '70%',
  },
  messagerieContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonTextWrapper: {
    flex: 1,
    height: 20,
    backgroundColor: '#DDD',
    marginLeft: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonText: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DDD',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent : 'center',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
    //backgroundColor : 'blue'
  },
  
  searchBar: {
    width : '90%',
    height: 40,
    color: '#000',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal : 10,
    marginRight : 10  
  },
  
  searchButton: {
    padding: 2,
    backgroundColor : '#F0F0F0',
    alignItems : 'center',
    justifyContent : 'center',
    borderRadius : 10,
    width : 35,
    height : 35
  },
  
  searchIcon: {
    
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  modalMessageItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  
  rejectButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  modalClose: {
    marginTop: 10,
    alignItems: 'center',
  },
  
  modalCloseText: {
    color: '#007BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  badge: {
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: 'red',
  borderRadius: 10,
  width: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},
badgeText: {
  color: 'white',
  fontSize: 12,
  fontWeight: 'bold',
},

});

export default ConversationScreen;

import ConfirmMessageModal from '@/components/ConfirmMessageModal';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import config from '../config.json';

import AsyncStorage from '@react-native-async-storage/async-storage';

//import axios from '../api/axios';

const newScreen = () => {
  const navigation = useNavigation()
  const [workers, setWorkers] = useState<any[]>([]);
  const [metiers, setMetiers] = useState<any[]>([]);
  const [mostLikedImages, setMostLikedImages] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);


  // Fetch Workers
  const getWorkers = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-workers-with-metiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data) setWorkers(data.workers);
    } catch (error) {
      console.error('Erreur lors de la récupération des workers :', error);
    }
  };

  // Récupère l'ID de l'utilisateur connecté (à adapter avec ton contexte ou AsyncStorage)
const getAccountId = async () => {
  try {
    const accountId = await AsyncStorage.getItem('account_id');
    return accountId;
  } catch (e) {
    console.error("Erreur récupération account_id:", e);
    return null;
  }
};

const goToChat = (conversation_id: any, contact_profile_picture_url: string) => {
  navigation.navigate({
    name: 'chat',
    params: {
      conversation_id,
      sender_id: selectedWorker?.account_id, // ou getAccountId()
      sender_type: 'user',
      contact_profile_picture_url,
    },
  } as never);
};

const checkConversation = async (worker: any) => {
  try {
    const person1_id = await getAccountId();
    const person2_id = worker.account_id; // l’id du worker
    const person1_type = 'user';
    const person2_type = 'worker';

    const response = await fetch(`${config.backendUrl}/api/conversation/check-conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person1_id, person2_id, person1_type, person2_type }),
    });
    const data = await response.json();

    if (data.exists) {
      goToChat(data.conversation_id, worker.profile_picture_url);
    } else {
      setSelectedWorker(worker);
      setConfirmModalVisible(true);
    }
  } catch (error) {
    console.error("Erreur checkConversation:", error);
  }
};

const createConversation = async () => {
  try {
    const person1_id = await getAccountId();
    const person2_id = selectedWorker?.account_id;
    const person1_type = 'user';
    const person2_type = 'worker';

    const response = await fetch(`${config.backendUrl}/api/conversation/create-conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person1_id, person2_id, person1_type, person2_type }),
    });

    const data = await response.json();
    setConfirmModalVisible(false);

    if (data) {
      goToChat(data.conversation.id, selectedWorker?.profile_picture_url);
    }
  } catch (error) {
    console.error("Erreur createConversation:", error);
  }
};

  // Fetch Metiers
  const fetchMetiers = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/get-job-of-the-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data) setMetiers(data.metiers || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des métiers :', error);
    }
  };

  // Fetch Liked Images
  const fetchMostLikedImages = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/uploads/most-liked-images`);
      const data = await response.json();
      if (data.success) {
        setMostLikedImages(data.most_liked_images);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des images populaires :', error);
    }
  };

  useEffect(() => {
    getWorkers();
    fetchMetiers();
    fetchMostLikedImages();
  }, []);

  const goToPrestationViewWithId = (id: any) => {
    navigation.navigate({
      name: 'prestationView',
      params: { id },
    } as never);
  };

  // ----- Render Workers -----
  const renderWorkerItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => goToPrestationViewWithId(item.metiers[0]?.id)}>
      <View style={styles.workerContainer}>
        <Image
          source={{ uri: item.profile_picture_url || "https://static.vecteezy.com/ti/vecteur-libre/p1/7033146-icone-de-profil-login-head-icon-vectoriel.jpg" }}
          style={styles.workerImage}
        />
        <Text style={styles.workerName}>{item.firstname}</Text>
      </View>
    </TouchableOpacity>
  );

  // ----- Render Metier -----
  const renderMetierItem = ({ item }: any) => (
    <View style={styles.metierContainer}>
      <Image
        source={{ uri: item.picture_url || 'https://cdn-icons-png.flaticon.com/512/91/91501.png' }}
        style={styles.metierImage}
      />
      <Text style={styles.metierText}>{item.name}</Text>
    </View>
  );

  // ----- Render Post -----
  const renderPostItem = ({ item }: any) => (
    <View style={styles.postContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image
          source={{ uri: item.profile_picture_url || "https://static.vecteezy.com/ti/vecteur-libre/p1/7033146-icone-de-profil-login-head-icon-vectoriel.jpg" }}
          style={styles.avatar}
        />
        <Text style={styles.postUsername}>{item.pseudo || "Utilisateur"}</Text>
      </View>

      {/* Image */}
      <TouchableOpacity onPress={() => goToPrestationViewWithId(item.id)}>
        <Image source={{ uri: item.image_url }} style={styles.postImage} />
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.postFooter}>
        <View style={styles.footerLeft}>
          <Ionicons name="heart-outline" size={22} color="red" style={styles.icon} />
          <TouchableOpacity onPress={() => checkConversation(item)}>
            <Ionicons name="chatbubble-outline" size={22} color="black" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.commandButton} onPress={() => goToPrestationViewWithId(item.id)}>
          <Text style={styles.commandText}>COMMANDER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
  <View style={{ flex: 1 }}>
    <FlatList
      data={mostLikedImages}
      renderItem={renderPostItem}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      onEndReached={() => setLoadingMore(true)}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View>
          {/* Top Workers */}
          <Text style={styles.sectionHeader}>Top Workers</Text>
          <FlatList
            data={workers}
            renderItem={renderWorkerItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, marginBottom: 20 }}
          />

          {/* Metiers */}
          <Text style={styles.sectionHeader}>Métiers du jour</Text>
          <FlatList
            data={metiers}
            renderItem={renderMetierItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10, marginBottom: 20 }}
          />

          <Text style={styles.sectionHeader}>Posts populaires</Text>
        </View>
      }
      ListFooterComponent={
        loadingMore ? <ActivityIndicator size="large" color="#00cc66" style={{ margin: 20 }} /> : null
      }
    />

    {/* ✅ Modal toujours disponible, au-dessus du FlatList */}
    <ConfirmMessageModal
      visible={isConfirmModalVisible}
      onConfirm={createConversation}
      onCancel={() => setConfirmModalVisible(false)}
    />
  </View>
);
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 10,
    marginHorizontal: 15,
  },
  workerContainer: {
    alignItems: "center",
    marginRight: 15,
  },
  workerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 5,
  },
  workerName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  metierContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "gold",
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
  },
  metierImage: {
    width: 25,
    height: 25,
    marginRight: 8,
  },
  metierText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#fff",
  },
  postContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee"
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },
  postUsername: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000"
  },
  postImage: {
    width: "100%",
    height: 350,
    resizeMode: "cover"
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  icon: {
    marginRight: 10
  },
  commandButton: {
    backgroundColor: "#00cc66",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  commandText: {
    color: "#fff",
    fontWeight: "bold"
  }
});

export default newScreen;
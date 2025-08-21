import { Feather } from "@expo/vector-icons"; // Icônes expo ou react-native-vector-icons
import * as Linking from 'expo-linking';
import React from "react";
import {
  Image,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ShareProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  route: { name: string };
  prestation_id: string | number;
};

const ShareProfileModal: React.FC<ShareProfileModalProps> = ({ visible, onClose, route, prestation_id }) => {
  const sharePrestation = async () => {
      try {
        const redirectUrl = Linking.createURL(route.name, {
           queryParams: { id: String(prestation_id) },
        });
        // iOS préfère `url`, Android utilise surtout `message`
        const url = redirectUrl;
        const title = 'Installer Starset et regarder cette prestation, elle peut vous intéresser';
        const result = await Share.share(
          Platform.select({
            ios: { url, message: undefined, title },
            android: { message: `${title}\n${url}` },
            default: { message: `${title}\n${url}` },
          })
        );
      } catch (e) {
        console.warn('Erreur de partage:', e);
      }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Illustration */}
          <Image
            source={require("../assets/images/partagerimage.png")}
            style={styles.image}
            resizeMode="contain"
          />

          {/* Titre */}
          <Text style={styles.title}>Partager votre profil</Text>

          {/* Texte explicatif */}
          <Text style={styles.description}>
            Grace à ce lien, partager votre profil sur les réseaux sociaux pour
            promouvoir vos services.
          </Text>

          {/* Bouton partager */}
          <TouchableOpacity style={styles.shareButton} onPress={sharePrestation}>
            <Feather name="share" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.shareText}>Partager</Text>
          </TouchableOpacity>

          {/* Bouton fermer (optionnel) */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ShareProfileModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: 300,
  },
  image: {
    width: "100%",
    height: 400,
    marginBottom: 20,
    backgroundSize: "cover",
    overflow: "hidden",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
    fontFamily: 'LexendDecaRegular',
  },
  shareButton: {
    flexDirection: "row",
    backgroundColor: "#00cc66",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  shareText: {
    color: "#fff",
    fontFamily: "LeagueSpartanBold",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeBtn: {
    marginTop: 15,
  },
  closeText: {
    color: "#888",
    fontSize: 14,
  },
});
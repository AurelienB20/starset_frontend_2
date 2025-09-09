import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Button, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MissingDocModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function MissingDocModal({ visible, onClose }: MissingDocModalProps) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
        <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>ℹ️  Document obligatoire manquant</Text>
            <Text style={styles.text}>
             Veuillez compléter votre profil en ajoutant les documents obligatoires pour pouvoir publier votre prestation.
             Vous pouvez le faire dans en cliquant sur le lien ci-dessous :
            </Text>
              <TouchableOpacity onPress={() => { navigation.navigate('modifyWorkerProfile' as never)}}>
               <Text style={{ color: '#00C851', textAlign: 'center', marginBottom: 20 }}> Accedez ici</Text>
             </TouchableOpacity>
            <Button title="Fermer" onPress={onClose} color="#00C851" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20
  },
  infoBtn: {
    backgroundColor: "#0ea5e9",
    padding: 12,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  title: { 
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily : 'LexendDeca'
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    lineHeight: 20,
    fontFamily : 'LexendDeca'
  },
});
import React from "react";
import { Button, Modal, StyleSheet, Text, View } from "react-native";

type NifInfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function NifInfoModal({ visible, onClose }: NifInfoModalProps) {
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
            <Text style={styles.title}>ℹ️  Numéro Fiscal (NIF)</Text>
            <Text style={styles.text}>
              Le NIF (numéro fiscal) est un identifiant obligatoire demandé par les impôts
              pour déclarer vos revenus.{"\n\n"}
              Vous le trouvez sur votre avis d’imposition ou dans votre espace{" "}
              <Text style={{ fontWeight: "bold" }}>impots.gouv.fr</Text>.{"\n\n"}
              Si vous êtes encore rattaché à vos parents, c’est leur numéro fiscal qui s’applique.
            </Text>

            <Button title="Fermer" onPress={onClose} color="#0ea5e9" />
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
    marginBottom: 10
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
    lineHeight: 20
  },
});
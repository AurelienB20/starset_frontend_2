import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import config from '../config.json';

interface Props {
  visible: boolean;
  onClose: () => void;
  prestation: any;
}

const handleChangePlannedPrestationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/mission/change-planned-prestation-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
  
      if (response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log(`Prestation mise à jour: ${data.message}`);
  
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

const PrestationConfirmation = ({ 
  visible,
  onClose,
  prestation,
}: Props) => {
    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Commencer la prestation</Text>
                   <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => onClose()}
                      >
                     <Text style={styles.modalButtonText}>Non</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                       style={styles.acceptButton}
                       onPress={() => {handleChangePlannedPrestationStatus(prestation.id, 'inProgress'); onClose()}}
                     >
                    <Text style={styles.modalButtonText}>Oui</Text>
                    </TouchableOpacity>
                   </View>
              </View>
            </View> 
        </Modal>
    );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalOptionText: {
    fontSize: 18,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#00cc66',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width : '45%'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
rejectButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 5,
    width : '45%',
    
    alignItems: 'center',
    marginHorizontal: 5,
  },
});

export default PrestationConfirmation;
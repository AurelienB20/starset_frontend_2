import { useEffect, useState } from "react";
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

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    console.log(`Prestation mise à jour: ${data.message}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
  }
};

const PrestationConfirmation = ({ visible, onClose, prestation }: Props) => {
  const [localStatus, setLocalStatus] = useState(prestation?.status || '');

  useEffect(() => {
    if (prestation?.status) {
      setLocalStatus(prestation.status);
    }
  }, [prestation]);

  if (!prestation) return null;

  const isStarted = localStatus === 'started';

  const handleStart = async () => {
    await handleChangePlannedPrestationStatus(prestation.id, 'started');
    setLocalStatus('started');
  };

  const handleFinish = async () => {
    await handleChangePlannedPrestationStatus(prestation.id, 'completed');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isStarted ? 'Bon travail à toi' : 'Commencer la prestation'}
          </Text>

          <Text style={styles.metierText}>{prestation.metier}</Text>

          {isStarted && (
            <Text style={styles.timeText}>
              {prestation.start_time} → {prestation.end_time}
            </Text>
          )}

          <View style={styles.modalButtons}>
            {isStarted ? (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleFinish}
              >
                <Text style={styles.modalButtonText}>La prestation est finie</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={onClose}
                >
                  <Text style={styles.modalButtonText}>Non</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={handleStart}
                >
                  <Text style={styles.modalButtonText}>Oui</Text>
                </TouchableOpacity>
              </>
            )}
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  metierText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  timeText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
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
    minWidth: '45%',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: '45%',
  },
});

export default PrestationConfirmation;

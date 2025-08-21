import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type Certification = {
  title: string;
  date: string;
  institution: string;
  description: string;
  images?: string[];
};

type Props = {
  certification: Certification;
};

const CertificationCard: React.FC<Props> = ({ certification }) => {
  const hasImages = certification.images && certification.images.length > 0;

  return (
    <View style={styles.certificationCardUpdated}>
      <View style={styles.certificationHeader}>
        {/* Colonne images */}
        <View
          style={[
            styles.certificationImagesColumn,
            {
              width: hasImages ? 80 : 0,
              marginRight: hasImages ? 10 : 0,
            },
          ]}
        >
          {certification.images?.length === 3 ? (
            <>
              <Image
                source={{ uri: certification.images[0] }}
                style={styles.certificationBigImage}
              />
              <View style={styles.certificationSmallImagesRow}>
                <Image
                  source={{ uri: certification.images[1] }}
                  style={styles.certificationSmallImage}
                />
                <Image
                  source={{ uri: certification.images[2] }}
                  style={styles.certificationSmallImage}
                />
              </View>
            </>
          ) : (
            certification.images?.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={styles.certificationMiniImage}
              />
            ))
          )}
        </View>

        {/* Colonne texte */}
        <View style={styles.certificationTextContent}>
          <Text style={styles.certificationTitle}>{certification.title}</Text>
          <Text style={styles.certificationDate}>{certification.date}</Text>
          <Text style={styles.certificationInstitution}>
            <Text style={{ fontStyle: 'italic', color : 'black' }}>{certification.institution}</Text>
          </Text>
          <Text style={styles.certificationDescription}>{certification.description}</Text>
        </View>
      </View>
      <View style={styles.separator} />
    </View>
  );
};

const styles = StyleSheet.create({
  certificationCardUpdated: {
    padding: 15,
    marginBottom: 10,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  certificationImagesColumn: {
    flexShrink: 0,
  },
  certificationBigImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginBottom: 5,
  },
  certificationSmallImagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  certificationSmallImage: {
    width: '48%',
    aspectRatio: 16 / 9,
  },
  certificationMiniImage: {
    width: 80,
    height: 60,
    borderRadius: 6,
    marginBottom: 5,
  },
  certificationTextContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  certificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flexShrink: 1,
  },
  certificationDate: {
    fontSize: 12,
    color: '#555',
  },
  certificationInstitution: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  certificationDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 10,
  },
});

export default CertificationCard;

import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';

const PdfViewer = () => {
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      const fileUri = FileSystem.documentDirectory + 'politique_de_confidentialite.pdf';

      // Vérifie si le fichier existe déjà
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        // Télécharge à partir d'un asset distant temporairement (ou met le fichier dans assets via download)
        await FileSystem.downloadAsync(
          'https://api.starsetfrance.com/media/assets/politique_de_confidentialite.pdf', // héberge le PDF quelque part temporairement
          fileUri
        );
      }

      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('PDF base64 length:', base64.length);

      setPdfUri(`data:application/pdf;base64,${base64}`);
    };

    loadPdf();
  }, []);

  if (!pdfUri) return null;

  return (
    <WebView
  source={{
    uri: 'https://docs.google.com/gview?embedded=true&url=https://api.starsetfrance.com/media/assets/politique_de_confidentialite.pdf'
  }}
  style={{ flex: 1 }}
/>
  );
};

export default PdfViewer;

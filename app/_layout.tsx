import { AllWorkerPrestationProvider, CartProvider, CurrentWorkerPrestationProvider, UserConversationProvider, UserProvider, WorkerConversationProvider } from '@/context/userContext';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Stack } from 'expo-router';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import config from '../config.json';

function RootLayoutNav() {
  
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'white', // Personnalisez ici
      text: 'black',
    },
  };

  return (
    <PaperProvider>
    <CartProvider>
    <StripeProvider
      publishableKey={config.publishableKeyTest} // <- ta clé publique Stripe ici
    >
      <UserProvider>
        <WorkerConversationProvider>
          <UserConversationProvider>
            <AllWorkerPrestationProvider>
              <CurrentWorkerPrestationProvider>
                <ThemeProvider value={MyTheme}>
                <Stack
                  initialRouteName="index"
                  screenOptions={{
                    headerTitle: '',
                    headerBackTitle: ''
                  }}
                >
                    
                    <Stack.Screen name="starsetScreen"   options={{ headerShown: false }}/>
                    <Stack.Screen name="index"   options={{ headerShown: false }}/>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled:false}}/>
                    <Stack.Screen name="(tabs_worker)" options={{ headerShown: false , gestureEnabled:false}}/>
                    <Stack.Screen name="connexion" options={{ headerShown: false }}/>
                    <Stack.Screen name="prestationView"  options={{ headerShown : false }} />
                    <Stack.Screen name="paymentMethod"  />
                    <Stack.Screen name="modifyAccount"  />
                    <Stack.Screen name="modifyPseudo"  options={{ headerShown : false }} />
                    <Stack.Screen name="testImage"  options={{ headerShown : false }} />
                    <Stack.Screen name="metierList"  options={{ headerShown : false }} />
                    <Stack.Screen name="workerByField"  options={{ headerShown : false }} />
                    
                  </Stack>
                </ThemeProvider>
              </CurrentWorkerPrestationProvider>
            </AllWorkerPrestationProvider>
          </UserConversationProvider>
        </WorkerConversationProvider>
      </UserProvider>
    </StripeProvider>
    </CartProvider>
    </PaperProvider>
  );
}

export default RootLayoutNav;
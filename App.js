import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function App() {

  const init = async () => {

  }

  useEffect(() => {
    init();
  }, [])

  return (
    <View style={styles.sectionContainer}>

      <TouchableOpacity
        onPress={async () => {
          // Verify user credentials before asking them to enable Face ID
          const { userId } = await verifyUserCredentials();

          const rnBiometrics = new ReactNativeBiometrics();

          const { available, biometryType } =
            await rnBiometrics.isSensorAvailable();

          if (available && biometryType === BiometryTypes.FaceID) {
            Alert.alert(
              'Face ID',
              'Would you like to enable Face ID authentication for the next time?',
              [
                {
                  text: 'Yes please',
                  onPress: async () => {
                    const { publicKey } = await rnBiometrics.createKeys();

                    // `publicKey` has to be saved on the user's entity in the database
                    await sendPublicKeyToServer({ userId, publicKey });

                    // save `userId` in the local storage to use it during Face ID authentication
                    await AsyncStorage.setItem('userId', userId);
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ],
            );
          }
        }}>
        <View style={styles.btn}>
          <Text style={styles.btnText}>Sign in</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          const rnBiometrics = new ReactNativeBiometrics();

          const { available, biometryType } =
            await rnBiometrics.isSensorAvailable();

          if (!available || biometryType !== BiometryTypes.FaceID) {
            Alert.alert(
              'Oops!',
              'Face ID is not available on this device.',
            );
            return;
          }

          const userId = await AsyncStorage.getItem('userId');

          if (!userId) {
            Alert.alert(
              'Oops!',
              'You have to sign in using your credentials first to enable Face ID.',
            );
            return;
          }

          const timestamp = Math.round(
            new Date().getTime() / 1000,
          ).toString();
          const payload = `${userId}__${timestamp}`;

          const { success, signature } = await rnBiometrics.createSignature(
            {
              promptMessage: 'Sign in',
              payload,
            },
          );

          if (!success) {
            Alert.alert(
              'Oops!',
              'Something went wrong during authentication with Face ID. Please try again.',
            );
            return;
          }

          // const { status, message } = await verifySignatureWithServer({
          //   signature,
          //   payload,
          // });
          console.log(signature);
          console.log(payload);

          if (status !== 'success') {
            Alert.alert('Oops!', message);
            return;
          }

          Alert.alert('Success!', 'You are successfully authenticated!');
        }}>
        <View style={styles.btnSecondary}>

          <Text style={styles.btnText}>Face ID</Text>

          <View style={{ width: 34 }} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  takePhotoButton: {
    width: 200,
    height: 50,
    marginBottom: 30,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnText: {
    color: 'black',
    fontSize: 16
  }
});


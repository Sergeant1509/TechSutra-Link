import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {
  getBluetoothState,
  startBleScan,
  stopBleScan,
} from '../services/bleService';

import { COLORS } from '../theme/colors';

export default function BleTestScreen() {
  const [bluetoothState, setBluetoothState] = useState('Checking...');
  const [permissionStatus, setPermissionStatus] = useState('Not checked');
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    initializeBle();

    return () => {
      stopBleScan();
    };
  }, []);

  const requestBlePermissions = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const apiLevel = Number(Platform.Version);

      console.log('Android API level:', apiLevel);

      if (apiLevel >= 31) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ];

        const result =
          await PermissionsAndroid.requestMultiple(
            permissions
          );

        console.log(
          'BLE permission result:',
          result
        );

        const scanGranted =
          result[
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
          ] === PermissionsAndroid.RESULTS.GRANTED;

        const connectGranted =
          result[
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
          ] === PermissionsAndroid.RESULTS.GRANTED;

        if (scanGranted && connectGranted) {
          setPermissionStatus('Granted');
          return true;
        }

        setPermissionStatus('Denied');

        Alert.alert(
          'Bluetooth Permission Required',
          'Please allow Nearby devices permission for TechSutra Link in Android Settings.'
        );

        return false;
      }

      const locationResult =
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

      console.log(
        'Location permission result:',
        locationResult
      );

      const granted =
        locationResult ===
        PermissionsAndroid.RESULTS.GRANTED;

      setPermissionStatus(
        granted ? 'Granted' : 'Denied'
      );

      return granted;
    } catch (error) {
      console.log(
        'BLE permission error:',
        error
      );

      setPermissionStatus('Error');

      Alert.alert(
        'Permission Error',
        error?.message ||
          'Unable to request Bluetooth permissions.'
      );

      return false;
    }
  };

  const initializeBle = async () => {
    try {
      const permissionGranted =
        await requestBlePermissions();

      const state = await getBluetoothState();

      console.log(
        'Bluetooth state:',
        state
      );

      setBluetoothState(state);

      if (!permissionGranted) {
        return;
      }
    } catch (error) {
      console.log(
        'BLE initialization failed:',
        error
      );

      setBluetoothState('Error');
    }
  };

  const startScan = async () => {
    try {
      const permissionGranted =
        await requestBlePermissions();

      if (!permissionGranted) {
        return;
      }

      const state =
        await getBluetoothState();

      console.log(
        'Bluetooth state before scan:',
        state
      );

      if (state !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth Required',
          `Bluetooth state: ${state}\n\nPlease turn Bluetooth on and try again.`
        );

        return;
      }

      setDevices([]);
      setScanning(true);

      startBleScan((device) => {
        console.log(
          'BLE device found:',
          device
        );

        setDevices((currentDevices) => {
          const existingIndex =
            currentDevices.findIndex(
              (item) =>
                item.id === device.id
            );

          if (existingIndex === -1) {
            return [
              ...currentDevices,
              device,
            ];
          }

          const updatedDevices = [
            ...currentDevices,
          ];

          updatedDevices[existingIndex] =
            device;

          return updatedDevices;
        });
      });

      setTimeout(() => {
        stopBleScan();
        setScanning(false);
      }, 15000);
    } catch (error) {
      console.log(
        'BLE scan failed:',
        error
      );

      setScanning(false);

      Alert.alert(
        'BLE Scan Error',
        error?.message ||
          'Unable to start BLE scan.'
      );
    }
  };

  const stopScan = () => {
    stopBleScan();
    setScanning(false);
  };

  const renderDevice = ({ item }) => {
    return (
      <View style={styles.deviceCard}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>
            {item.name}
          </Text>

          <Text style={styles.deviceId}>
            {item.id}
          </Text>
        </View>

        <View style={styles.rssiContainer}>
          <Text style={styles.rssi}>
            {item.rssi ?? '--'}
          </Text>

          <Text style={styles.rssiLabel}>
            RSSI
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        BLE Test
      </Text>

      <Text style={styles.subtitle}>
        TechSutra Link Bluetooth proximity test
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>
          Bluetooth Status
        </Text>

        <Text style={styles.statusValue}>
          {bluetoothState}
        </Text>

        <Text style={styles.permissionLabel}>
          Permission: {permissionStatus}
        </Text>
      </View>

      {!scanning ? (
        <TouchableOpacity
          style={styles.button}
          onPress={startScan}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            Scan for BLE Devices
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopScan}
          activeOpacity={0.8}
        >
          <Text style={styles.stopButtonText}>
            Stop Scan
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          Nearby Devices
        </Text>

        <Text style={styles.deviceCount}>
          {devices.length}
        </Text>
      </View>

      {devices.length === 0 &&
      !scanning ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No BLE devices found
          </Text>

          <Text style={styles.emptyText}>
            Turn on Bluetooth and start a scan.
          </Text>
        </View>
      ) : null}

      {scanning &&
      devices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            Scanning...
          </Text>

          <Text style={styles.emptyText}>
            Looking for nearby Bluetooth devices.
          </Text>
        </View>
      ) : null}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.navy,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  statusCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statusLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  statusValue: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
  },

  permissionLabel: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  button: {
    marginTop: 18,
    backgroundColor: COLORS.navy,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  stopButton: {
    marginTop: 18,
    backgroundColor: COLORS.danger,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  stopButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  resultsHeader: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },

  deviceCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '800',
    color: COLORS.navy,
  },

  list: {
    paddingBottom: 30,
  },

  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },

  deviceInfo: {
    flex: 1,
    paddingRight: 12,
  },

  deviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
  },

  deviceId: {
    marginTop: 5,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  rssiContainer: {
    alignItems: 'center',
    minWidth: 55,
  },

  rssi: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
  },

  rssiLabel: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
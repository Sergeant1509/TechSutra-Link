import { BleManager } from 'react-native-ble-plx';

const bleManager = new BleManager();

export const getBleManager = () => {
  return bleManager;
};

export const getBluetoothState = async () => {
  try {
    const state = await bleManager.state();
    return state;
  } catch (error) {
    console.log('BLE state error:', error);
    throw error;
  }
};

export const startBleScan = (onDeviceFound) => {
  try {
    bleManager.startDeviceScan(
      null,
      {
        allowDuplicates: false,
      },
      (error, device) => {
        if (error) {
          console.log('BLE scan error:', error);
          return;
        }

        if (!device) {
          return;
        }

        onDeviceFound({
          id: device.id,
          name: device.name || device.localName || 'Unknown device',
          rssi: device.rssi,
        });
      }
    );
  } catch (error) {
    console.log('BLE start scan error:', error);
  }
};

export const stopBleScan = () => {
  try {
    bleManager.stopDeviceScan();
  } catch (error) {
    console.log('BLE stop scan error:', error);
  }
};
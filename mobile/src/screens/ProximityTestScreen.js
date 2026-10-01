import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import {
  createProximityVerifier,
} from '../services/proximityService';

import { COLORS } from '../theme/colors';

export default function ProximityTestScreen() {
  const verifier = useRef(
    createProximityVerifier({
      requiredProximityMs: 20 * 1000,
      gracePeriodMs: 5 * 1000,
    })
  ).current;

  const [status, setStatus] = useState(
    verifier.getStatus()
  );

  const [currentRssi, setCurrentRssi] =
    useState(null);

  const [running, setRunning] =
    useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      stopTest();
    };
  }, []);

  const updateStatus = () => {
    setStatus(
      verifier.getStatus()
    );
  };

  const addReading = (rssi) => {
    setCurrentRssi(rssi);

    const result =
      verifier.addRssi(rssi);

    setStatus(result);
  };

  const startTest = () => {
    verifier.resetVerification();

    setCurrentRssi(null);
    setStatus(
      verifier.getStatus()
    );

    setRunning(true);

    timerRef.current =
      setInterval(() => {
        updateStatus();
      }, 1000);
  };

  const stopTest = () => {
    if (timerRef.current) {
      clearInterval(
        timerRef.current
      );

      timerRef.current = null;
    }

    setRunning(false);
  };

  const resetTest = () => {
    stopTest();

    verifier.resetVerification();

    setCurrentRssi(null);

    setStatus(
      verifier.getStatus()
    );
  };

  const getZoneLabel = () => {
    switch (status.zone) {
      case 'valid':
        return 'VALID PROXIMITY';

      case 'grace':
        return 'GRACE ZONE';

      case 'lost':
        return 'PROXIMITY LOST';

      default:
        return 'WAITING';
    }
  };

  const getZoneColor = () => {
    switch (status.zone) {
      case 'valid':
        return COLORS.success;

      case 'grace':
        return COLORS.warning;

      case 'lost':
        return COLORS.danger;

      default:
        return COLORS.textSecondary;
    }
  };

  const formatSeconds = (
    milliseconds
  ) => {
    return Math.ceil(
      milliseconds / 1000
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
    >
      <Text style={styles.title}>
        Proximity Engine Test
      </Text>

      <Text style={styles.subtitle}>
        TechSutra Link RSSI verification
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>
          Current Zone
        </Text>

        <Text
          style={[
            styles.zone,
            {
              color: getZoneColor(),
            },
          ]}
        >
          {getZoneLabel()}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Current RSSI
        </Text>

        <Text style={styles.bigValue}>
          {currentRssi !== null
            ? `${currentRssi} dBm`
            : '--'}
        </Text>

        <Text style={styles.info}>
          Valid: ≥ -65 dBm
        </Text>

        <Text style={styles.info}>
          Grace: -66 to -69 dBm
        </Text>

        <Text style={styles.info}>
          Lost: ≤ -70 dBm
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Verification
        </Text>

        <Text style={styles.progress}>
          {Math.floor(
            status.proximityDurationMs /
              1000
          )}{' '}
          sec
        </Text>

        <Text style={styles.info}>
          Remaining:{' '}
          {formatSeconds(
            status.remainingTimeMs
          )}{' '}
          sec
        </Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  100,
                  (
                    status
                      .proximityDurationMs /
                    status
                      .requiredProximityMs
                  ) *
                    100
                )}%`,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.verificationStatus,
            {
              color:
                status.isVerified
                  ? COLORS.success
                  : COLORS.textSecondary,
            },
          ]}
        >
          {status.isVerified
            ? '✓ VERIFIED'
            : 'Not verified'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Simulate RSSI
        </Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.validButton}
            onPress={() =>
              addReading(-55)
            }
          >
            <Text style={styles.buttonText}>
              -55 dBm
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.validButton}
            onPress={() =>
              addReading(-65)
            }
          >
            <Text style={styles.buttonText}>
              -65 dBm
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.graceButton}
            onPress={() =>
              addReading(-68)
            }
          >
            <Text style={styles.buttonText}>
              -68 dBm
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lostButton}
            onPress={() =>
              addReading(-72)
            }
          >
            <Text style={styles.buttonText}>
              -72 dBm
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={
          running
            ? stopTest
            : startTest
        }
      >
        <Text style={styles.startButtonText}>
          {running
            ? 'Stop Timer'
            : 'Start Test'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetTest}
      >
        <Text style={styles.resetButtonText}>
          Reset
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  title: {
    fontSize: 27,
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
    padding: 20,
    borderRadius: 16,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
  },

  statusLabel: {
    fontSize: 13,
    color:
      COLORS.textSecondary,
  },

  zone: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
  },

  card: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },

  bigValue: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.navy,
  },

  progress: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.navy,
  },

  info: {
    marginTop: 6,
    fontSize: 13,
    color:
      COLORS.textSecondary,
  },

  progressBackground: {
    height: 10,
    marginTop: 18,
    borderRadius: 5,
    backgroundColor:
      COLORS.border,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor:
      COLORS.gold,
  },

  verificationStatus: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  buttonGrid: {
    marginTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:
      'space-between',
  },

  validButton: {
    width: '48%',
    marginBottom: 10,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor:
      COLORS.navy,
    alignItems: 'center',
  },

  graceButton: {
    width: '48%',
    marginBottom: 10,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor:
      COLORS.warning,
    alignItems: 'center',
  },

  lostButton: {
    width: '48%',
    marginBottom: 10,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor:
      COLORS.danger,
    alignItems: 'center',
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  startButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor:
      COLORS.navy,
    alignItems: 'center',
  },

  startButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  resetButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
  },

  resetButtonText: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '700',
  },
});
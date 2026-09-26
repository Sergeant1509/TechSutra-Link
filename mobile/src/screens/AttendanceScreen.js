import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../theme/colors';

export default function AttendanceScreen({ navigation }) {
  const [status, setStatus] = useState('ready');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;

    if (status === 'verifying') {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 10) {
            clearInterval(interval);
            setStatus('success');
            return prev;
          }

          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const startAttendance = () => {
    setSeconds(0);
    setStatus('searching');

    setTimeout(() => {
      setStatus('detected');

      setTimeout(() => {
        setStatus('verifying');
      }, 1500);
    }, 2000);
  };

  const resetAttendance = () => {
    setSeconds(0);
    setStatus('ready');
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'searching':
        return 'Searching for Host';
      case 'detected':
        return 'Host Detected';
      case 'verifying':
        return 'Verifying Presence';
      case 'success':
        return 'Attendance Marked';
      default:
        return 'Ready for Attendance';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'searching':
        return 'Looking for the meeting host nearby...';

      case 'detected':
        return 'Host phone detected nearby. Stay within the proximity zone.';

      case 'verifying':
        return 'Keep your phone nearby while we verify your presence.';

      case 'success':
        return 'Your attendance has been successfully recorded.';

      default:
        return 'Join the active meeting and mark your attendance using proximity.';
    }
  };

  const getStatusColor = () => {
    if (status === 'success') return COLORS.success;
    if (status === 'verifying') return COLORS.goldDark;
    if (status === 'detected') return COLORS.blue || '#3B82F6';

    return COLORS.navy;
  };

  const progress =
    status === 'success'
      ? 100
      : status === 'verifying'
      ? Math.min((seconds / 10) * 100, 100)
      : status === 'detected'
      ? 25
      : status === 'searching'
      ? 10
      : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Attendance</Text>
          <Text style={styles.headerSubtitle}>TechSutra Weekly Meeting</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Meeting Info */}
        <View style={styles.meetingCard}>
          <View style={styles.meetingIcon}>
            <Text style={styles.meetingIconText}>TS</Text>
          </View>

          <View style={styles.meetingInfo}>
            <Text style={styles.meetingTitle}>
              TechSutra Weekly Meeting
            </Text>

            <Text style={styles.meetingDetails}>
              Today • 4:00 PM
            </Text>

            <Text style={styles.meetingLocation}>
              TechSutra Club Room
            </Text>
          </View>
        </View>

        {/* Proximity Area */}
        <View style={styles.proximityContainer}>
          <View
            style={[
              styles.radarOuter,
              {
                borderColor: getStatusColor(),
              },
            ]}
          >
            <View
              style={[
                styles.radarMiddle,
                {
                  borderColor: getStatusColor(),
                },
              ]}
            >
              <View
                style={[
                  styles.radarInner,
                  {
                    backgroundColor: getStatusColor(),
                  },
                ]}
              >
                <Text style={styles.radarText}>
                  {status === 'success'
                    ? '✓'
                    : status === 'ready'
                    ? '5m'
                    : '•'}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={[
              styles.statusTitle,
              { color: getStatusColor() },
            ]}
          >
            {getStatusTitle()}
          </Text>

          <Text style={styles.statusText}>
            {getStatusText()}
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              Verification Progress
            </Text>

            <Text style={styles.progressValue}>
              {Math.round(progress)}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: getStatusColor(),
                },
              ]}
            />
          </View>
        </View>

        {/* Timer */}
        {(status === 'verifying' || status === 'success') && (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>
              Verification Time
            </Text>

            <Text style={styles.timer}>
              00:{String(seconds).padStart(2, '0')}
            </Text>

            <Text style={styles.timerSubtext}>
              Continuous proximity verification
            </Text>
          </View>
        )}

        {/* Action */}
        {status === 'ready' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={startAttendance}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              Start Attendance
            </Text>
          </TouchableOpacity>
        )}

        {status === 'searching' && (
          <View style={styles.waitingButton}>
            <Text style={styles.waitingButtonText}>
              Searching...
            </Text>
          </View>
        )}

        {status === 'detected' && (
          <View style={styles.detectedButton}>
            <Text style={styles.detectedButtonText}>
              Host Detected
            </Text>
          </View>
        )}

        {status === 'verifying' && (
          <View style={styles.verifyingButton}>
            <Text style={styles.verifyingButtonText}>
              Verifying Presence...
            </Text>
          </View>
        )}

        {status === 'success' && (
          <>
            <View style={styles.successCard}>
              <Text style={styles.successIcon}>✓</Text>

              <View style={styles.successContent}>
                <Text style={styles.successTitle}>
                  Attendance Confirmed
                </Text>

                <Text style={styles.successText}>
                  You are marked Present for this meeting.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={resetAttendance}
            >
              <Text style={styles.secondaryButtonText}>
                Test Again
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* How It Works */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            How proximity attendance works
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>1</Text>
            </View>

            <Text style={styles.infoText}>
              The meeting host starts an attendance session.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>2</Text>
            </View>

            <Text style={styles.infoText}>
              Your phone detects the host using nearby-device
              proximity.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>3</Text>
            </View>

            <Text style={styles.infoText}>
              Your presence is continuously verified before
              attendance is recorded.
            </Text>
          </View>
        </View>

        {/* Important Note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>
            ⚠ Proximity requirement
          </Text>

          <Text style={styles.noteText}>
            Keep your phone near the meeting host during the
            verification period. The final system will use
            Bluetooth proximity rather than relying only on GPS.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backText: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 34,
    marginTop: -4,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#C9D4E5',
    fontSize: 12,
    marginTop: 3,
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  meetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },

  meetingIcon: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  meetingIconText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '900',
  },

  meetingInfo: {
    flex: 1,
  },

  meetingTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },

  meetingDetails: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },

  meetingLocation: {
    color: COLORS.textLight,
    fontSize: 11,
    marginTop: 2,
  },

  proximityContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 28,
  },

  radarOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.35,
  },

  radarMiddle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radarInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radarText: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '900',
  },

  statusTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginTop: 18,
  },

  statusText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 320,
  },

  progressSection: {
    marginBottom: 18,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  progressLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },

  progressValue: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  progressBackground: {
    height: 9,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  timerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },

  timerLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },

  timer: {
    color: COLORS.navy,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },

  timerSubtext: {
    color: COLORS.textLight,
    fontSize: 10,
    marginTop: 3,
  },

  primaryButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  waitingButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#E8EDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  waitingButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '800',
  },

  detectedButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  detectedButtonText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '800',
  },

  verifyingButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#FFF6D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  verifyingButtonText: {
    color: COLORS.goldDark,
    fontSize: 15,
    fontWeight: '800',
  },

  successCard: {
    backgroundColor: '#ECFDF3',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },

  successIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.success,
    color: COLORS.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 24,
    fontWeight: '900',
    marginRight: 13,
  },

  successContent: {
    flex: 1,
  },

  successTitle: {
    color: '#166534',
    fontSize: 15,
    fontWeight: '800',
  },

  successText: {
    color: '#15803D',
    fontSize: 11,
    marginTop: 3,
  },

  secondaryButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  secondaryButtonText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '700',
  },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  numberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  numberText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
  },

  infoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    paddingTop: 3,
  },

  noteCard: {
    backgroundColor: '#FFF9E8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F6E5A8',
  },

  noteTitle: {
    color: '#8A6500',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },

  noteText: {
    color: '#806B2A',
    fontSize: 11,
    lineHeight: 17,
  },
});
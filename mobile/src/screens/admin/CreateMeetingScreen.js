import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../theme/colors';
import { createMeeting } from '../../services/meetingStore';

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const pad = (number) => String(number).padStart(2, '0');

const formatDate = (date) => {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime12Hour = (date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();

  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${pad(minutes)} ${period}`;
};

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export default function CreateMeetingScreen({ navigation }) {
  const [meetingMode, setMeetingMode] = useState('schedule');

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');

  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    return date;
  });

  const [selectedTime, setSelectedTime] = useState(() => {
    const date = new Date();

    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() + 1);

    return date;
  });

  const [duration, setDuration] = useState(30);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);

    if (!date || event?.type === 'dismissed') {
      return;
    }

    const newDate = new Date(date);

    newDate.setHours(12, 0, 0, 0);

    setSelectedDate(newDate);
  };

  const handleTimeChange = (event, date) => {
    setShowTimePicker(false);

    if (!date || event?.type === 'dismissed') {
      return;
    }

    const newTime = new Date(selectedTime);

    newTime.setHours(
      date.getHours(),
      date.getMinutes(),
      0,
      0
    );

    setSelectedTime(newTime);
  };

  const getScheduledDateTime = () => {
    const meetingDateTime = new Date(selectedDate);

    meetingDateTime.setHours(
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      0,
      0
    );

    return meetingDateTime;
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert(
        'Meeting Title Required',
        'Please enter a meeting title.'
      );

      return false;
    }

    if (!location.trim()) {
      Alert.alert(
        'Location Required',
        'Please enter the meeting location.'
      );

      return false;
    }

    if (meetingMode === 'schedule') {
      const scheduledDateTime =
        getScheduledDateTime();

      if (scheduledDateTime <= new Date()) {
        Alert.alert(
          'Invalid Meeting Time',
          'Please select a future date and time.'
        );

        return false;
      }
    }

    return true;
  };

  const handleCreateMeeting = () => {
    if (!validateForm()) {
      return;
    }

    /*
     * START NOW
     */
    if (meetingMode === 'active') {
      const now = new Date();

      const meeting = createMeeting({
        title: title.trim(),
        date: formatDate(now),
        time: formatTime12Hour(now),
        location: location.trim(),
        duration,
        mode: 'active',
        startAt: now.toISOString(),
      });

      navigation.replace('LiveAttendance', {
        meetingId: meeting.id,
      });

      return;
    }

    /*
     * SCHEDULE MEETING
     */
    const scheduledDateTime =
      getScheduledDateTime();

    const meeting = createMeeting({
      title: title.trim(),
      date: formatDate(scheduledDateTime),
      time: formatTime12Hour(scheduledDateTime),
      location: location.trim(),
      duration,
      mode: 'scheduled',
      startAt: scheduledDateTime.toISOString(),
    });

    Alert.alert(
      'Meeting Scheduled',
      `${meeting.title}\n\n${formatDate(
        scheduledDateTime
      )} at ${formatTime12Hour(
        scheduledDateTime
      )}`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.navy}
            />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Create Meeting
            </Text>

            <Text style={styles.headerSubtitle}>
              Organize your TechSutra meeting
            </Text>
          </View>
        </View>

        {/* MEETING TYPE */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Meeting Type
          </Text>

          <View style={styles.modeContainer}>
            <Pressable
              style={[
                styles.modeCard,
                meetingMode === 'schedule' &&
                  styles.modeCardActive,
              ]}
              onPress={() =>
                setMeetingMode('schedule')
              }
            >
              <View
                style={[
                  styles.modeIcon,
                  meetingMode === 'schedule' &&
                    styles.modeIconActive,
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={
                    meetingMode === 'schedule'
                      ? COLORS.white
                      : COLORS.navy
                  }
                />
              </View>

              <View style={styles.modeTextContainer}>
                <Text
                  style={[
                    styles.modeTitle,
                    meetingMode === 'schedule' &&
                      styles.modeTitleActive,
                  ]}
                >
                  Schedule Meeting
                </Text>

                <Text
                  style={[
                    styles.modeDescription,
                    meetingMode === 'schedule' &&
                      styles.modeDescriptionActive,
                  ]}
                >
                  Plan a meeting for later
                </Text>
              </View>

              {meetingMode === 'schedule' && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={COLORS.gold}
                />
              )}
            </Pressable>

            <Pressable
              style={[
                styles.modeCard,
                meetingMode === 'active' &&
                  styles.modeCardActive,
              ]}
              onPress={() =>
                setMeetingMode('active')
              }
            >
              <View
                style={[
                  styles.modeIcon,
                  meetingMode === 'active' &&
                    styles.modeIconActive,
                ]}
              >
                <Ionicons
                  name="play-outline"
                  size={22}
                  color={
                    meetingMode === 'active'
                      ? COLORS.white
                      : COLORS.navy
                  }
                />
              </View>

              <View style={styles.modeTextContainer}>
                <Text
                  style={[
                    styles.modeTitle,
                    meetingMode === 'active' &&
                      styles.modeTitleActive,
                  ]}
                >
                  Start Now
                </Text>

                <Text
                  style={[
                    styles.modeDescription,
                    meetingMode === 'active' &&
                      styles.modeDescriptionActive,
                  ]}
                >
                  Start attendance immediately
                </Text>
              </View>

              {meetingMode === 'active' && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={COLORS.gold}
                />
              )}
            </Pressable>
          </View>
        </View>

        {/* MEETING DETAILS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Meeting Details
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Meeting Title
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="create-outline"
                size={20}
                color={COLORS.textSecondary}
              />

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. TechSutra Weekly Meeting"
                placeholderTextColor={
                  COLORS.textLight
                }
                style={styles.input}
                maxLength={80}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Location
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={20}
                color={COLORS.textSecondary}
              />

              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Seminar Hall"
                placeholderTextColor={
                  COLORS.textLight
                }
                style={styles.input}
                maxLength={100}
              />
            </View>
          </View>
        </View>

        {/* SCHEDULE */}

        {meetingMode === 'schedule' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Schedule
            </Text>

            {/* DATE */}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Meeting Date
              </Text>

              <Pressable
                style={styles.selectionCard}
                onPress={() =>
                  setShowDatePicker(true)
                }
              >
                <View style={styles.selectionIcon}>
                  <Ionicons
                    name="calendar"
                    size={21}
                    color={COLORS.navy}
                  />
                </View>

                <View
                  style={styles.selectionTextContainer}
                >
                  <Text style={styles.selectionLabel}>
                    Date
                  </Text>

                  <Text style={styles.selectionValue}>
                    {formatDate(selectedDate)}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textLight}
                />
              </Pressable>
            </View>

            {/* TIME */}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Meeting Time
              </Text>

              <Pressable
                style={styles.selectionCard}
                onPress={() =>
                  setShowTimePicker(true)
                }
              >
                <View style={styles.selectionIcon}>
                  <Ionicons
                    name="time"
                    size={21}
                    color={COLORS.navy}
                  />
                </View>

                <View
                  style={styles.selectionTextContainer}
                >
                  <Text style={styles.selectionLabel}>
                    Time
                  </Text>

                  <Text style={styles.selectionValue}>
                    {formatTime12Hour(selectedTime)}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textLight}
                />
              </Pressable>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                minimumDate={today}
                display={
                  Platform.OS === 'ios'
                    ? 'spinner'
                    : 'default'
                }
                onChange={handleDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={
                  Platform.OS === 'ios'
                    ? 'spinner'
                    : 'default'
                }
                onChange={handleTimeChange}
              />
            )}

            {isSameDay(selectedDate, today) && (
              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={19}
                  color={COLORS.navy}
                />

                <Text style={styles.infoText}>
                  If you select today, the meeting time
                  must be later than the current time.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* DURATION */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Meeting Duration
          </Text>

          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.map((item) => {
              const selected = duration === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.durationOption,
                    selected &&
                      styles.durationOptionActive,
                  ]}
                  onPress={() =>
                    setDuration(item)
                  }
                >
                  <Text
                    style={[
                      styles.durationValue,
                      selected &&
                        styles.durationValueActive,
                    ]}
                  >
                    {item}
                  </Text>

                  <Text
                    style={[
                      styles.durationUnit,
                      selected &&
                        styles.durationUnitActive,
                    ]}
                  >
                    min
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ATTENDANCE INFORMATION */}

        <View style={styles.attendanceInfo}>
          <View style={styles.attendanceInfoIcon}>
            <Ionicons
              name="radio-outline"
              size={22}
              color={COLORS.navy}
            />
          </View>

          <View
            style={styles.attendanceInfoContent}
          >
            <Text style={styles.attendanceInfoTitle}>
              Automatic Proximity Attendance
            </Text>

            <Text style={styles.attendanceInfoText}>
              Members can automatically mark attendance
              during the first 5 minutes after the
              meeting starts.
            </Text>
          </View>
        </View>

        {/* CREATE BUTTON */}

        <Pressable
          style={styles.createButton}
          onPress={handleCreateMeeting}
        >
          <Ionicons
            name={
              meetingMode === 'active'
                ? 'play-circle-outline'
                : 'calendar-outline'
            }
            size={22}
            color={COLORS.white}
          />

          <Text style={styles.createButtonText}>
            {meetingMode === 'active'
              ? 'Create & Start Meeting'
              : 'Schedule Meeting'}
          </Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.navy,
  },

  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 12,
  },

  modeContainer: {
    gap: 11,
  },

  modeCard: {
    minHeight: 82,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  modeCardActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },

  modeIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  modeIconActive: {
    backgroundColor: COLORS.navyLight,
  },

  modeTextContainer: {
    flex: 1,
  },

  modeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.navy,
  },

  modeTitleActive: {
    color: COLORS.white,
  },

  modeDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  modeDescriptionActive: {
    color: '#CBD5E1',
  },

  inputGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 7,
  },

  inputContainer: {
    height: 54,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  selectionCard: {
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEF3F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  selectionLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 3,
  },

  selectionValue: {
    fontSize: 15,
    color: COLORS.navy,
    fontWeight: '800',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF3F9',
    borderRadius: 13,
    padding: 12,
    marginTop: 2,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  durationOption: {
    width: '30%',
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  durationOptionActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },

  durationValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.navy,
  },

  durationValueActive: {
    color: COLORS.white,
  },

  durationUnit: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

  durationUnitActive: {
    color: '#CBD5E1',
  },

  attendanceInfo: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E8',
    borderWidth: 1,
    borderColor: '#F8E6A8',
    borderRadius: 17,
    padding: 14,
    marginBottom: 20,
  },

  attendanceInfoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFF1BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  attendanceInfoContent: {
    flex: 1,
  },

  attendanceInfoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 4,
  },

  attendanceInfoText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  createButton: {
    height: 56,
    borderRadius: 17,
    backgroundColor: COLORS.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  createButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 20,
  },
});
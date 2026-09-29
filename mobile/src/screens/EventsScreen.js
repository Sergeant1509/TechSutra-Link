import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../theme/colors';

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>
          Events
        </Text>

        <Text style={styles.subtitle}>
          Discover what's happening at TechSutra
        </Text>

        <EventCard
          title="Byte Bash"
          date="28 Sep 2026"
          type="Technical Quiz"
        />

        <EventCard
          title="TechSutra Hackathon"
          date="05 Oct 2026"
          type="Hackathon"
        />

        <EventCard
          title="Web Development Workshop"
          date="12 Oct 2026"
          type="Workshop"
        />
      </ScrollView>
    </View>
  );
}

function EventCard({ title, date, type }) {
  const getEventIcon = () => {
    switch (type) {
      case 'Technical Quiz':
        return 'help-circle-outline';

      case 'Hackathon':
        return 'code-slash-outline';

      case 'Workshop':
        return 'construct-outline';

      default:
        return 'sparkles-outline';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons
          name={getEventIcon()}
          size={26}
          color={COLORS.goldDark}
        />
      </View>

      <View style={styles.details}>
        <Text style={styles.type}>
          {type}
        </Text>

        <Text style={styles.title}>
          {title}
        </Text>

        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={COLORS.textSecondary}
          />

          <Text style={styles.date}>
            {date}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.textLight}
        style={styles.arrow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },

  heading: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 25,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  icon: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: '#FFF7D6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  details: {
    flex: 1,
    marginLeft: 14,
  },

  type: {
    color: COLORS.goldDark,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  date: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginLeft: 5,
  },

  arrow: {
    marginLeft: 8,
  },
});
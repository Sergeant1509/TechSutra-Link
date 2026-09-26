import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';

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
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>
          ⚡
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.type}>
          {type}
        </Text>

        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.date}>
          📅 {date}
        </Text>
      </View>
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

  iconText: {
    fontSize: 25,
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

  date: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 7,
  },
});
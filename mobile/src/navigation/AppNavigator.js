import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

import HomeScreen from '../screens/HomeScreen';
import MeetingsScreen from '../screens/MeetingsScreen';
import EventsScreen from '../screens/EventsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AttendanceScreen from '../screens/AttendanceScreen';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import CreateMeetingScreen from '../screens/admin/CreateMeetingScreen';
import LiveAttendanceScreen from '../screens/admin/LiveAttendanceScreen';

import BleTestScreen from '../screens/BleTestScreen';
import ProximityTestScreen from '../screens/ProximityTestScreen';

import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* =========================================================
   COMMON TAB BAR STYLES
========================================================= */

const tabBarScreenOptions = ({ route }) => ({
  headerShown: false,

  tabBarActiveTintColor: COLORS.goldDark,
  tabBarInactiveTintColor: COLORS.textLight,

  tabBarStyle: {
    height: 70,
    paddingBottom: 8,
    paddingTop: 7,
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
  },

  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },

  tabBarIcon: ({ focused, color }) => {
    let iconName;

    switch (route.name) {
      case 'Home':
        iconName = focused
          ? 'home'
          : 'home-outline';
        break;

      case 'Dashboard':
        iconName = focused
          ? 'grid'
          : 'grid-outline';
        break;

      case 'Meetings':
        iconName = focused
          ? 'calendar'
          : 'calendar-outline';
        break;

      case 'Events':
        iconName = focused
          ? 'sparkles'
          : 'sparkles-outline';
        break;

      case 'Profile':
        iconName = focused
          ? 'person'
          : 'person-outline';
        break;

      default:
        iconName = 'ellipse-outline';
    }

    return (
      <Ionicons
        name={iconName}
        size={22}
        color={color}
      />
    );
  },
});

/* =========================================================
   MEMBER TABS
========================================================= */

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={tabBarScreenOptions}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="Meetings"
        component={MeetingsScreen}
        options={{
          tabBarLabel: 'Meetings',
        }}
      />

      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarLabel: 'Events',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

/* =========================================================
   MEMBER STACK
========================================================= */

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />

      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
      />
    </Stack.Navigator>
  );
}

/* =========================================================
   PRESIDENT TABS
========================================================= */

function PresidentTabs() {
  return (
    <Tab.Navigator
      screenOptions={tabBarScreenOptions}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />

      <Tab.Screen
        name="Meetings"
        component={MeetingsScreen}
        options={{
          tabBarLabel: 'Meetings',
        }}
      />

      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarLabel: 'Events',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

/* =========================================================
   PRESIDENT STACK
========================================================= */

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="PresidentTabs"
        component={PresidentTabs}
      />

      <Stack.Screen
        name="CreateMeeting"
        component={CreateMeetingScreen}
      />

      <Stack.Screen
        name="LiveAttendance"
        component={LiveAttendanceScreen}
      />

      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
      />

      <Stack.Screen
        name="BleTest"
        component={BleTestScreen}
      />
    </Stack.Navigator>
  );
}

/* =========================================================
   ROOT NAVIGATION
========================================================= */

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ProximityTest"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="ProximityTest"
          component={ProximityTestScreen}
        />

        <Stack.Screen
          name="Signup"
          component={SignupScreen}
        />

        <Stack.Screen
          name="Main"
          component={MainStack}
        />

        <Stack.Screen
          name="Admin"
          component={AdminStack}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
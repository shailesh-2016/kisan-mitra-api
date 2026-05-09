import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getFarmerInsights, WeatherData, MatchedInsight, Priority } from '../services/insightEngine';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface FarmerInsightsProps {
  weatherData: WeatherData;
  language?: 'en' | 'hi' | 'gu';
}

export const FarmerInsights: React.FC<FarmerInsightsProps> = ({ weatherData, language = 'en' }) => {
  const { theme } = useTheme();
  const insights = getFarmerInsights(weatherData, language, 5);

  if (insights.length === 0) return null;

  const getPriorityBorderColor = (priority: Priority) => {
    switch (priority) {
      case 'high':   return '#d32f2f';
      case 'medium': return '#f57c00';
      case 'low':    return '#388e3c';
      default:       return '#388e3c';
    }
  };

  const getPriorityBg = (priority: Priority) => {
    switch (priority) {
      case 'high':   return theme.redBg;
      case 'medium': return theme.secondaryBg;
      case 'low':    return theme.primaryBg;
      default:       return theme.primaryBg;
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'high':   return 'alert-circle';
      case 'medium': return 'alert';
      case 'low':    return 'information';
      default:       return 'information';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':   return theme.red;
      case 'medium': return theme.secondary;
      case 'low':    return theme.primary;
      default:       return theme.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>
        {language === 'en' ? 'Weather Insights' : language === 'hi' ? 'मौसम के सुझाव' : 'હવામાનની સલાહ'}
      </Text>

      <ScrollView horizontal={false} showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        {insights.map((insight: MatchedInsight) => (
          <View
            key={insight.id}
            style={[
              styles.card,
              {
                backgroundColor: getPriorityBg(insight.priority),
                borderLeftColor: getPriorityBorderColor(insight.priority),
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getPriorityIcon(insight.priority) as any}
                size={28}
                color={getPriorityColor(insight.priority)}
              />
            </View>
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, { color: theme.text }]}>{insight.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollArea: {},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default FarmerInsights;

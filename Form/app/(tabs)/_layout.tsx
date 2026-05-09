import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import BottomBar from '../../components/BottomBar';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          // Hide the native tab bar completely — we use our custom BottomBar
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index"    options={{ title: t('tabs.home')     }} />
        <Tabs.Screen name="farmers"  options={{ title: t('tabs.farmers')  }} />
        <Tabs.Screen name="aidoctor" options={{ title: t('tabs.aiDoctor') }} />
        <Tabs.Screen name="bazaar"   options={{ title: t('tabs.bazaar')   }} />
        <Tabs.Screen name="profile"  options={{ title: t('tabs.profile')  }} />
      </Tabs>

      {/* Custom floating bottom bar */}
      <BottomBar />
    </View>
  );
}

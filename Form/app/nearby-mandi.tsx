import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// Redirect to the Market tab which contains the full mandi screen
export default function NearbyMandiScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(tabs)/market' as any);
  }, []);
  return null;
}

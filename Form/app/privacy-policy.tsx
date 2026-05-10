import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const LAST_UPDATED = 'April 19, 2026';
const CONTACT_EMAIL = 'privacy@KisanPlus.app';
const APP_NAME = 'Kisan Plus';

// ── Section data ──────────────────────────────────────────────────────────────

const UI_TEXTS: Record<string, any> = {
  en: {
    headerTitle: 'Privacy Policy',
    heroTitle: 'Your Privacy Matters',
    heroSub: 'Kisan Plus is built for Indian farmers. We are committed to protecting your personal data and being transparent about how we use it.',
    updated: 'Last updated: ',
    summaryTitle: 'Quick Summary',
    summaryPoints: [
      'We never sell your data',
      'No ads, no tracking',
      'You own your farm data',
      'Delete account anytime',
      'OTP-only authentication'
    ],
    contactTitle: 'Privacy Questions?',
    contactSub: 'Contact our privacy team at',
    footer: '© 2026 {APP_NAME}. All rights reserved.\nThis policy is effective as of {LAST_UPDATED}.'
  },
  hi: {
    headerTitle: 'गोपनीयता नीति',
    heroTitle: 'आपकी गोपनीयता महत्वपूर्ण है',
    heroSub: 'किसान प्लस भारतीय किसानों के लिए बनाया गया है। हम आपके व्यक्तिगत डेटा की सुरक्षा करने और हम इसका उपयोग कैसे करते हैं, इस बारे में पारदर्शी रहने के लिए प्रतिबद्ध हैं।',
    updated: 'अंतिम अपडेट: ',
    summaryTitle: 'त्वरित सारांश',
    summaryPoints: [
      'हम आपका डेटा कभी नहीं बेचते',
      'कोई विज्ञापन नहीं, कोई ट्रैकिंग नहीं',
      'डेटा के मालिक आप खुद हैं',
      'किसी भी समय खाता हटाएं',
      'केवल OTP-आधारित प्रमाणीकरण'
    ],
    contactTitle: 'गोपनीयता प्रश्न?',
    contactSub: 'हमारी गोपनीयता टीम से संपर्क करें:',
    footer: '© 2026 {APP_NAME}। सर्वाधिकार सुरक्षित।\nयह नीति {LAST_UPDATED} से प्रभावी है।'
  },
  gu: {
    headerTitle: 'ગોપનીયતા નીતિ',
    heroTitle: 'તમારી ગોપનીયતા મહત્વપૂર્ણ છે',
    heroSub: 'કિસાન પ્લસ ભારતીય ખેડૂતો માટે બનાવવામાં આવ્યું છે. અમે તમારા વ્યક્તિગત ડેટાને સુરક્ષિત કરવા અને તેનો ઉપયોગ કેવી રીતે કરીએ છીએ તેના વિશે પારદર્શક રહેવા માટે પ્રતિબદ્ધ છીએ.',
    updated: 'છેલ્લે અપડેટ: ',
    summaryTitle: 'ઝડપી સારાંશ',
    summaryPoints: [
      'અમે તમારો ડેટા ક્યારેય વેચતા નથી',
      'કોઈ જાહેરાત નહીં, કોઈ ટ્રેકિંગ નહીં',
      'તમે તમારા ડેટાના માલિક છો',
      'કોઈપણ સમયે એકાઉન્ટ રદ કરો',
      'ફક્ત OTP-આધારિત લૉગિન'
    ],
    contactTitle: 'ગોપનીયતા વિશે પ્રશ્નો?',
    contactSub: 'અમારી ગોપનીયતા ટીમનો સંપર્ક કરો:',
    footer: '© 2026 {APP_NAME}. સર્વાધિકાર સુરક્ષિત.\nઆ નીતિ {LAST_UPDATED} થી લાગુ છે.'
  }
};


const SECTIONS: Record<string, any[]> = {
  en: [
    {
      id: '1', icon: 'information-circle-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'Information We Collect',
      content: [
        { subtitle: 'Personal Information', text: 'When you register, we collect your name, mobile number, village/address, and preferred language. This information is used solely to create and manage your account.' },
        { subtitle: 'Farm Data', text: 'We collect data you voluntarily enter including machine usage records, profit calculations, crop information, land size, and farming type. This data belongs to you.' },
        { subtitle: 'Location Data', text: 'With your permission, we access your device location to show nearby mandi prices and local weather forecasts. Location is never stored on our servers.' },
        { subtitle: 'Device Information', text: 'We may collect device type, operating system version, and app version for debugging and improving app performance.' },
      ],
    },
    {
      id: '2', icon: 'shield-checkmark-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'How We Use Your Information',
      content: [
        { subtitle: 'Core App Features', text: 'Your data is used to provide app features: showing mandi prices near you, weather alerts for your location, managing your machines and profit records, and sending reminders.' },
        { subtitle: 'Notifications', text: 'With your consent, we send push notifications for weather alerts, mandi price changes, and reminders you set. You can disable these anytime in Settings.' },
        { subtitle: 'App Improvement', text: 'Anonymized, aggregated usage data helps us understand which features are most useful and improve the app experience for all farmers.' },
        { subtitle: 'We Do NOT', text: 'We do not sell your personal data to third parties. We do not use your data for advertising. We do not share your farm data with any government or commercial entity without your explicit consent.' },
      ],
    },
    {
      id: '3', icon: 'lock-closed-outline', iconColor: '#7B1FA2', iconBg: '#F3E5F5',
      title: 'Data Security',
      content: [
        { subtitle: 'Encryption', text: 'All data transmitted between your device and our servers is encrypted using HTTPS/TLS. Your account is protected by OTP-based authentication — no passwords to remember or leak.' },
        { subtitle: 'Storage', text: 'Your data is stored on secure servers in India. We follow industry-standard security practices including regular security audits and access controls.' },
        { subtitle: 'Account Deletion', text: 'When you delete your account, all your personal data, machine records, profit history, and reminders are permanently and irreversibly deleted from our servers within 30 days.' },
      ],
    },
    {
      id: '4', icon: 'people-outline', iconColor: '#F57F17', iconBg: '#FFF8E1',
      title: 'Third-Party Services',
      content: [
        { subtitle: 'Weather Data', text: 'We use OpenWeatherMap API to provide weather forecasts. Your location coordinates may be shared with OpenWeatherMap solely to fetch weather data.' },
        { subtitle: 'Mandi Prices', text: 'Mandi price data is sourced from data.gov.in (Government of India open data portal). No personal data is shared with this service.' },
        { subtitle: 'SMS / OTP', text: 'We use Twilio to send OTP messages for account verification and deletion. Your mobile number is shared with Twilio only for this purpose.' },
        { subtitle: 'Maps', text: 'We use OpenStreetMap (Leaflet) for mandi location maps. This is an open-source service and no personal data is shared.' },
      ],
    },
    {
      id: '5', icon: 'person-outline', iconColor: '#C62828', iconBg: '#FFEBEE',
      title: 'Your Rights',
      content: [
        { subtitle: 'Access & Correction', text: 'You can view and edit your profile information anytime from the Profile → Edit Profile screen.' },
        { subtitle: 'Data Portability', text: 'You can request a copy of all your data by contacting us at privacy@KisanPlus.app. We will provide it within 30 days.' },
        { subtitle: 'Account Deletion', text: 'You can permanently delete your account and all associated data from Settings → Delete Account. This requires OTP verification for security.' },
        { subtitle: 'Notification Control', text: 'You can enable or disable specific notification types (weather, mandi, reminders) from Settings → Notifications at any time.' },
      ],
    },
    {
      id: '6', icon: 'document-text-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'Children\'s Privacy',
      content: [
        { subtitle: 'Age Requirement', text: 'Kisan Plus is intended for farmers and agricultural workers aged 18 and above. We do not knowingly collect personal information from children under 18.' },
      ],
    },
    {
      id: '7', icon: 'refresh-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'Changes to This Policy',
      content: [
        { subtitle: 'Updates', text: 'We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via SMS. Continued use of the app after changes constitutes acceptance of the updated policy.' },
      ],
    },
  ],
  hi: [
    {
      id: '1', icon: 'information-circle-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'जानकारी जो हम एकत्र करते हैं',
      content: [
        { subtitle: 'व्यक्तिगत जानकारी', text: 'पंजीकरण करते समय, हम आपका नाम, मोबाइल नंबर, गांव/पता और पसंदीदा भाषा एकत्र करते हैं। इस जानकारी का उपयोग केवल आपका खाता बनाने और प्रबंधित करने के लिए किया जाता है।' },
        { subtitle: 'कृषि डेटा', text: 'हम आपके द्वारा स्वेच्छा से दर्ज किया गया डेटा एकत्र करते हैं, जिसमें मशीन उपयोग रिकॉर्ड, लाभ गणना, फसल जानकारी, भूमि का आकार और खेती का प्रकार शामिल है। यह डेटा आपका है।' },
        { subtitle: 'स्थान डेटा', text: 'आपकी अनुमति से, हम आस-पास की मंडी की कीमतें और स्थानीय मौसम का पूर्वानुमान दिखाने के लिए आपके डिवाइस के स्थान तक पहुंचते हैं। स्थान को हमारे सर्वर पर कभी भी संग्रहीत नहीं किया जाता है।' },
        { subtitle: 'डिवाइस की जानकारी', text: 'हम ऐप के प्रदर्शन को बेहतर बनाने और डिबगिंग के लिए डिवाइस प्रकार, ऑपरेटिंग सिस्टम संस्करण और ऐप संस्करण एकत्र कर सकते हैं।' },
      ],
    },
    {
      id: '2', icon: 'shield-checkmark-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'हम आपकी जानकारी का उपयोग कैसे करते हैं',
      content: [
        { subtitle: 'मुख्य ऐप सुविधाएँ', text: 'आपके डेटा का उपयोग ऐप की सुविधाएँ प्रदान करने के लिए किया जाता है: आस-पास की मंडी कीमतें दिखाना, मौसम की चेतावनियाँ, आपके मशीन और लाभ रिकॉर्ड प्रबंधित करना और रिमाइंडर भेजना।' },
        { subtitle: 'सूचनाएँ (Notifications)', text: 'आपकी सहमति से, हम मौसम की चेतावनी, मंडी मूल्य में बदलाव और आपके द्वारा सेट किए गए अनुस्मारक के लिए पुश सूचनाएँ भेजते हैं। आप इन्हें किसी भी समय सेटिंग में बंद कर सकते हैं।' },
        { subtitle: 'ऐप सुधार', text: 'अनाम (Anonymized) और एकत्रित उपयोग डेटा हमें यह समझने में मदद करता है कि कौन सी सुविधाएँ सबसे उपयोगी हैं ताकि सभी किसानों के लिए ऐप के अनुभव को बेहतर बनाया जा सके।' },
        { subtitle: 'हम क्या नहीं करते', text: 'हम आपका व्यक्तिगत डेटा तीसरे पक्षों को नहीं बेचते। हम आपके डेटा का उपयोग विज्ञापन के लिए नहीं करते हैं। हम आपकी स्पष्ट सहमति के बिना आपके कृषि डेटा को किसी सरकारी या व्यावसायिक इकाई के साथ साझा नहीं करते हैं।' },
      ],
    },
    {
      id: '3', icon: 'lock-closed-outline', iconColor: '#7B1FA2', iconBg: '#F3E5F5',
      title: 'डेटा सुरक्षा',
      content: [
        { subtitle: 'एन्क्रिप्शन', text: 'आपके डिवाइस और हमारे सर्वर के बीच प्रेषित सभी डेटा HTTPS/TLS का उपयोग करके एन्क्रिप्ट किया गया है। आपका खाता OTP-आधारित प्रमाणीकरण द्वारा सुरक्षित है — याद रखने या लीक होने के लिए कोई पासवर्ड नहीं।' },
        { subtitle: 'भंडारण', text: 'आपका डेटा भारत में सुरक्षित सर्वर पर संग्रहीत है। हम नियमित सुरक्षा ऑडिट और एक्सेस नियंत्रण सहित उद्योग-मानक सुरक्षा प्रथाओं का पालन करते हैं।' },
        { subtitle: 'खाता हटाना', text: 'जब आप अपना खाता हटाते हैं, तो आपका सभी व्यक्तिगत डेटा, मशीन रिकॉर्ड, लाभ इतिहास और अनुस्मारक 30 दिनों के भीतर हमारे सर्वर से स्थायी और अपरिवर्तनीय रूप से हटा दिए जाते हैं।' },
      ],
    },
    {
      id: '4', icon: 'people-outline', iconColor: '#F57F17', iconBg: '#FFF8E1',
      title: 'तृतीय-पक्ष सेवाएँ',
      content: [
        { subtitle: 'मौसम डेटा', text: 'हम मौसम का पूर्वानुमान प्रदान करने के लिए OpenWeatherMap API का उपयोग करते हैं। केवल मौसम डेटा प्राप्त करने के लिए आपके स्थान के निर्देशांक OpenWeatherMap के साथ साझा किए जा सकते हैं।' },
        { subtitle: 'मंडी की कीमतें', text: 'मंडी मूल्य डेटा data.gov.in (भारत सरकार के ओपन डेटा पोर्टल) से प्राप्त किया जाता है। इस सेवा के साथ कोई व्यक्तिगत डेटा साझा नहीं किया जाता है।' },
        { subtitle: 'SMS / OTP', text: 'खाता सत्यापन और हटाने के लिए OTP भेजने हेतु हम Twilio का उपयोग करते हैं। आपका मोबाइल नंबर केवल इसी उद्देश्य के लिए Twilio के साथ साझा किया जाता है।' },
        { subtitle: 'मैप्स', text: 'हम मंडी स्थान मानचित्र के लिए OpenStreetMap (Leaflet) का उपयोग करते हैं। यह एक ओपन-सोर्स सेवा છે और कोई व्यक्तिगत डेटा साझा नहीं किया जाता है।' },
      ],
    },
    {
      id: '5', icon: 'person-outline', iconColor: '#C62828', iconBg: '#FFEBEE',
      title: 'आपके अधिकार',
      content: [
        { subtitle: 'पहुंच और सुधार', text: 'आप किसी भी समय प्रोफ़ाइल → प्रोफ़ाइल संपादित करें स्क्रीन से अपनी प्रोफ़ाइल जानकारी देख और संपादित कर सकते हैं।' },
        { subtitle: 'डेटा पोर्टेबिलिटी', text: 'आप privacy@KisanPlus.app पर हमसे संपर्क करके अपने सभी डेटा की प्रतिलिपि का अनुरोध कर सकते हैं। हम इसे 30 दिनों के भीतर प्रदान करेंगे।' },
        { subtitle: 'खाता हटाना', text: 'आप सेटिंग्स → खाता हटाएँ से अपना खाता और सभी दर्ज डेटा को स्थायी रूप से हटा सकते हैं। सुरक्षा के लिए इसमें OTP सत्यापन की आवश्यकता होती है।' },
        { subtitle: 'सूचना नियंत्रण', text: 'आप किसी भी समय सेटिंग्स → सूचनाओं से विशिष्ट अधिसूचना प्रकारों (मौसम, मंडी, अनुस्मारक) को सक्षम या अक्षम कर सकते हैं।' },
      ],
    },
    {
      id: '6', icon: 'document-text-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'बच्चों की गोपनीयता',
      content: [
        { subtitle: 'आयु की आवश्यकता', text: 'किसान प्लस 18 वर्ष और उससे अधिक आयु के किसानों और कृषि श्रमिकों के लिए है। हम जानबूझकर 18 वर्ष से कम उम्र के बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते हैं।' },
      ],
    },
    {
      id: '7', icon: 'refresh-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'इस नीति में परिवर्तन',
      content: [
        { subtitle: 'अपडेट', text: 'हम समय-समय পতিত इस गोपनीयता नीति को अपडेट कर सकते हैं। हम आपको ऐप या एसएमएस के माध्यम से महत्वपूर्ण बदलावों के बारे में सूचित करेंगे। बदलावों के बाद ऐप का निरंतर उपयोग अपडेट की गई नीति की स्वीकृति माना जाता है।' },
      ],
    },
  ],
  gu: [
    {
      id: '1', icon: 'information-circle-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'એકત્ર કરેલી માહિતી',
      content: [
        { subtitle: 'વ્યક્તિગત માહિતી', text: 'નોંધણી કરતી વખતે, અમે તમારું નામ, મોબાઈલ નંબર, ગામ/સરનામું અને પસંદગીની ભાષા એકત્રિત કરીએ છીએ. આ માહિતીનો ઉપયોગ ફક્ત તમારું એકાઉન્ટ બનાવવા અને જાળવવા માટે થાય છે.' },
        { subtitle: 'ખેતીનો ડેટા', text: 'તમે સ્વેચ્છાએ દાખલ કરેલ માહિતી અમે એકત્રિત કરીએ છીએ, જેમાં મશીનનો ઉપયોગ, નફાની ગણતરી, પાકની માહિતી, જમીનનો વિસ્તાર અને ખેતીનો પ્રકાર શામેલ છે. આ ડેટા તમારો છે.' },
        { subtitle: 'સ્થાનની માહિતી', text: 'તમારી પરવાનગીથી, અમે નજીકની મંડીના ભાવ અને સ્થાનિક હવામાનની આગાહી દર્શાવવા માટે તમારા ઉપકરણના સ્થાનનો ઉપયોગ કરીએ છીએ. સ્થાન ક્યારેય અમારા સર્વર પર સચવાતું નથી.' },
        { subtitle: 'ઉપકરણની માહિતી', text: 'એપ્લિકેશનના પ્રદર્શનને સુધારવા અને ખામીઓનું નિરાકરણ લાવવા માટે અમે ઉપકરણનો પ્રકાર, ઓપરેટિંગ સિસ્ટમ અને એપ્લિકેશનનું વર્ઝન એકત્રિત કરી શકીએ છીએ.' },
      ],
    },
    {
      id: '2', icon: 'shield-checkmark-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'અમે તમારી માહિતીનો ઉપયોગ કેવી રીતે કરીએ છીએ',
      content: [
        { subtitle: 'મુખ્ય સુવિધાઓ', text: 'એપ્લિકેશનની સુવિધાઓ પ્રદાન કરવા માટે તમારા ડેટાનો ઉપયોગ થાય છે: નજીકના મંડીના ભાવો દર્શાવવા, હવામાનની આગાહી આપવી, મશીન અને નફાના રેકોર્ડ જાળવવા અને રિમાઇન્ડર મોકલવા.' },
        { subtitle: 'સૂચનાઓ (Notifications)', text: 'તમારી સંમતિથી, અમે હવામાનની ચેતવણી, મંડીના ભાવમાં ફેરફાર અને રિમાઇન્ડર્સ માટે પુશ સૂચનાઓ મોકલીએ છીએ. તમે સેટિંગ્સમાં કોઈપણ સમયે તેને બંધ કરી શકો છો.' },
        { subtitle: 'એપ્લિકેશન સુધારણા', text: 'અનામી (Anonymized) અને એકત્રિત ડેટા અમને સમજવામાં મદદ કરે છે કે કઈ સુવિધાઓ સૌથી ઉપયોગી છે, જેથી તમામ ખેડૂતો માટે સારો અનુભવ આપી શકાય.' },
        { subtitle: 'અમે શું નથી કરતા', text: 'અમે તમારો વ્યક્તિગત ડેટા ત્રીજા પક્ષકારોને વેચતા નથી. અમે તમારા ડેટાનો જાહેરાત માટે ઉપયોગ કરતા નથી. તમારી સ્પષ્ટ સંમતિ વિના અમે તમારો ડેટા કોઈ સરકારી અથવા ઔદ્યોગિક સંસ્થા સાથે શેર કરતા નથી.' },
      ],
    },
    {
      id: '3', icon: 'lock-closed-outline', iconColor: '#7B1FA2', iconBg: '#F3E5F5',
      title: 'ડેટા સુરક્ષા',
      content: [
        { subtitle: 'એન્ક્રિપ્શન', text: 'તમારા ઉપકરણ અને અમારા સર્વર્સ વચ્ચે નો ડેટા HTTPS/TLS વડે સુરક્ષિત છે. તમારું એકાઉન્ટ OTP દ્વારા પ્રમાણિત છે — યાદ રાખવા અથવા લીક થવા માટે કોઈ પાસવર્ડ નથી.' },
        { subtitle: 'સ્ટોરેજ', text: 'તમારો ડેટા ભારતના સુરક્ષિત સર્વરમાં સંગ્રહિત છે. નિયમિત સુરક્ષા ઑડિટ સહિત અમે ઉદ્યોગ-ધોરણની સુરક્ષા પદ્ધતિઓનું પાલન કરીએ છીએ.' },
        { subtitle: 'એકાઉન્ટ કાઢી નાખવું', text: 'જ્યારે તમે તમારું એકાઉન્ટ કાઢી નાખો છો, ત્યારે તમારો તમામ ડેટા, મશીન રેકોર્ડ્સ, નફાનો ઇતિહાસ અને રિમાઇન્ડર્સ અમારા સર્વર્સમાંથી 30 દિવસમાં કાયમ માટે ભૂંસી નાખવામાં આવે છે.' },
      ],
    },
    {
      id: '4', icon: 'people-outline', iconColor: '#F57F17', iconBg: '#FFF8E1',
      title: 'ત્રીજા પક્ષની સેવાઓ',
      content: [
        { subtitle: 'હવામાન ડેટા', text: 'અમે હવામાનના પૂર્વાનુમાન માટે OpenWeatherMap API નો ઉપયોગ કરીએ છીએ. માત્ર હવામાનની આગાહી મેળવવા માટે તમારું સ્થાન OpenWeatherMap સાથે શેર થઈ શકે છે.' },
        { subtitle: 'મંડીના ભાવો', text: 'મંડીના ભાવ data.gov.in (ભારત સરકારનું ઓપન ડેટા પોર્ટલ) થી મેળવવામાં આવે છે. આ સેવા સાથે કોઈ વ્યક્તિગત માહિતી શેર કરવામાં આવતી નથી.' },
        { subtitle: 'SMS / OTP', text: 'એકાઉન્ટની ચકાસણી અને કાઢી નાખવા માટે OTP મોકલવા અમે Twilio નો ઉપયોગ કરીએ છીએ. આ માટે જ તમારો મોબાઈલ નંબર Twilio સાથે શેર કરવામાં આવે છે.' },
        { subtitle: 'નકશા', text: 'મંડીનું સ્થાન બતાવવા બતાવવા માટે અમે OpenStreetMap (Leaflet) નો ઉપયોગ કરીએ છીએ. આ ઓપન-સોર્સ સેવા છે અને કોઈ વ્યક્તિગત માહિતી શેર થતી નથી.' },
      ],
    },
    {
      id: '5', icon: 'person-outline', iconColor: '#C62828', iconBg: '#FFEBEE',
      title: 'તમારા અધિકારો',
      content: [
        { subtitle: 'ઍક્સેસ અને સુધારણા', text: 'તમે કોઈપણ સમયે પ્રોફાઇલ → પ્રોફાઈલ સુધારો પર જઈને તમારી માહિતી જોઈ અને સંપાદિત કરી શકો છો.' },
        { subtitle: 'ડેટા પોર્ટેબિલિટી', text: 'તમે privacy@KisanPlus.app પર અમારો સંપર્ક કરીને તમારા તમામ ડેટાની નકલ માંગી શકો છો. અમે 30 દિવસમાં તેને પૂરી પાડીશું.' },
        { subtitle: 'એકાઉન્ટ કાઢી નાખવું', text: 'તમે સેટિંગ્સ → એકાઉન્ટ કાઢી નાખોમાંથી તમારું એકાઉન્ટ કાયમ માટે રદ કરી શકો છો. આ ક્રિયા માટે OTP દ્વારા સુરક્ષા ચકાસણીની જરૂર પડે છે.' },
        { subtitle: 'નોટિફિકેશન કંટ્રોલ', text: 'તમે સેટિંગ્સ → સૂચનાઓમાંથી કોઈપણ સમયે ચોક્કસ પ્રકારની સૂચનાઓ (હવામાન, મંડી, રિમાઇન્ડર) ચાલુ અથવા બંધ કરી શકો છો.' },
      ],
    },
    {
      id: '6', icon: 'document-text-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'બાળકોની ગોપનીયતા',
      content: [
        { subtitle: 'ઉંમર લાયકાત', text: 'કિસાન પ્લસ 18 અને તેથી વધુ ઉંમરના ખેડૂતો માટે છે. અમે જાણીજોઈને 18 વર્ષથી ઓછી ઉંમરના બાળકોની વ્યક્તિગત માહિતી એકત્રિત કરતા નથી.' },
      ],
    },
    {
      id: '7', icon: 'refresh-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'આ નીતિમાં ફેરફારો',
      content: [
        { subtitle: 'સુધારાઓ', text: 'અમે સમયાંતરે આ ગોપનીયતા નીતિમાં સુધારો કરી શકીએ છીએ. અમે એપ્લિકેશન અથવા SMS દ્વારા મહત્વપૂર્ણ ફેરફારો અંગે જાણ કરીશું. ફેરફારો પછી પણ ઉપયોગ ચાલુ રાખવાનો અર્થ અપડેટ કરેલી નીતિ સ્વીકારવી.' },
      ],
    },
  ],
};


// ── Reusable section component ────────────────────────────────────────────────
function PolicySection({ section, isExpanded, onToggle }: {
  section: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={[ps.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <TouchableOpacity style={ps.header} onPress={onToggle} activeOpacity={0.8}>
        <View style={[ps.iconWrap, { backgroundColor: section.iconBg }]}>
          <Ionicons name={section.icon as any} size={18} color={section.iconColor} />
        </View>
        <Text style={[ps.title, { color: theme.text }]}>{section.title}</Text>
        <View style={[ps.chevron, { backgroundColor: theme.inputBg }]}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14} color={theme.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={[ps.body, { borderTopColor: theme.borderLight }]}>
          {section.content.map((item: { subtitle: string; text: string }, i: number) => (
            <View key={i} style={[ps.item, i < section.content.length - 1 && { borderBottomColor: theme.borderLight, borderBottomWidth: 1 }]}>
              <Text style={[ps.subtitle, { color: section.iconColor }]}>{item.subtitle}</Text>
              <Text style={[ps.text, { color: theme.textSecondary }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const ps = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md, borderWidth: 1,
    marginBottom: SPACING.sm, overflow: 'hidden', ...SHADOW.sm,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: 12,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  title: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '700', letterSpacing: -0.1 },
  chevron: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  body: { borderTopWidth: 1, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  item: { paddingVertical: SPACING.sm + 2 },
  subtitle: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.2, marginBottom: 5, textTransform: 'uppercase' },
  text: { fontSize: FONT_SIZE.sm, lineHeight: 22, fontWeight: '400' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const sections = SECTIONS[currentLang] || SECTIONS.en;
  const [expanded, setExpanded] = useState<string | null>('1');

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
          onPress={() => router.back()} activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={[s.headerIconWrap, { backgroundColor: theme.primaryBg }]}>
            <Ionicons name="shield-checkmark" size={16} color={theme.primary} />
          </View>
          <Text style={[s.headerTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.headerTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero banner ── */}
        <LinearGradient
          colors={['#1B5E20', '#2E7D32', '#43A047']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroBlob1} /><View style={s.heroBlob2} />
          <View style={s.heroIconCircle}>
            <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
          </View>
          <Text style={s.heroTitle}>{UI_TEXTS[currentLang]?.heroTitle}</Text>
          <Text style={s.heroSub}>
            Kisan Plus is built for Indian farmers. We are committed to protecting your personal data and being transparent about how we use it.
          </Text>
          <View style={s.heroBadge}>
            <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={s.heroBadgeTxt}>{UI_TEXTS[currentLang]?.updated}{LAST_UPDATED}</Text>
          </View>
        </LinearGradient>

        {/* ── Quick summary chips ── */}
        <View style={[s.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[s.summaryTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.summaryTitle}</Text>
          {[
            { icon: 'checkmark-circle', color: theme.primary, text: 'We never sell your data' },
            { icon: 'checkmark-circle', color: theme.primary, text: 'No ads, no tracking' },
            { icon: 'checkmark-circle', color: theme.primary, text: 'You own your farm data' },
            { icon: 'checkmark-circle', color: theme.primary, text: 'Delete account anytime' },
            { icon: 'checkmark-circle', color: theme.primary, text: 'OTP-only authentication' },
          ].map((item, i) => (
            <View key={i} style={s.summaryRow}>
              <Ionicons name={item.icon as any} size={16} color={item.color} />
              <Text style={[s.summaryText, { color: theme.textSecondary }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Expandable sections ── */}
        <View style={s.sections}>
          {sections.map(section => (
            <PolicySection
              key={section.id}
              section={section}
              isExpanded={expanded === section.id}
              onToggle={() => toggle(section.id)}
            />
          ))}
        </View>

        {/* ── Contact card ── */}
        <View style={[s.contactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[s.contactIconWrap, { backgroundColor: theme.primaryBg }]}>
            <Ionicons name="mail-outline" size={22} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.contactTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.contactTitle}</Text>
            <Text style={[s.contactSub, { color: theme.textSecondary }]}>
              Contact our privacy team at
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})}
              activeOpacity={0.7}
            >
              <Text style={[s.contactEmail, { color: theme.primary }]}>{CONTACT_EMAIL}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ── */}
        <Text style={[s.footer, { color: theme.textMuted }]}>
          © 2026 {APP_NAME}. All rights reserved.{'\n'}
          This policy is effective as of {LAST_UPDATED}.
        </Text>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 12,
    borderBottomWidth: 1, ...SHADOW.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', letterSpacing: -0.3 },

  // Scroll
  scroll: { paddingBottom: 24 },

  // Hero
  hero: {
    margin: SPACING.md, borderRadius: RADIUS.lg,
    padding: SPACING.lg, alignItems: 'center',
    overflow: 'hidden', ...SHADOW.md,
  },
  heroBlob1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -30 },
  heroBlob2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(249,168,37,0.08)', bottom: -10, left: 20 },
  heroIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: SPACING.md,
  },
  heroTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4, marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22, marginBottom: SPACING.md },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroBadgeTxt: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  // Summary card
  summaryCard: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, ...SHADOW.sm,
  },
  summaryTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', marginBottom: SPACING.sm, letterSpacing: -0.2 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  summaryText: { fontSize: FONT_SIZE.sm, fontWeight: '500' },

  // Sections
  sections: { paddingHorizontal: SPACING.md },

  // Contact card
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: SPACING.md, marginTop: SPACING.md,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, ...SHADOW.sm,
  },
  contactIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  contactTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: 2 },
  contactSub: { fontSize: FONT_SIZE.xs, marginBottom: 3 },
  contactEmail: { fontSize: FONT_SIZE.sm, fontWeight: '700', textDecorationLine: 'underline' },

  // Footer
  footer: {
    fontSize: FONT_SIZE.xs, textAlign: 'center',
    lineHeight: 18, marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
});

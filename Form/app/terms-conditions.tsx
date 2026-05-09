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

const LAST_UPDATED  = 'April 19, 2026';
const EFFECTIVE_DATE = 'April 19, 2026';
const CONTACT_EMAIL = 'legal@kisanmitra.app';
const APP_NAME      = 'Kisan Mitra';

// ── Terms sections ────────────────────────────────────────────────────────────

const UI_TEXTS: Record<string, any> = {
  en: {
    headerTitle: 'Terms & Conditions',
    heroTitle: 'Terms & Conditions',
    heroSub: 'Please read these terms carefully before using Kisan Mitra. They govern your use of our app and services.',
    effective: 'Effective: ',
    updated: 'Updated: ',
    keyTitle: 'Key Points',
    keys: [
      'Free to use for all Indian farmers',
      'Your farm data belongs to you',
      'Mandi prices are informational only',
      'Weather data is not guaranteed accurate',
      'No financial advice is provided',
      'Not an official government app',
    ],
    contactTitle: 'Legal Questions?',
    contactSub: 'Contact our legal team at',
    agreeText: 'By using {APP_NAME}, you confirm that you have read, understood, and agreed to these Terms and Conditions.',
    footer: '© 2026 {APP_NAME}. All rights reserved.\nThese terms are effective as of {EFFECTIVE_DATE}.'
  },
  hi: {
    headerTitle: 'नियम और शर्तें',
    heroTitle: 'नियम और शर्तें',
    heroSub: 'किसान मित्र का उपयोग करने से पहले कृपया इन शर्तों को ध्यान से पढ़ें। ये हमारे ऐप और सेवाओं के आपके उपयोग को नियंत्रित करते हैं।',
    effective: 'प्रभावी: ',
    updated: 'अपडेट: ',
    keyTitle: 'मुख्य बिंदु',
    keys: [
      'सभी भारतीय किसानों के लिए निःशुल्क',
      'आपका कृषि डेटा आपका है',
      'मंडी की कीमतें केवल जानकारी के लिए हैं',
      'मौसम डेटा की सटीकता की गारंटी नहीं है',
      'कोई वित्तीय सलाह नहीं दी जाती है',
      'आधिकारिक सरकारी ऐप नहीं है',
    ],
    contactTitle: 'कानूनी प्रश्न?',
    contactSub: 'हमारी कानूनी टीम से संपर्क करें:',
    agreeText: '{APP_NAME} का उपयोग करके, आप पुष्टि करते हैं कि आपने इन नियमों और शर्तों को पढ़ और समझ लिया है और आप इनसे सहमत हैं।',
    footer: '© 2026 {APP_NAME}। सर्वाधिकार सुरक्षित।\nये शर्तें {EFFECTIVE_DATE} से प्रभावी हैं।'
  },
  gu: {
    headerTitle: 'નિયમો અને શરતો',
    heroTitle: 'નિયમો અને શરતો',
    heroSub: 'કિસાન મિત્રનો ઉપયોગ કરતા પહેલા કૃપા કરીને આ શરતો ધ્યાનથી વાંચો. તે અમારી એપ્લિકેશન અને સેવાઓના તમારા ઉપયોગને સંચાલિત કરે છે.',
    effective: 'લાગુ: ',
    updated: 'અપડેટ: ',
    keyTitle: 'મુખ્ય મુદ્દાઓ',
    keys: [
      'તમામ ભારતીય ખેડૂતો માટે મફત',
      'તમારો ખેતી ડેટા તમારો છે',
      'મંડીના ભાવ માત્ર માહિતી માટે છે',
      'હવામાન ડેટાની 100% ખાતરી નથી',
      'કોઈ નાણાકીય સલાહ આપવામાં આવતી નથી',
      'આ કોઈ સત્તાવાર સરકારી એપ્લિકેશન નથી',
    ],
    contactTitle: 'કાનૂની પ્રશ્ન?',
    contactSub: 'અમારી કાનૂની ટીમનો સંપર્ક કરો:',
    agreeText: '{APP_NAME} નો ઉપયોગ કરીને, તમે ખાતરી કરો છો કે તમે આ નિયમો અને શરતો વાંચી છે, સમજી છે અને તમે તેનાથી સંમત છો.',
    footer: '© 2026 {APP_NAME}. સર્વાધિકાર સુરક્ષિત.\nઆ શરતો {EFFECTIVE_DATE} થી લાગુ છે.'
  }
};


const SECTIONS: Record<string, any[]> = {
  en: [
    {
      id: '1', icon: 'document-text-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'Acceptance of Terms',
      content: [
        { subtitle: 'Agreement', text: 'By downloading, installing, or using the Kisan Mitra mobile application, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the app.' },
        { subtitle: 'Eligibility', text: 'You must be at least 18 years of age to use Kisan Mitra. By using the app, you represent that you are 18 or older and have the legal capacity to enter into this agreement.' },
        { subtitle: 'Updates to Terms', text: 'We reserve the right to modify these terms at any time. We will notify you of significant changes through the app. Continued use after changes constitutes acceptance of the updated terms.' },
      ],
    },
    {
      id: '2', icon: 'phone-portrait-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'Use of the App',
      content: [
        { subtitle: 'Permitted Use', text: 'Kisan Mitra is designed for Indian farmers and agricultural workers to track farm activities, view mandi prices, check weather, and access government schemes. You may use the app for these lawful purposes.' },
        { subtitle: 'Prohibited Activities', text: 'You must not: (a) use the app for any illegal purpose; (b) attempt to reverse engineer or hack the app; (c) create fake accounts or impersonate others; (d) use automated tools to scrape data; (e) interfere with the app\'s security features.' },
        { subtitle: 'Account Responsibility', text: 'You are responsible for maintaining the security of your account. Your mobile number is your identity — do not share OTPs with anyone. Kisan Mitra will never ask for your OTP via phone or message.' },
      ],
    },
    {
      id: '3', icon: 'leaf-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'Farm Data & Content',
      content: [
        { subtitle: 'Your Data Ownership', text: 'All farm data you enter — machine records, profit calculations, reminders — belongs to you. Kisan Mitra does not claim ownership of your personal farm data.' },
        { subtitle: 'Data Accuracy', text: 'You are responsible for the accuracy of data you enter. Kisan Mitra is not liable for business decisions made based on data you have entered incorrectly.' },
        { subtitle: 'Data Backup', text: 'While we take reasonable measures to protect your data, we recommend keeping your own records. We are not liable for data loss due to technical failures, account deletion, or force majeure events.' },
      ],
    },
    {
      id: '4', icon: 'trending-up-outline', iconColor: '#F57F17', iconBg: '#FFF8E1',
      title: 'Mandi Prices & Market Data',
      content: [
        { subtitle: 'Data Source', text: 'Mandi price data is sourced from data.gov.in (Government of India) and may be delayed by up to 24 hours. Prices shown are for informational purposes only.' },
        { subtitle: 'No Financial Advice', text: 'Mandi prices, profit calculations, and market trends shown in the app are informational only and do not constitute financial, investment, or trading advice. Always verify prices at your local mandi before making selling decisions.' },
        { subtitle: 'Price Accuracy', text: 'We do not guarantee the accuracy, completeness, or timeliness of mandi price data. Kisan Mitra is not liable for any financial loss resulting from reliance on prices shown in the app.' },
      ],
    },
    {
      id: '5', icon: 'partly-sunny-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'Weather Information',
      content: [
        { subtitle: 'Informational Only', text: 'Weather forecasts are provided by OpenWeatherMap and are for informational purposes only. Weather predictions are inherently uncertain.' },
        { subtitle: 'Agricultural Decisions', text: 'Do not make critical agricultural decisions (such as pesticide spraying, harvesting, or irrigation) based solely on weather data from this app. Always consult local weather services and your own judgment.' },
        { subtitle: 'No Liability', text: 'Kisan Mitra is not liable for crop damage, financial loss, or any other harm resulting from reliance on weather information provided in the app.' },
      ],
    },
    {
      id: '6', icon: 'shield-outline', iconColor: '#7B1FA2', iconBg: '#F3E5F5',
      title: 'Government Schemes',
      content: [
        { subtitle: 'Information Only', text: 'Government scheme information (PM Kisan, Fasal Bima, etc.) is provided for awareness only. Eligibility criteria, benefit amounts, and application processes may change.' },
        { subtitle: 'Official Sources', text: 'Always verify scheme details and apply through official government portals (pmkisan.gov.in, etc.) or your local Krishi Kendra. Kisan Mitra is not an official government application.' },
        { subtitle: 'No Guarantee', text: 'We do not guarantee that you will receive any government benefit based on information shown in the app. Kisan Mitra is not responsible for scheme application outcomes.' },
      ],
    },
    {
      id: '7', icon: 'alert-circle-outline', iconColor: '#C62828', iconBg: '#FFEBEE',
      title: 'Disclaimers & Limitations',
      content: [
        { subtitle: 'As-Is Service', text: 'Kisan Mitra is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, error-free operation, or that the app will meet your specific requirements.' },
        { subtitle: 'Limitation of Liability', text: 'To the maximum extent permitted by Indian law, Kisan Mitra and its developers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app.' },
        { subtitle: 'Service Interruptions', text: 'We may temporarily suspend the app for maintenance, updates, or due to circumstances beyond our control. We will try to provide advance notice when possible.' },
      ],
    },
    {
      id: '8', icon: 'globe-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'Governing Law',
      content: [
        { subtitle: 'Jurisdiction', text: 'These Terms are governed by the laws of India. Any disputes arising from these terms or your use of Kisan Mitra shall be subject to the exclusive jurisdiction of courts in Gujarat, India.' },
        { subtitle: 'Dispute Resolution', text: 'We encourage resolving disputes amicably. Please contact us at legal@kisanmitra.app before initiating any legal proceedings. We will make every effort to resolve issues within 30 days.' },
      ],
    },
    {
      id: '9', icon: 'close-circle-outline', iconColor: '#C62828', iconBg: '#FFEBEE',
      title: 'Termination',
      content: [
        { subtitle: 'By You', text: 'You may stop using Kisan Mitra at any time. You can delete your account from Settings → Delete Account, which will permanently remove all your data.' },
        { subtitle: 'By Us', text: 'We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the app. We will provide notice where reasonably possible.' },
        { subtitle: 'Effect of Termination', text: 'Upon termination, your right to use the app ceases immediately. Provisions of these terms that by their nature should survive termination will remain in effect.' },
      ],
    },
  ],
  hi: [
    {
      id: '1', icon: 'document-text-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'नियमों की स्वीकृति',
      content: [
        { subtitle: 'समझौता', text: 'किसान मित्र मोबाइल एप्लिकेशन को डाउनलोड, इंस्टॉल या उपयोग करके, आप इन नियमों और शर्तों से बंधे होने के लिए सहमत हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया ऐप का उपयोग न करें।' },
        { subtitle: 'पात्रता', text: 'किसान मित्र का उपयोग करने के लिए आपकी आयु कम से कम 18 वर्ष होनी चाहिए। ऐप का उपयोग करके, आप यह दर्शाते हैं कि आप 18 वर्ष या उससे अधिक आयु के हैं और इस समझौते में प्रवेश करने की कानूनी क्षमता रखते हैं।' },
        { subtitle: 'शर्तों में अपडेट', text: 'हम किसी भी समय इन शर्तों को संशोधित करने का अधिकार सुरक्षित रखते हैं। हम आपको ऐप के माध्यम से महत्वपूर्ण बदलावों के बारे में सूचित करेंगे। बदलावों के बाद भी उपयोग जारी रखने का अर्थ है नई शर्तों को स्वीकार करना।' },
      ],
    },
    {
      id: '2', icon: 'phone-portrait-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'ऐप का उपयोग',
      content: [
        { subtitle: 'अनुमत उपयोग', text: 'किसान मित्र को भारतीय किसानों और कृषि श्रमिकों के लिए खेती की गतिविधियों, मंडी की कीमतों, मौसम और सरकारी योजनाओं तक पहुंचने के लिए डिज़ाइन किया गया है। आप इन वैध उद्देश्यों के लिए ऐप का उपयोग कर सकते हैं।' },
        { subtitle: 'प्रतिबंधित गतिविधियां', text: 'आपको यह नहीं करना चाहिए: (a) किसी भी अवैध उद्देश्य के लिए ऐप का उपयोग; (b) ऐप को रिवर्स इंजीनियर या हैक करने का प्रयास; (c) नकली खाते बनाना या दूसरों का रूप धारण करना; (d) डेटा खुरचने के लिए स्वचालित टूल का उपयोग; (e) सुरक्षा सुविधाओं में हस्तक्षेप।' },
        { subtitle: 'खाता जिम्मेदारी', text: 'आप अपने खाते की सुरक्षा बनाए रखने के लिए जिम्मेदार हैं। आपका मोबाइल नंबर आपकी पहचान है — किसी के साथ ओटीपी साझा न करें। किसान मित्र कभी भी फोन या संदेश के माध्यम से आपका ओटीपी नहीं मांगेगा।' },
      ],
    },
    {
      id: '3', icon: 'leaf-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'कृषि डेटा और सामग्री',
      content: [
        { subtitle: 'आपका डेटा स्वामित्व', text: 'आपके द्वारा दर्ज किया गया सभी कृषि डेटा — मशीन रिकॉर्ड, लाभ की गणना, अनुस्मारक — आपका है। किसान मित्र आपके व्यक्तिगत कृषि डेटा पर स्वामित्व का दावा नहीं करता है।' },
        { subtitle: 'डेटा सटीकता', text: 'आप दर्ज किए गए डेटा की सटीकता के लिए जिम्मेदार हैं। किसान मित्र गलत तरीके से दर्ज किए गए डेटा के आधार पर लिए गए व्यावसायिक निर्णयों के लिए उत्तरदायी नहीं है।' },
        { subtitle: 'डेटा बैकअप', text: 'हालांकि हम आपके डेटा की सुरक्षा के लिए उचित उपाय करते हैं, हम आपको अपने स्वयं के रिकॉर्ड रखने की सलाह देते हैं। तकनीकी विफलताओं, खाता हटाने या प्राकृतिक आपदाओं के कारण डेटा हानि के लिए हम उत्तरदायी नहीं हैं।' },
      ],
    },
    {
      id: '4', icon: 'trending-up-outline', iconColor: '#F57F17', iconBg: '#FFF8E1',
      title: 'मंडी की कीमतें और बाजार डेटा',
      content: [
        { subtitle: 'डेटा स्रोत', text: 'मंडी मूल्य डेटा data.gov.in (भारत सरकार) से प्राप्त किया जाता है और 24 घंटे तक की देरी हो सकती है। दिखाए गए मूल्य केवल सूचनात्मक उद्देश्यों के लिए हैं।' },
        { subtitle: 'कोई वित्तीय सलाह नहीं', text: 'ऐप में दिखाए गए मंडी मूल्य, लाभ गणना और बाजार के रुझान केवल सूचनात्मक हैं और वित्तीय या व्यापार सलाह नहीं हैं। बेचने का निर्णय लेने से पहले हमेशा अपनी स्थानीय मंडी में कीमतों को सत्यापित करें।' },
        { subtitle: 'मूल्य सटीकता', text: 'हम मंडी मूल्य डेटा की सटीकता, पूर्णता या समयबद्धता की गारंटी नहीं देते हैं। किसान मित्र ऐप में दिखाए गए मूल्यों पर निर्भरता के परिणामस्वरूप होने वाले किसी भी वित्तीय नुकसान के लिए उत्तरदायी नहीं है।' },
      ],
    },
    {
      id: '5', icon: 'partly-sunny-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'मौसम की जानकारी',
      content: [
        { subtitle: 'केवल सूचनात्मक', text: 'मौसम का पूर्वानुमान OpenWeatherMap द्वारा प्रदान किया जाता है और केवल सूचनात्मक उद्देश्यों के लिए है। मौसम की भविष्यवाणी स्वाभाविक रूप से अनिश्चित है।' },
        { subtitle: 'कृषि निर्णय', text: 'केवल इस ऐप के मौसम डेटा के आधार पर महत्वपूर्ण कृषि निर्णय (जैसे कीटनाशक छिड़काव, कटाई, या सिंचाई) न लें। हमेशा स्थानीय मौसम सेवाओं और अपने स्वयं के निर्णय से परामर्श करें।' },
        { subtitle: 'कोई देयता नहीं', text: 'किसान मित्र ऐप में दी गई मौसम की जानकारी पर निर्भरता के परिणामस्वरूप फसल के नुकसान, वित्तीय नुकसान या किसी अन्य नुकसान के लिए उत्तरदायी नहीं है।' },
      ],
    },
    {
      id: '6', icon: 'shield-outline', iconColor: '#7B1FA2', iconBg: '#F3E5F5',
      title: 'सरकारी योजनाएं',
      content: [
        { subtitle: 'केवल जानकारी', text: 'सरकारी योजनाओं की जानकारी (पीएम किसान, फसल बीमा, आदि) केवल जागरूकता के लिए प्रदान की जाती है। पात्रता मानदंड, लाभ राशि और आवेदन प्रक्रियाएं बदल सकती हैं।' },
        { subtitle: 'आधिकारिक स्रोत', text: 'हमेशा योजना के विवरण को सत्यापित करें और आधिकारिक सरकारी पोर्टलों (pmkisan.gov.in, आदि) या अपने स्थानीय कृषि केंद्र के माध्यम से आवेदन करें। किसान मित्र आधिकारिक सरकारी एप्लिकेशन नहीं है।' },
        { subtitle: 'कोई गारंटी नहीं', text: 'हम इस बात की गारंटी नहीं देते हैं कि आपको ऐप में दिखाई गई जानकारी के आधार पर कोई भी सरकारी लाभ मिलेगा। किसान मित्र योजना आवेदन परिणामों के लिए ज़िम्मेदार नहीं है।' },
      ],
    },
    {
      id: '7', icon: 'alert-circle-outline', iconColor: '#C62828', iconBg: '#FFEBEE',
      title: 'अस्वीकरण और सीमाएं',
      content: [
        { subtitle: 'जैसा है सेवा', text: 'किसान मित्र किसी भी प्रकार की वारंटी के बिना "जैसा है" प्रदान किया जाता है। हम निर्बाध सेवा, त्रुटि मुक्त संचालन की गारंटी नहीं देते हैं, या कि ऐप आपकी विशिष्ट आवश्यकताओं को पूरा करेगा।' },
        { subtitle: 'देयता की सीमा', text: 'भारतीय कानून द्वारा अनुमत अधिकतम सीमा तक, किसान मित्र और इसके डेवलपर्स ऐप के आपके उपयोग से होने वाले किसी भी अप्रत्यक्ष, आकस्मिक, या परिणामी नुकसान के लिए उत्तरदायी नहीं होंगे।' },
        { subtitle: 'सेवा में रुकावटें', text: 'हम रखरखाव, अद्यतन के लिए, या हमारे नियंत्रण से बाहर की परिस्थितियों के कारण ऐप को अस्थायी रूप से निलंबित कर सकते हैं। जब भी संभव हो हम अग्रिम सूचना देने का प्रयास करेंगे।' },
      ],
    },
    {
      id: '8', icon: 'globe-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'शासी कानून',
      content: [
        { subtitle: 'अधिकार क्षेत्र', text: 'ये शर्तें भारत के कानूनों द्वारा शासित होती हैं। इन शर्तों या किसान मित्र के आपके उपयोग से उत्पन्न होने वाले किसी भी विवाद गुजरात, भारत के न्यायालयों के अनन्य अधिकार क्षेत्र के अधीन होंगे।' },
        { subtitle: 'विवाद समाधान', text: 'हम सौहार्दपूर्ण ढंग से विवादों को सुलझाने के लिए प्रोत्साहित करते हैं। कृपया कोई भी कानूनी कार्यवाही शुरू करने से पहले legal@kisanmitra.app पर संपर्क करें। हम 30 दिनों के भीतर समस्याओं को हल करने का हर संभव प्रयास करेंगे।' },
      ],
    },
    {
      id: '9', icon: 'close-circle-outline', iconColor: '#C62828', iconBg: '#FFEBEE',
      title: 'समाप्ति',
      content: [
        { subtitle: 'आपके द्वारा', text: 'आप किसी भी समय किसान मित्र का उपयोग करना बंद कर सकते हैं। आप सेटिंग्स → खाता हटाएं से अपना खाता हटा सकते हैं, जो आपके सभी डेटा को स्थायी रूप से हटा देगा।' },
        { subtitle: 'हमारे द्वारा', text: 'हम उन खातों को निलंबित या समाप्त करने का अधिकार सुरक्षित रखते हैं जो इन शर्तों का उल्लंघन करते हैं, धोखाधड़ी गतिविधि में शामिल होते हैं, या ऐप का दुरुपयोग करते हैं।' },
        { subtitle: 'समाप्ति का प्रभाव', text: 'समाप्ति के बाद, ऐप का उपयोग करने का आपका अधिकार तुरंत समाप्त हो जाता है। इन शर्तों के वे प्रावधान जो अपनी प्रकृति से समाप्ति के बाद भी बने रहने चाहिए, वे प्रभावी रहेंगे।' },
      ],
    },
  ],
  gu: [
    {
      id: '1', icon: 'document-text-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'શરતોની સ્વીકૃતિ',
      content: [
        { subtitle: 'કરાર', text: 'કિસાન મિત્ર મોબાઇલ એપ્લિકેશન ડાઉનલોડ કરીને, ઇન્સ્ટોલ કરીને અથવા ઉપયોગ કરીને, તમે આ નિયમો અને શરતોથી બંધાયેલા રહેવા માટે સંમત થાઓ છો. જો તમે આ શરતો સાથે સંમત નથી, તો કૃપા કરીને એપ્લિકેશનનો ઉપયોગ કરશો નહીં.' },
        { subtitle: 'પાત્રતા', text: 'કિસાન મિત્રનો ઉપયોગ કરવા માટે તમારી ઉંમર ઓછામાં ઓછી 18 વર્ષ હોવી જોઈએ. એપ્લિકેશનનો ઉપયોગ કરીને, તમે પ્રમાણિત કરો છો કે તમારી ઉંમર 18 વર્ષ કે તેથી વધુ છે અને આ કરારમાં પ્રવેશવાની કાનૂની ક્ષમતા ધરાવો છો.' },
        { subtitle: 'શરતોમાં સુધારાઓ', text: 'અમે કોઈપણ સમયે આ શરતોમાં સુધારો કરવાનો અધિકાર અનામત રાખીએ છીએ. એપ્લિકેશન દ્વારા અમે તમને મહત્વપૂર્ણ ફેરફારો વિશે જાણ કરીશું. ફેરફારો પછી પણ ઉપયોગ ચાલુ રાખવાનો અર્થ નવી શરતો સ્વીકારવી.' },
      ],
    },
    {
      id: '2', icon: 'phone-portrait-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'એપ્લિકેશનનો ઉપયોગ',
      content: [
        { subtitle: 'માન્ય ઉપયોગ', text: 'કિસાન મિત્ર ભારતીય ખેડૂતો અને ખેતી કામદારો માટે ખેતીની પ્રવૃત્તિઓનું ધ્યાન રાખવા, મંડીના ભાવ જોવા, હવામાન ચકાસવા અને સરકારી યોજનાઓ મેળવવા માટે બનાવવામાં આવ્યું છે. તમે આ કાનૂની હેતુઓ માટે એપ્લિકેશનનો ઉપયોગ કરી શકો છો.' },
        { subtitle: 'પ્રતિબંધિત પ્રવૃત્તિઓ', text: 'તમારે આ ન કરવું જોઈએ: (a) કોઈપણ ગેરકાનૂની હેતુ માટે એપ્લિકેશનનો ઉપયોગ ન કરો; (b) એપ્લિકેશનને રિવર્સ એન્જિનિયર અથવા હેક કરવાનો પ્રયાસ ન કરો; (c) નકલી ખાતા ન બનાવો અથવા અન્યનો વેશ ધારણ ન કરો; (d) ડેટા સ્ક્રૅપ કરવા સ્વચાલિત સાધનોનો ઉપયોગ ન કરો; (e) સુરક્ષા સુવિધાઓમાં દખલ ન કરો.' },
        { subtitle: 'એકાઉન્ટની જવાબદારી', text: 'તમે તમારા એકાઉન્ટની સુરક્ષા જાળવવા માટે જવાબદાર છો. તમારો મોબાઈલ નંબર તમારી ઓળખ છે — OTP કોઈની સાથે શેર કરશો નહીં. કિસાન મિત્ર ક્યારેય ફોન કે મેસેજ દ્વારા તમારો OTP માંગશે નહીં.' },
      ],
    },
    {
      id: '3', icon: 'leaf-outline', iconColor: '#2E7D32', iconBg: '#E8F5E9',
      title: 'ખેતીનો ડેટા અને સામગ્રી',
      content: [
        { subtitle: 'તમારો ડેટા માલિકી', text: 'તમે દાખલ કરો છો તે તમામ ખેતી ડેટા — મશીન રેકોર્ડ્સ, નફાની ગણતરી, રીમાઇન્ડર્સ — તમારો છે. કિસાન મિત્ર તમારા વ્યક્તિગત ખેતી ડેટાની માલિકીનો દાવો કરતું નથી.' },
        { subtitle: 'ડેટાની ચોકસાઈ', text: 'તમે દાખલ કરેલ ડેટાની ચોકસાઈ માટે તમે જવાબદાર છો. તમે ખોટી રીતે દાખલ કરેલ ડેટાના આધારે લીધેલા વ્યવસાયિક નિર્ણયો માટે કિસાન મિત્ર જવાબદાર નથી.' },
        { subtitle: 'ડેટા બેકઅપ', text: 'જોકે અમે તમારા ડેટાને સુરક્ષિત કરવા માટે યોગ્ય પગલાં લઈએ છીએ, અમે તમને તમારા પોતાના રેકોર્ડ રાખવાની સલાહ આપીએ છીએ. અમે તકનીકી નિષ્ફળતા, એકાઉન્ટ રદ થવાથી અથવા કુદરતી આફતોના કારણે ડેટાના નુકસાન માટે જવાબદાર નથી.' },
      ],
    },
    {
      id: '4', icon: 'trending-up-outline', iconColor: '#F57F17', iconBg: '#FFF8E1',
      title: 'મંડીના ભાવ અને બજાર વિશેષતાઓ',
      content: [
        { subtitle: 'ડેટા સ્ત્રોત', text: 'મંડીના ભાવ ડેટા data.gov.in (ભારત સરકાર) પરથી લેવામાં આવે છે અને તેમાં 24 કલાક સુધીનો વિલંબ થઈ શકે છે. દર્શાવેલ ભાવ માત્ર માહિતીના હેતુ માટે છે.' },
        { subtitle: 'કોઈ નાણાકીય સલાહ નહીં', text: 'એપ્લિકેશનમાં દર્શાવેલ મંડીના ભાવ, નફાની ગણતરીઓ અને બજારના વલણો માત્ર માહિતી છે અને નાણાકીય અથવા વેપારની સલાહ નથી. વેચવાનો નિર્ણય લેતા પહેલા હંમેશા તમારી સ્થાનિક મંડીમાં ભાવ તપાસો.' },
        { subtitle: 'ભાવની ચોકસાઈ', text: 'અમે મંડીના ભાવ ડેટાની ચોકસાઈ, સંપૂર્ણતા અથવા સમયસરતાની બાંયધરી આપતા નથી. કિસાન મિત્ર એપ્લિકેશનમાં દર્શાવેલ ભાવ પર આધાર રાખીને થતા કોઈપણ નાણાકીય નુકસાન માટે જવાબદાર નથી.' },
      ],
    },
    {
      id: '5', icon: 'partly-sunny-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'હવામાનની માહિતી',
      content: [
        { subtitle: 'ફક્ત માહિતી', text: 'હવામાનની આગાહી OpenWeatherMap દ્વારા પ્રદાન કરવામાં આવે છે અને તે માત્ર માહિતીના હેતુ માટે છે. હવામાનની આગાહી સ્વભાવે અનિશ્ચિત હોય છે.' },
        { subtitle: 'કૃષિ નિર્ણયો', text: 'એપ્લિકેશનમાંથી મળતી હવામાન માહિતીના આધારે ગંભીર ખેતીના નિર્ણયો (જેમ કે દવાઓનો છંટકાવ, લણણી, અથવા સિંચાઈ) ન લો. હંમેશા સ્થાનિક હવામાન સેવાઓ અને તમારા પોતાના નિર્ણયનો સંપર્ક કરો.' },
        { subtitle: 'કોઈ જવાબદારી નહીં', text: 'કિસાન મિત્ર એપ્લિકેશનમાં આપેલી હવામાનની માહિતી પર આધાર રાખીને પાકના નુકસાન, નાણાકીય નુકસાન અથવા અન્ય કોઈપણ નુકસાન માટે જવાબદાર નથી.' },
      ],
    },
    {
      id: '6', icon: 'shield-outline', iconColor: '#7B1FA2', iconBg: '#F3E5F5',
      title: 'સરકારી યોજનાઓ',
      content: [
        { subtitle: 'ફક્ત માહિતી', text: 'સરકારી યોજનાઓ (પીએમ કિસાન, પાક વીમા, વગેરે) ની માહિતી માત્ર જાગૃતિ માટે આપવામાં આવે છે. પાત્રતાનાં માપદંડો, લાભની રકમ અને અરજી પ્રક્રિયાઓ બદલાઈ શકે છે.' },
        { subtitle: 'સત્તાવાર સ્ત્રોતો', text: 'હંમેશા યોજનાની વિગતો ચકાસો અને સત્તાવાર સરકારી પોર્ટલ (pmkisan.gov.in, વગેરે) અથવા તમારા સ્થાનિક કૃષિ કેન્દ્ર દ્વારા અરજી કરો. કિસાન મિત્ર અધિકૃત સરકારી એપ્લિકેશન નથી.' },
        { subtitle: 'કોઈ ગેરંટી નહીં', text: 'અમે બાંયધરી આપતા નથી કે તમને એપ્લિકેશનમાં દર્શાવેલ માહિતીના આધારે કોઈ સરકારી લાભ મળશે. કિસાન મિત્ર યોજનાની અરજીના પરિણામો માટે જવાબદાર નથી.' },
      ],
    },
    {
      id: '7', icon: 'alert-circle-outline', iconColor: '#C62828', iconBg: '#FFEBEE',
      title: 'અસ્વીકરણ અને મર્યાદાઓ',
      content: [
        { subtitle: 'જેમ છે તેમ સેવા', text: 'કિસાન મિત્ર કોઈપણ પ્રકારની ગેરંટી વિના "જેમ છે તેમ" આપવામાં આવે છે. અમે વિક્ષેપ વિનાની સેવા, ભૂલ-મુક્ત કામગીરીની બાંયધરી આપતા નથી, અથવા એપ્લિકેશન તમારી ચોક્કસ નિશ્ચિત જરૂરિયાતોને પૂર્ણ કરશે તેવી બાંયધરી આપતા નથી.' },
        { subtitle: 'જવાબદારીની મર્યાદા', text: 'ભારતીય કાયદા દ્વારા માન્ય મહત્તમ મર્યાદા સુધી, કિસાન મિત્ર અને તેના વિકાસકર્તાઓ એપ્લિકેશનના તમારા ઉપયોગથી થતા કોઈપણ પરોક્ષ, આકસ્મિક અથવા પારિણામિક નુકસાન માટે જવાબદાર રહેશે નહીં.' },
        { subtitle: 'સેવામાં વિક્ષેપો', text: 'અમે જાળવણી, અપડેટ્સ માટે અથવા અમારા નિયંત્રણની બહારના સંજોગો માટે એપ્લિકેશનને અસ્થાયી રૂપે સ્થગિત કરી શકીએ છીએ. જ્યારે પણ શક્ય હશે ત્યારે અમે અગાઉથી જાણ કરવાનો પ્રયાસ કરીશું.' },
      ],
    },
    {
      id: '8', icon: 'globe-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'સંચાલિત કાયદો',
      content: [
        { subtitle: 'અધિકારક્ષેત્ર', text: 'આ નિયમો ભારતના કાયદા હેઠળ સંચાલિત થાય છે. આ શરતો અથવા કિસાન મિત્રના તમારા ઉપયોગથી ઉદ્ભવતા કોઈપણ વિવાદો ગુજરાત, ભારતના અદાલતોના વિશિષ્ટ અધિકારક્ષેત્રને આધીન રહેશે.' },
        { subtitle: 'વિવાદ નિરાકરણ', text: 'અમે મિત્રતાપૂર્ણ રીતે વિવાદોને ઉકેલવા પ્રોત્સાહિત કરીએ છીએ. કોઈપણ કાનૂની કાર્યવાહી શરૂ કરતા પહેલા કૃપા કરીને legal@kisanmitra.app પર અમારો સંપર્ક કરો. અમે ૩૦ દિવસમાં સમસ્યાઓને ઉકેલવા દરેક શક્ય પ્રયાસ કરીશું.' },
      ],
    },
    {
      id: '9', icon: 'close-circle-outline', iconColor: '#C62828', iconBg: '#FFEBEE',
      title: 'સમાપ્તિ',
      content: [
        { subtitle: 'તમારા દ્વારા', text: 'તમે કોઈપણ સમયે કિસાન મિત્રનો ઉપયોગ કરવાનું બંધ કરી શકો છો. તમે સેટિંગ્સ → એકાઉન્ટ કાઢી નાખો માંથી તમારું એકાઉન્ટ ભૂંસી શકો છો, જે તમારો તમામ ડેટા કાયમી ધોરણે રદ કરશે.' },
        { subtitle: 'અમારા દ્વારા', text: 'અમે તે એકાઉન્ટને સ્થગિત કે સમાપ્ત કરવાનો અધિકાર અનામત રાખીએ છીએ જેઓ આ શરતોનું ઉલ્લંઘન કરે છે, છેતરપિંડી સંબંધિત પ્રવૃત્તિમાં સામેલ થાય છે, અથવા એપ્લિકેશનનો દુરુપયોગ કરે છે.' },
        { subtitle: 'સમાપ્તિની અસર', text: 'સમાપ્તિ પર, એપ્લિકેશનનો ઉપયોગ કરવાનો તમારો અધિકાર તરત જ સમાપ્ત થઈ જાય છે. આ શરતોની તે જોગવાઈઓ જે તેના સ્વભાવથી સમાપ્તિ પછી પણ ટકી રહેવી જોઈએ, તે ચાલુ રહી શકે છે.' },
      ],
    },
  ],
};


// ── Reusable section component ────────────────────────────────────────────────
function TermsSection({ section, isExpanded, onToggle }: {
  section: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={[ts.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <TouchableOpacity style={ts.header} onPress={onToggle} activeOpacity={0.8}>
        <View style={[ts.iconWrap, { backgroundColor: section.iconBg }]}>
          <Ionicons name={section.icon as any} size={18} color={section.iconColor} />
        </View>
        <Text style={[ts.title, { color: theme.text }]}>{section.title}</Text>
        <View style={[ts.chevron, { backgroundColor: theme.inputBg }]}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14} color={theme.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={[ts.body, { borderTopColor: theme.borderLight }]}>
          {section.content.map((item: { subtitle: string; text: string }, i: number) => (
            <View key={i} style={[ts.item, i < section.content.length - 1 && { borderBottomColor: theme.borderLight, borderBottomWidth: 1 }]}>
              <Text style={[ts.subtitle, { color: section.iconColor }]}>{item.subtitle}</Text>
              <Text style={[ts.text, { color: theme.textSecondary }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const ts = StyleSheet.create({
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
export default function TermsConditionsScreen() {
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
          <View style={[s.headerIconWrap, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="document-text" size={16} color="#1565C0" />
          </View>
          <Text style={[s.headerTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.headerTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero banner ── */}
        <LinearGradient
          colors={['#0C1445', '#1E3A8A', '#1D4ED8']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.heroBlob1} /><View style={s.heroBlob2} />
          <View style={s.heroIconCircle}>
            <Ionicons name="document-text" size={40} color="#FFFFFF" />
          </View>
          <Text style={s.heroTitle}>{UI_TEXTS[currentLang]?.heroTitle}</Text>
          <Text style={s.heroSub}>
            Please read these terms carefully before using Kisan Mitra. They govern your use of our app and services.
          </Text>
          <View style={s.heroDates}>
            <View style={s.heroBadge}>
              <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={s.heroBadgeTxt}>{UI_TEXTS[currentLang]?.effective} {EFFECTIVE_DATE}</Text>
            </View>
            <View style={s.heroBadge}>
              <Ionicons name="refresh-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={s.heroBadgeTxt}>{UI_TEXTS[currentLang]?.updated} {LAST_UPDATED}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Key points ── */}
        <View style={[s.keyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[s.keyTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.keyTitle}</Text>
          {[
            { icon: 'checkmark-circle', color: theme.primary,    text: 'Free to use for all Indian farmers' },
            { icon: 'checkmark-circle', color: theme.primary,    text: 'Your farm data belongs to you' },
            { icon: 'alert-circle',     color: theme.secondary,  text: 'Mandi prices are informational only' },
            { icon: 'alert-circle',     color: theme.secondary,  text: 'Weather data is not guaranteed accurate' },
            { icon: 'close-circle',     color: theme.red,        text: 'No financial advice is provided' },
            { icon: 'close-circle',     color: theme.red,        text: 'Not an official government app' },
          ].map((item, i) => (
            <View key={i} style={s.keyRow}>
              <Ionicons name={item.icon as any} size={16} color={item.color} />
              <Text style={[s.keyText, { color: theme.textSecondary }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Expandable sections ── */}
        <View style={s.sections}>
          {sections.map(section => (
            <TermsSection
              key={section.id}
              section={section}
              isExpanded={expanded === section.id}
              onToggle={() => toggle(section.id)}
            />
          ))}
        </View>

        {/* ── Contact card ── */}
        <View style={[s.contactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[s.contactIconWrap, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="mail-outline" size={22} color="#1565C0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.contactTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.contactTitle}</Text>
            <Text style={[s.contactSub, { color: theme.textSecondary }]}>
              Contact our legal team at
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {})}
              activeOpacity={0.7}
            >
              <Text style={[s.contactEmail, { color: '#1565C0' }]}>{CONTACT_EMAIL}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Agree note ── */}
        <View style={[s.agreeCard, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }]}>
          <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
          <Text style={[s.agreeText, { color: theme.primary }]}>
            By using {APP_NAME}, you confirm that you have read, understood, and agreed to these Terms and Conditions.
          </Text>
        </View>

        {/* ── Footer ── */}
        <Text style={[s.footer, { color: theme.textMuted }]}>
          © 2026 {APP_NAME}. All rights reserved.{'\n'}
          These terms are effective as of {EFFECTIVE_DATE}.
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
  heroBlob1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.04)', top: -50, right: -30 },
  heroBlob2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(147,197,253,0.08)', bottom: -10, left: 20 },
  heroIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: SPACING.md,
  },
  heroTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4, marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22, marginBottom: SPACING.md },
  heroDates: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroBadgeTxt: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  // Key points card
  keyCard: {
    marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, ...SHADOW.sm,
  },
  keyTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', marginBottom: SPACING.sm, letterSpacing: -0.2 },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  keyText: { fontSize: FONT_SIZE.sm, fontWeight: '500', flex: 1 },

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

  // Agree card
  agreeCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginHorizontal: SPACING.md, marginTop: SPACING.md,
    borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1,
  },
  agreeText: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '600', lineHeight: 20 },

  // Footer
  footer: {
    fontSize: FONT_SIZE.xs, textAlign: 'center',
    lineHeight: 18, marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
});

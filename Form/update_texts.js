const fs = require('fs');

const termsPath = 'app/terms-conditions.tsx';
let termsCode = fs.readFileSync(termsPath, 'utf8');

const uiTexts = `
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
    footer: '© 2026 {APP_NAME}. All rights reserved.\\nThese terms are effective as of {EFFECTIVE_DATE}.'
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
    footer: '© 2026 {APP_NAME}। सर्वाधिकार सुरक्षित।\\nये शर्तें {EFFECTIVE_DATE} से प्रभावी हैं।'
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
    footer: '© 2026 {APP_NAME}. સર્વાધિકાર સુરક્ષિત.\\nઆ શરતો {EFFECTIVE_DATE} થી લાગુ છે.'
  }
};
`;

const localizedSections = `
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
        { subtitle: 'Prohibited Activities', text: 'You must not: (a) use the app for any illegal purpose; (b) attempt to reverse engineer or hack the app; (c) create fake accounts or impersonate others; (d) use automated tools to scrape data; (e) interfere with the app\\'s security features.' },
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
`;

termsCode = termsCode.replace(/const SECTIONS = \[[\s\S]*?\];\s*\/\/\s*── Reusable section/, uiTexts + "\n" + localizedSections + "\n\n// ── Reusable section");
termsCode = termsCode.replace(/item: any,\s*i: any/, "item: { subtitle: string; text: string }, i: number");

fs.writeFileSync(termsPath, termsCode);

// Privacy
const privPath = 'app/privacy-policy.tsx';
let privCode = fs.readFileSync(privPath, 'utf8');

const uiPrivTexts = `
const UI_TEXTS: Record<string, any> = {
  en: {
    headerTitle: 'Privacy Policy',
    heroTitle: 'Your Privacy Matters',
    heroSub: 'Kisan Mitra is built for Indian farmers. We are committed to protecting your personal data and being transparent about how we use it.',
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
    footer: '© 2026 {APP_NAME}. All rights reserved.\\nThis policy is effective as of {LAST_UPDATED}.'
  },
  hi: {
    headerTitle: 'गोपनीयता नीति',
    heroTitle: 'आपकी गोपनीयता महत्वपूर्ण है',
    heroSub: 'किसान मित्र भारतीय किसानों के लिए बनाया गया है। हम आपके व्यक्तिगत डेटा की सुरक्षा करने और हम इसका उपयोग कैसे करते हैं, इस बारे में पारदर्शी रहने के लिए प्रतिबद्ध हैं।',
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
    footer: '© 2026 {APP_NAME}। सर्वाधिकार सुरक्षित।\\nयह नीति {LAST_UPDATED} से प्रभावी है।'
  },
  gu: {
    headerTitle: 'ગોપનીયતા નીતિ',
    heroTitle: 'તમારી ગોપનીયતા મહત્વપૂર્ણ છે',
    heroSub: 'કિસાન મિત્ર ભારતીય ખેડૂતો માટે બનાવવામાં આવ્યું છે. અમે તમારા વ્યક્તિગત ડેટાને સુરક્ષિત કરવા અને તેનો ઉપયોગ કેવી રીતે કરીએ છીએ તેના વિશે પારદર્શક રહેવા માટે પ્રતિબદ્ધ છીએ.',
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
    footer: '© 2026 {APP_NAME}. સર્વાધિકાર સુરક્ષિત.\\nઆ નીતિ {LAST_UPDATED} થી લાગુ છે.'
  }
};
`;

const localizedPrivSections = `
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
        { subtitle: 'Data Portability', text: 'You can request a copy of all your data by contacting us at privacy@kisanmitra.app. We will provide it within 30 days.' },
        { subtitle: 'Account Deletion', text: 'You can permanently delete your account and all associated data from Settings → Delete Account. This requires OTP verification for security.' },
        { subtitle: 'Notification Control', text: 'You can enable or disable specific notification types (weather, mandi, reminders) from Settings → Notifications at any time.' },
      ],
    },
    {
      id: '6', icon: 'document-text-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'Children\\'s Privacy',
      content: [
        { subtitle: 'Age Requirement', text: 'Kisan Mitra is intended for farmers and agricultural workers aged 18 and above. We do not knowingly collect personal information from children under 18.' },
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
        { subtitle: 'डेटा पोर्टेबिलिटी', text: 'आप privacy@kisanmitra.app पर हमसे संपर्क करके अपने सभी डेटा की प्रतिलिपि का अनुरोध कर सकते हैं। हम इसे 30 दिनों के भीतर प्रदान करेंगे।' },
        { subtitle: 'खाता हटाना', text: 'आप सेटिंग्स → खाता हटाएँ से अपना खाता और सभी दर्ज डेटा को स्थायी रूप से हटा सकते हैं। सुरक्षा के लिए इसमें OTP सत्यापन की आवश्यकता होती है।' },
        { subtitle: 'सूचना नियंत्रण', text: 'आप किसी भी समय सेटिंग्स → सूचनाओं से विशिष्ट अधिसूचना प्रकारों (मौसम, मंडी, अनुस्मारक) को सक्षम या अक्षम कर सकते हैं।' },
      ],
    },
    {
      id: '6', icon: 'document-text-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'बच्चों की गोपनीयता',
      content: [
        { subtitle: 'आयु की आवश्यकता', text: 'किसान मित्र 18 वर्ष और उससे अधिक आयु के किसानों और कृषि श्रमिकों के लिए है। हम जानबूझकर 18 वर्ष से कम उम्र के बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते हैं।' },
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
        { subtitle: 'ડેટા પોર્ટેબિલિટી', text: 'તમે privacy@kisanmitra.app પર અમારો સંપર્ક કરીને તમારા તમામ ડેટાની નકલ માંગી શકો છો. અમે 30 દિવસમાં તેને પૂરી પાડીશું.' },
        { subtitle: 'એકાઉન્ટ કાઢી નાખવું', text: 'તમે સેટિંગ્સ → એકાઉન્ટ કાઢી નાખોમાંથી તમારું એકાઉન્ટ કાયમ માટે રદ કરી શકો છો. આ ક્રિયા માટે OTP દ્વારા સુરક્ષા ચકાસણીની જરૂર પડે છે.' },
        { subtitle: 'નોટિફિકેશન કંટ્રોલ', text: 'તમે સેટિંગ્સ → સૂચનાઓમાંથી કોઈપણ સમયે ચોક્કસ પ્રકારની સૂચનાઓ (હવામાન, મંડી, રિમાઇન્ડર) ચાલુ અથવા બંધ કરી શકો છો.' },
      ],
    },
    {
      id: '6', icon: 'document-text-outline', iconColor: '#1565C0', iconBg: '#E3F2FD',
      title: 'બાળકોની ગોપનીયતા',
      content: [
        { subtitle: 'ઉંમર લાયકાત', text: 'કિસાન મિત્ર 18 અને તેથી વધુ ઉંમરના ખેડૂતો માટે છે. અમે જાણીજોઈને 18 વર્ષથી ઓછી ઉંમરના બાળકોની વ્યક્તિગત માહિતી એકત્રિત કરતા નથી.' },
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
`;

privCode = privCode.replace(/const SECTIONS = \[[\s\S]*?\];\s*\/\/\s*── Reusable section/, uiPrivTexts + "\n" + localizedPrivSections + "\n\n// ── Reusable section");
privCode = privCode.replace(/item: any,\s*i: any/, "item: { subtitle: string; text: string }, i: number");

fs.writeFileSync(privPath, privCode);

console.log("Regex replace finished.");

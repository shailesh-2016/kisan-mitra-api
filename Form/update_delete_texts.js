const fs = require('fs');

const path = 'app/delete-account.tsx';
let code = fs.readFileSync(path, 'utf8');

const uiTexts = `
const UI_TEXTS: Record<string, any> = {
  en: {
    headerTitle: 'Delete Account',
    step1Label: 'Warning',
    step2Label: 'Confirm',
    step3Label: 'Verify OTP',
    warningTitle: 'Delete Your Account?',
    warningSubPrefix: 'This action is ',
    warningSubWord: 'permanent',
    warningSubSuffix: ' and cannot be undone.',
    lossTitle: 'What will be permanently deleted:',
    losses: [
      { icon: 'person', label: 'Your profile and personal data' },
      { icon: 'construct', label: 'All machines and usage entries' },
      { icon: 'calculator', label: 'All profit calculation history' },
      { icon: 'alarm', label: 'All reminders and notifications' },
      { icon: 'shield-checkmark', label: 'Account access forever' }
    ],
    toDeleteBadge: 'To Delete',
    proceedBtn: 'I understand, proceed',
    cancelBtn: 'Cancel — Keep my account',
    confirmTitle: 'Type to Confirm',
    confirmSubPrefix: 'To confirm deletion, type ',
    confirmSubWord: 'DELETE',
    confirmSubSuffix: ' in the box below.',
    confirmPlaceholder: 'Type DELETE here',
    confirmHint: 'Must match exactly: DELETE',
    sendOtpBtn: 'Send Verification OTP',
    otpNote: 'An OTP will be sent to ',
    otpTitle: 'Enter OTP',
    otpSub: 'Enter the 6-digit OTP sent to',
    deleteBtn: 'Permanently Delete Account',
    resendTimerPrefix: 'Resend OTP in ',
    resendBtn: 'Resend OTP',
    toastOtpSent: 'OTP sent to +91',
    toastDeleteSuccess: 'Account deleted successfully',
    toastInvalidOtp: 'Invalid OTP. Try again.',
    toastNewOtp: 'New OTP sent'
  },
  hi: {
    headerTitle: 'खाता हटाएं',
    step1Label: 'चेतावनी',
    step2Label: 'पुष्टि करें',
    step3Label: 'OTP सत्यापित करें',
    warningTitle: 'क्या आप खाता हटाना चाहते हैं?',
    warningSubPrefix: 'यह कार्रवाई ',
    warningSubWord: 'स्थायी',
    warningSubSuffix: ' है और इसे पूर्ववत नहीं किया जा सकता है।',
    lossTitle: 'क्या स्थायी रूप से हटा दिया जाएगा:',
    losses: [
      { icon: 'person', label: 'आपकी प्रोफ़ाइल और व्यक्तिगत डेटा' },
      { icon: 'construct', label: 'सभी मशीनें और उपयोग रिकॉर्ड' },
      { icon: 'calculator', label: 'लाभ गणना का पूरा इतिहास' },
      { icon: 'alarm', label: 'सभी अनुस्मारक और सूचनाएं' },
      { icon: 'shield-checkmark', label: 'खाते का एक्सेस हमेशा के लिए' }
    ],
    toDeleteBadge: 'हटाए जाने के लिए',
    proceedBtn: 'मैं समझ गया, आगे बढ़ें',
    cancelBtn: 'रद्द करें — मेरा खाता रखें',
    confirmTitle: 'पुष्टि करने के लिए लिखें',
    confirmSubPrefix: 'खाता हटाने की पुष्टि के लिए, नीचे दिए गए बॉक्स में ',
    confirmSubWord: 'DELETE',
    confirmSubSuffix: ' लिखें।',
    confirmPlaceholder: 'यहाँ DELETE लिखें',
    confirmHint: 'सटीक रूप से मेल खाना चाहिए: DELETE',
    sendOtpBtn: 'सत्यापन OTP भेजें',
    otpNote: 'OTP इस नंबर पर भेजा जाएगा: ',
    otpTitle: 'OTP दर्ज करें',
    otpSub: 'कृपया इस नंबर पर भेजा गया 6-अंकीय OTP दर्ज करें:',
    deleteBtn: 'खाता स्थायी रूप से हटाएं',
    resendTimerPrefix: 'OTP फिर से भेजें: ',
    resendBtn: 'फिर से OTP भेजें',
    toastOtpSent: 'OTP +91 पर भेजा गया',
    toastDeleteSuccess: 'खाता सफलतापूर्वक हटा दिया गया',
    toastInvalidOtp: 'अमान्य OTP। पुनः प्रयास करें।',
    toastNewOtp: 'नया OTP भेजा गया'
  },
  gu: {
    headerTitle: 'એકાઉન્ટ કાઢી નાખો',
    step1Label: 'ચેતવણી',
    step2Label: 'પુષ્ટિ કરો',
    step3Label: 'OTP ચકાસો',
    warningTitle: 'તમારું એકાઉન્ટ કાઢી નાખવું છે?',
    warningSubPrefix: 'આ ક્રિયા ',
    warningSubWord: 'કાયમી',
    warningSubSuffix: ' છે અને તેને પાછી વાળી શકાતી નથી.',
    lossTitle: 'શું કાયમી ધોરણે ભૂંસી નાખવામાં આવશે:',
    losses: [
      { icon: 'person', label: 'તમારી પ્રોફાઇલ અને વ્યક્તિગત ડેટા' },
      { icon: 'construct', label: 'બધા મશીનો અને વપરાશના રેકોર્ડ' },
      { icon: 'calculator', label: 'બધા નફાની ગણતરીનો ઇતિહાસ' },
      { icon: 'alarm', label: 'બધા રિમાઇન્ડર અને સૂચનાઓ' },
      { icon: 'shield-checkmark', label: 'એકાઉન્ટની ઍક્સેસ કાયમ માટે' }
    ],
    toDeleteBadge: 'રદ કરવા માટે',
    proceedBtn: 'હું સમજી ગયો, આગળ વધો',
    cancelBtn: 'રદ કરો — મારું એકાઉન્ટ રાખો',
    confirmTitle: 'પુષ્ટિ કરવા માટે ટાઇપ કરો',
    confirmSubPrefix: 'કાઢી નાખવાની પુષ્ટિ કરવા માટે, નીચેના બોક્સમાં ',
    confirmSubWord: 'DELETE',
    confirmSubSuffix: ' ટાઇપ કરો.',
    confirmPlaceholder: 'અહીં DELETE ટાઇપ કરો',
    confirmHint: 'ચોકસાઇથી મેળ ખાતો હોવો જોઈએ: DELETE',
    sendOtpBtn: 'ચકાસણી OTP મોકલો',
    otpNote: 'આ નંબર પર OTP મોકલવામાં આવશે: ',
    otpTitle: 'OTP દાખલ કરો',
    otpSub: 'આ નંબર પર મોકલેલો 6-અંકનો OTP દાખલ કરો:',
    deleteBtn: 'કાયમી ધોરણે એકાઉન્ટ કાઢી નાખો',
    resendTimerPrefix: 'ફરીથી OTP મોકલો: ',
    resendBtn: 'OTP ફરીથી મોકલો',
    toastOtpSent: 'OTP +91 પર મોકલાયો',
    toastDeleteSuccess: 'એકાઉન્ટ સફળતાપૂર્વક કાઢી નાખાયું',
    toastInvalidOtp: 'અમાન્ય OTP. ફરી પ્રયાસ કરો.',
    toastNewOtp: 'નવો OTP મોકલાયો'
  }
};
`;

code = code.replace("import { useTheme } from '../context/ThemeContext';", "import { useTheme } from '../context/ThemeContext';\n" + uiTexts);

code = code.replace("const { t }    = useTranslation();", "const { t, i18n } = useTranslation();\n  const currentLang = i18n.language || 'en';");

// Replace Toasts
code = code.replace(/text1: \`OTP sent to \+91 \$\{user\?\.mobile\}\`/g, "text1: `${UI_TEXTS[currentLang]?.toastOtpSent} ${user?.mobile}`");
code = code.replace(/text1: 'Account deleted successfully'/g, "text1: UI_TEXTS[currentLang]?.toastDeleteSuccess");
code = code.replace(/text1: err\.message \|\| 'Invalid OTP\. Try again\.'/g, "text1: err.message || UI_TEXTS[currentLang]?.toastInvalidOtp");
code = code.replace(/text1: 'New OTP sent'/g, "text1: UI_TEXTS[currentLang]?.toastNewOtp");

// Header Title
code = code.replace(/<Text style=\{\[s\.headerTitle, \{ color: theme\.text \}\]\}>Delete Account<\/Text>/g, "<Text style={[s.headerTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.headerTitle}</Text>");

// Step indicator
code = code.replace(
  "{step === 1 ? 'Warning' : step === 2 ? 'Confirm' : 'Verify OTP'}",
  "{step === 1 ? UI_TEXTS[currentLang]?.step1Label : step === 2 ? UI_TEXTS[currentLang]?.step2Label : UI_TEXTS[currentLang]?.step3Label}"
);

// Warning screen
code = code.replace(
  /<Text style=\{\[s\.bigTitle, \{ color: theme\.text \}\]\}>Delete Your Account\?<\/Text>/,
  "<Text style={[s.bigTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.warningTitle}</Text>"
);
code = code.replace(
  /<Text style=\{\[s\.bigSub, \{ color: theme\.textSecondary \}\]\}>\s*This action is <Text style=\{\{ color: theme\.red, fontWeight: '800' \}\}>permanent<\/Text> and cannot be undone\.\s*<\/Text>/m,
  "<Text style={[s.bigSub, { color: theme.textSecondary }]}>\n                {UI_TEXTS[currentLang]?.warningSubPrefix}<Text style={{ color: theme.red, fontWeight: '800' }}>{UI_TEXTS[currentLang]?.warningSubWord}</Text>{UI_TEXTS[currentLang]?.warningSubSuffix}\n              </Text>"
);
code = code.replace(
  /<Text style=\{\[s\.lossTitle, \{ color: theme\.red \}\]\}>What will be permanently deleted:<\/Text>/,
  "<Text style={[s.lossTitle, { color: theme.red }]}>{UI_TEXTS[currentLang]?.lossTitle}</Text>"
);

// Losses map replacement
const origLosses = `\\[\\s*\\{\\s*icon: 'person',\s*label: 'Your profile and personal data'\s*\\},\\s*\\{\\s*icon: 'construct',\s*label: 'All machines and usage entries'\s*\\},\\s*\\{\\s*icon: 'calculator',\s*label: 'All profit calculation history'\s*\\},\\s*\\{\\s*icon: 'alarm',\s*label: 'All reminders and notifications'\s*\\},\\s*\\{\\s*icon: 'shield-checkmark', label: 'Account access forever'\s*\\},\\s*\\]`;
code = code.replace(new RegExp(origLosses), "(UI_TEXTS[currentLang]?.losses || [])");

// user info texts
code = code.replace(
  /<Text style=\{\[s\.deleteBadgeTxt, \{ color: theme\.red \}\]\}>To Delete<\/Text>/,
  "<Text style={[s.deleteBadgeTxt, { color: theme.red }]}>{UI_TEXTS[currentLang]?.toDeleteBadge}</Text>"
);
code = code.replace(
  /<Text style=\{\[s\.proceedBtnTxt, \{ color: theme\.red \}\]\}>I understand, proceed<\/Text>/,
  "<Text style={[s.proceedBtnTxt, { color: theme.red }]}>{UI_TEXTS[currentLang]?.proceedBtn}</Text>"
);
code = code.replace(
  /<Text style=\{\[s\.cancelLinkTxt, \{ color: theme\.textSecondary \}\]\}>Cancel — Keep my account<\/Text>/g,
  "<Text style={[s.cancelLinkTxt, { color: theme.textSecondary }]}>{UI_TEXTS[currentLang]?.cancelBtn}</Text>"
);

// Confirm screen
code = code.replace(
  /<Text style=\{\[s\.bigTitle, \{ color: theme\.text \}\]\}>Type to Confirm<\/Text>/,
  "<Text style={[s.bigTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.confirmTitle}</Text>"
);
code = code.replace(
  /<Text style=\{\[s\.bigSub, \{ color: theme\.textSecondary \}\]\}>\s*To confirm deletion, type\{' '\}\s*<Text style=\{\[s\.deleteWord, \{ color: theme\.red \}\]\}>DELETE<\/Text>\s*\{' '\}in the box below\.\s*<\/Text>/m,
  "<Text style={[s.bigSub, { color: theme.textSecondary }]}>\n                {UI_TEXTS[currentLang]?.confirmSubPrefix}\n                <Text style={[s.deleteWord, { color: theme.red }]}>{UI_TEXTS[currentLang]?.confirmSubWord}</Text>\n                {UI_TEXTS[currentLang]?.confirmSubSuffix}\n              </Text>"
);
code = code.replace(
  /placeholder="Type DELETE here"/,
  "placeholder={UI_TEXTS[currentLang]?.confirmPlaceholder}"
);
code = code.replace(
  /<Text style=\{\[s\.confirmHint, \{ color: theme\.textMuted \}\]\}>\s*Must match exactly: DELETE\s*<\/Text>/m,
  "<Text style={[s.confirmHint, { color: theme.textMuted }]}>{UI_TEXTS[currentLang]?.confirmHint}</Text>"
);
code = code.replace(
  /<Text style=\{\[s\.otpBtnTxt, \{ color: confirmValid \? '#FFF' : theme\.textMuted \}\]\}>\s*Send Verification OTP\s*<\/Text>/m,
  "<Text style={[s.otpBtnTxt, { color: confirmValid ? '#FFF' : theme.textMuted }]}>{UI_TEXTS[currentLang]?.sendOtpBtn}</Text>"
);
code = code.replace(
  /<Text style=\{\[s\.otpNote, \{ color: theme\.textSecondary \}\]\}>\s*An OTP will be sent to\{' '\}\s*<Text/m,
  "<Text style={[s.otpNote, { color: theme.textSecondary }]}>\n                {UI_TEXTS[currentLang]?.otpNote}\n                <Text"
);

// OTP screen
code = code.replace(
  /<Text style=\{\[s\.bigTitle, \{ color: theme\.text \}\]\}>Enter OTP<\/Text>/,
  "<Text style={[s.bigTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.otpTitle}</Text>"
);
code = code.replace(
  /Enter the 6-digit OTP sent to\{'\\n'\}/,
  "{UI_TEXTS[currentLang]?.otpSub}{'\\n'}"
);
code = code.replace(
  /<Text style=\{\[s\.deleteConfirmBtnTxt, \{ color: filled === OTP_LEN \? '#FFF' : theme\.textMuted \}\]\}>\s*Permanently Delete Account\s*<\/Text>/m,
  "<Text style={[s.deleteConfirmBtnTxt, { color: filled === OTP_LEN ? '#FFF' : theme.textMuted }]}>{UI_TEXTS[currentLang]?.deleteBtn}</Text>"
);
code = code.replace(
  /<Text style=\{\[s\.resendTimer, \{ color: theme\.textSecondary \}\]\}>\s*Resend OTP in \{resendSec\}s\s*<\/Text>/m,
  "<Text style={[s.resendTimer, { color: theme.textSecondary }]}>\n                    {UI_TEXTS[currentLang]?.resendTimerPrefix}{resendSec}s\n                  </Text>"
);
code = code.replace(
  /<Text style=\{\[s\.resendLink, \{ color: theme\.red \}\]\}>Resend OTP<\/Text>/,
  "<Text style={[s.resendLink, { color: theme.red }]}>{UI_TEXTS[currentLang]?.resendBtn}</Text>"
);

fs.writeFileSync(path, code);
console.log('Delete Account text modified completely!');

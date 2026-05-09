// ─────────────────────────────────────────────────────────────────────────────
// schemeData.ts  —  20 real Indian Govt Schemes & Subsidies (EN / HI / GU)
// ─────────────────────────────────────────────────────────────────────────────

export type SchemeKey =
  | 'pmKisan' | 'pmFasalBima' | 'kisanCreditCard' | 'soilHealth'
  | 'pmKrishiSinchai' | 'eNAM' | 'paramparagatKrishi' | 'rkvy'
  | 'kisanMaandhan' | 'pmKusumYojana'
  | 'tractorSubsidy' | 'dripSubsidy' | 'solarPumpSubsidy'
  | 'seedSubsidy' | 'fertilizerSubsidy' | 'farmEquipSubsidy'
  | 'polyhouseSubsidy' | 'coldStorageSubsidy' | 'dairySubsidy' | 'sprayerSubsidy';

type L = { en: string; hi: string; gu: string };

export interface SchemeDetail {
  benefits: L[];
  eligibility: L[];
  docs: L[];
  steps: L[];
}

export const SCHEME_DATA: Record<SchemeKey, SchemeDetail> = {

  // ── 1. PM-Kisan Samman Nidhi ────────────────────────────────────────────────
  pmKisan: {
    benefits: [
      { en: '₹6,000 per year in 3 equal installments of ₹2,000', hi: '₹6,000 प्रति वर्ष 3 किस्तों में (₹2,000 प्रत्येक)', gu: '₹6,000 દર વર્ષે 3 હપ્તામાં (₹2,000 દરેક)' },
      { en: 'Money transferred directly to bank account', hi: 'पैसा सीधे बैंक खाते में', gu: 'પૈસા સીધા બેંક ખાતામાં' },
      { en: 'No middleman — full amount reaches farmer', hi: 'कोई बिचौलिया नहीं — पूरी राशि किसान को', gu: 'કોઈ વચેટિયો નહીં — પૂરી રકમ ખેડૂતને' },
    ],
    eligibility: [
      { en: 'Small & marginal farmers owning up to 2 hectares', hi: '2 हेक्टेयर तक भूमि वाले छोटे किसान', gu: '2 હેક્ટર સુધી જમીન ધરાવતા નાના ખેડૂત' },
      { en: 'Valid Aadhaar card required', hi: 'वैध आधार कार्ड आवश्यक', gu: 'માન્ય આધાર કાર્ડ જરૂરી' },
      { en: 'Bank account linked with Aadhaar', hi: 'आधार से जुड़ा बैंक खाता', gu: 'આધાર સાથે જોડાયેલ બેંક ખાતું' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Land Records (7/12 Utara)', hi: 'भूमि रिकॉर्ड (7/12)', gu: 'જમીન રેકોર્ડ (7/12 ઉતારો)' },
      { en: 'Mobile Number', hi: 'मोबाइल नंबर', gu: 'મોબાઇલ નંબર' },
    ],
    steps: [
      { en: 'Visit nearest CSC center or pmkisan.gov.in', hi: 'नजदीकी CSC केंद्र या pmkisan.gov.in जाएं', gu: 'નજીકના CSC કેન્દ્ર અથવા pmkisan.gov.in જાઓ' },
      { en: 'Fill PM Kisan registration form', hi: 'PM किसान पंजीकरण फॉर्म भरें', gu: 'PM કિસાન નોંધણી ફોર્મ ભરો' },
      { en: 'Submit Aadhaar, land records & bank details', hi: 'आधार, भूमि रिकॉर्ड और बैंक विवरण जमा करें', gu: 'આધાર, જમીન રેકોર્ડ અને બેંક વિગત જમા કરો' },
      { en: 'Verification done by state government', hi: 'राज्य सरकार द्वारा सत्यापन', gu: 'રાજ્ય સરકાર દ્વારા ચકાસણી' },
      { en: 'First installment credited within 30 days', hi: '30 दिनों में पहली किस्त जमा', gu: '30 દિવસમાં પ્રથમ હપ્તો જમા' },
    ],
  },

  // ── 2. PM Fasal Bima Yojana ─────────────────────────────────────────────────
  pmFasalBima: {
    benefits: [
      { en: 'Full crop loss covered due to flood, drought, pest', hi: 'बाढ़, सूखा, कीट से फसल नुकसान का पूरा मुआवजा', gu: 'પૂર, દુષ્કાળ, જીવાત થી પાક નુકસાનનું પૂરું વળતર' },
      { en: 'Very low premium: 2% for Kharif, 1.5% for Rabi', hi: 'बहुत कम प्रीमियम: खरीफ 2%, रबी 1.5%', gu: 'ઓછું પ્રીમિયમ: ખરીફ 2%, રવિ 1.5%' },
      { en: 'Quick claim settlement within 2 months', hi: '2 महीने में त्वरित दावा निपटान', gu: '2 મહિનામાં ઝડપી દાવો નિકાલ' },
    ],
    eligibility: [
      { en: 'All farmers growing notified crops', hi: 'सभी अधिसूचित फसल उगाने वाले किसान', gu: 'બધા સૂચિત પાક ઉગાડતા ખેડૂત' },
      { en: 'Both loanee and non-loanee farmers', hi: 'ऋणी और गैर-ऋणी दोनों किसान', gu: 'ઋણ અને બિન-ઋણ બંને ખેડૂત' },
      { en: 'Must enroll before crop season deadline', hi: 'फसल मौसम की समय सीमा से पहले नामांकन', gu: 'પાક સીઝન ડેડલાઇન પહેલા નોંધણી' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Sowing Certificate', hi: 'बुवाई प्रमाण पत्र', gu: 'વાવણી પ્રમાણપત્ર' },
      { en: 'Land Records (7/12)', hi: 'भूमि रिकॉर्ड (7/12)', gu: 'જમીન રેકોર્ડ (7/12)' },
    ],
    steps: [
      { en: 'Contact nearest bank or CSC before deadline', hi: 'समय सीमा से पहले बैंक या CSC जाएं', gu: 'ડેડલાઇન પહેલા બેંક અથવા CSC જાઓ' },
      { en: 'Fill crop insurance form', hi: 'फसल बीमा फॉर्म भरें', gu: 'પાક વીમા ફોર્મ ભરો' },
      { en: 'Pay small premium amount', hi: 'छोटी प्रीमियम राशि जमा करें', gu: 'નાની પ્રીમિયમ રકમ ભરો' },
      { en: 'Receive policy document', hi: 'पॉलिसी दस्तावेज प्राप्त करें', gu: 'પોલિસી દસ્તાવેજ મેળવો' },
    ],
  },

  // ── 3. Kisan Credit Card ────────────────────────────────────────────────────
  kisanCreditCard: {
    benefits: [
      { en: 'Short-term credit up to ₹3 lakh at 4% interest', hi: '4% ब्याज पर ₹3 लाख तक अल्पकालिक ऋण', gu: '4% વ્યાજ પર ₹3 લાખ સુધી ટૂંકા ગાળાનું ધિરાણ' },
      { en: 'No collateral needed for loans up to ₹1.6 lakh', hi: '₹1.6 लाख तक ऋण के लिए कोई गारंटी नहीं', gu: '₹1.6 લાખ સુધી ધિરાણ માટે ગેરંટી નહીં' },
      { en: 'Flexible repayment after harvest', hi: 'फसल के बाद लचीला पुनर्भुगतान', gu: 'પાક પછી લવચીક ચૂકવણી' },
    ],
    eligibility: [
      { en: 'All farmers, sharecroppers, tenant farmers', hi: 'सभी किसान, बटाईदार, किरायेदार किसान', gu: 'બધા ખેડૂત, ભાગ ખેડૂત, ભાડૂત ખેડૂત' },
      { en: 'Self Help Groups involved in farming', hi: 'खेती में लगे स्वयं सहायता समूह', gu: 'ખેતીમાં સામેલ સ્વ-સહાય જૂથ' },
      { en: 'Age 18 to 75 years', hi: 'आयु 18 से 75 वर्ष', gu: 'ઉંમર 18 થી 75 વર્ષ' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'PAN Card', hi: 'पैन कार्ड', gu: 'PAN કાર્ડ' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
      { en: 'Passport Size Photo', hi: 'पासपोर्ट साइज फोटो', gu: 'પાસપોર્ટ સાઇઝ ફોટો' },
    ],
    steps: [
      { en: 'Visit nearest bank branch', hi: 'नजदीकी बैंक शाखा जाएं', gu: 'નજીકની બેંક શાખા જાઓ' },
      { en: 'Fill KCC application form', hi: 'KCC आवेदन फॉर्म भरें', gu: 'KCC અરજી ફોર્મ ભરો' },
      { en: 'Submit all documents', hi: 'सभी दस्तावेज जमा करें', gu: 'બધા દસ્તાવેજ જમા કરો' },
      { en: 'Card issued within 15 working days', hi: '15 कार्य दिवसों में कार्ड जारी', gu: '15 કામકાજના દિવસોમાં કાર્ડ' },
    ],
  },

  // ── 4. Soil Health Card Scheme ──────────────────────────────────────────────
  soilHealth: {
    benefits: [
      { en: 'Free soil testing every 2 years', hi: 'हर 2 साल में मुफ्त मिट्टी परीक्षण', gu: 'દર 2 વર્ષે મફત માટી પરીક્ષણ' },
      { en: 'Crop-wise fertilizer recommendation', hi: 'फसल के अनुसार उर्वरक सिफारिश', gu: 'પાક મુજબ ખાતર ભલામણ' },
      { en: 'Saves money by avoiding excess fertilizer use', hi: 'अधिक उर्वरक से बचकर पैसे बचाएं', gu: 'વધારે ખાતર ટાળીને પૈસા બચાવો' },
    ],
    eligibility: [
      { en: 'All farmers with agricultural land', hi: 'कृषि भूमि वाले सभी किसान', gu: 'ખેતીની જમીન ધરાવતા બધા ખેડૂત' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
    ],
    steps: [
      { en: 'Contact local Agriculture Department office', hi: 'स्थानीय कृषि विभाग कार्यालय से संपर्क करें', gu: 'સ્થાનિક કૃષિ વિભાગ કાર્યાલય સાથે સંપર્ક' },
      { en: 'Soil sample collected from your field', hi: 'आपके खेत से मिट्टी का नमूना लिया जाएगा', gu: 'તમારા ખેતરમાંથી માટીનો નમૂનો લેવાશે' },
      { en: 'Lab testing takes about 14 days', hi: 'प्रयोगशाला परीक्षण में लगभग 14 दिन', gu: 'લેબ પરીક્ષણ લગભગ 14 દિવસ' },
      { en: 'Receive Soil Health Card with recommendations', hi: 'सिफारिशों के साथ मृदा स्वास्थ्य कार्ड प्राप्त करें', gu: 'ભલામણો સાથે માટી સ્વાસ્થ્ય કાર્ડ મેળવો' },
    ],
  },

  // ── 5. PM Krishi Sinchai Yojana ─────────────────────────────────────────────
  pmKrishiSinchai: {
    benefits: [
      { en: 'Subsidy on drip & sprinkler irrigation systems', hi: 'ड्रिप और स्प्रिंकलर सिंचाई पर सब्सिडी', gu: 'ટપક અને ફુવારા સિંચાઈ પર સબસિડી' },
      { en: 'Up to 55% subsidy for small farmers', hi: 'छोटे किसानों के लिए 55% तक सब्सिडी', gu: 'નાના ખેડૂત માટે 55% સુધી સબસિડી' },
      { en: 'Saves 40-50% water compared to flood irrigation', hi: 'बाढ़ सिंचाई की तुलना में 40-50% पानी बचत', gu: 'પૂર સિંચાઈ કરતાં 40-50% પાણી બચત' },
    ],
    eligibility: [
      { en: 'All farmers with own or leased land', hi: 'अपनी या पट्टे की भूमि वाले सभी किसान', gu: 'પોતાની અથવા ભાડાની જમીન ધરાવતા ખેડૂત' },
      { en: 'Water source must be available on farm', hi: 'खेत पर पानी का स्रोत होना चाहिए', gu: 'ખેતરમાં પાણીનો સ્ત્રોત હોવો જોઈએ' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records (7/12)', hi: 'भूमि रिकॉर्ड (7/12)', gu: 'જમીન રેકોર્ડ (7/12)' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Quotation from registered vendor', hi: 'पंजीकृत विक्रेता से कोटेशन', gu: 'નોંધાયેલ વિક્રેતા પાસેથી ક્વોટેશન' },
    ],
    steps: [
      { en: 'Apply online at pmksy.gov.in or visit Agriculture Dept', hi: 'pmksy.gov.in पर ऑनलाइन आवेदन या कृषि विभाग जाएं', gu: 'pmksy.gov.in પર ઓનલાઇન અરજી અથવા કૃષિ વિભાગ જાઓ' },
      { en: 'Submit land records and quotation', hi: 'भूमि रिकॉर्ड और कोटेशन जमा करें', gu: 'જમીન રેકોર્ડ અને ક્વોટેશન જમા કરો' },
      { en: 'Field inspection by department officer', hi: 'विभाग अधिकारी द्वारा खेत निरीक्षण', gu: 'વિભાગ અધિકારી દ્વારા ખેત નિરીક્ષણ' },
      { en: 'Install system after approval', hi: 'स्वीकृति के बाद सिस्टम लगाएं', gu: 'મંજૂરી પછી સિસ્ટમ લગાવો' },
      { en: 'Subsidy credited to bank account', hi: 'सब्सिडी बैंक खाते में जमा', gu: 'સબસિડી બેંક ખાતામાં જમા' },
    ],
  },

  // ── 6. e-NAM (National Agriculture Market) ─────────────────────────────────
  eNAM: {
    benefits: [
      { en: 'Sell crops online to buyers across India', hi: 'पूरे भारत में खरीदारों को ऑनलाइन फसल बेचें', gu: 'સમગ્ર ભારતમાં ખરીદારોને ઓનલાઇન પાક વેચો' },
      { en: 'Better price through transparent bidding', hi: 'पारदर्शी बोली से बेहतर कीमत', gu: 'પારદર્શી બોલી દ્વારા સારી કિંમત' },
      { en: 'Payment directly to bank account', hi: 'सीधे बैंक खाते में भुगतान', gu: 'સીધા બેંક ખાતામાં ચૂકવણી' },
    ],
    eligibility: [
      { en: 'Any farmer registered with local APMC mandi', hi: 'स्थानीय APMC मंडी में पंजीकृत कोई भी किसान', gu: 'સ્થાનિક APMC મંડીમાં નોંધાયેલ કોઈ પણ ખેડૂત' },
      { en: 'Valid mobile number and bank account', hi: 'वैध मोबाइल नंबर और बैंक खाता', gu: 'માન્ય મોબાઇલ નંબર અને બેંક ખાતું' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Mobile Number', hi: 'मोबाइल नंबर', gu: 'મોબાઇલ નંબર' },
    ],
    steps: [
      { en: 'Register at enam.gov.in or nearest APMC mandi', hi: 'enam.gov.in या नजदीकी APMC मंडी में पंजीकरण', gu: 'enam.gov.in અથવા નજીકની APMC મંડીમાં નોંધણી' },
      { en: 'Upload crop details and quality certificate', hi: 'फसल विवरण और गुणवत्ता प्रमाण पत्र अपलोड करें', gu: 'પાક વિગત અને ગુણવત્તા પ્રમાણપત્ર અપલોડ કરો' },
      { en: 'Buyers bid online for your produce', hi: 'खरीदार आपकी उपज के लिए ऑनलाइन बोली लगाते हैं', gu: 'ખરીદારો તમારી ઉપજ માટે ઓનલાઇન બોલી લગાવે છે' },
      { en: 'Accept best bid and receive payment', hi: 'सबसे अच्छी बोली स्वीकार करें और भुगतान पाएं', gu: 'શ્રેષ્ઠ બોલી સ્વીકારો અને ચૂકવણી મેળવો' },
    ],
  },

  // ── 7. Paramparagat Krishi Vikas Yojana ────────────────────────────────────
  paramparagatKrishi: {
    benefits: [
      { en: '₹50,000 per hectare for organic farming over 3 years', hi: '3 साल में प्रति हेक्टेयर ₹50,000 जैविक खेती के लिए', gu: '3 વર્ષ માટે પ્રતિ હેક્ટર ₹50,000 જૈવિક ખેતી' },
      { en: 'Free training on organic farming methods', hi: 'जैविक खेती पर मुफ्त प्रशिक्षण', gu: 'જૈવિક ખેતી પર મફત તાલીમ' },
      { en: 'Help to get organic certification', hi: 'जैविक प्रमाणीकरण पाने में मदद', gu: 'જૈવિક પ્રમાણીકરણ મેળવવામાં મદદ' },
    ],
    eligibility: [
      { en: 'Farmers willing to adopt organic farming', hi: 'जैविक खेती अपनाने के इच्छुक किसान', gu: 'જૈવિક ખેતી અપનાવવા ઇચ્છુક ખેડૂત' },
      { en: 'Must form a cluster of at least 20 farmers', hi: 'कम से कम 20 किसानों का समूह बनाना होगा', gu: 'ઓછામાં ઓછા 20 ખેડૂતોનો સમૂહ બનાવવો' },
      { en: 'Minimum 50 acres of contiguous land', hi: 'न्यूनतम 50 एकड़ सटी हुई भूमि', gu: 'ઓછામાં ઓછી 50 એકર સળંગ જમીન' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Farmer Group Registration', hi: 'किसान समूह पंजीकरण', gu: 'ખેડૂત જૂથ નોંધણી' },
    ],
    steps: [
      { en: 'Form a group of 20+ farmers in your village', hi: 'अपने गांव में 20+ किसानों का समूह बनाएं', gu: 'તમારા ગામમાં 20+ ખેડૂતોનો સમૂહ બનાવો' },
      { en: 'Register group with Agriculture Department', hi: 'कृषि विभाग में समूह पंजीकृत करें', gu: 'કૃષિ વિભાગ સાથે જૂથ નોંધો' },
      { en: 'Attend organic farming training', hi: 'जैविक खेती प्रशिक्षण में भाग लें', gu: 'જૈવિક ખેતી તાલીમ લો' },
      { en: 'Start organic farming on registered land', hi: 'पंजीकृत भूमि पर जैविक खेती शुरू करें', gu: 'નોંધાયેલ જમીન પર જૈવિક ખેતી શરૂ કરો' },
      { en: 'Receive subsidy in installments over 3 years', hi: '3 साल में किस्तों में सब्सिडी प्राप्त करें', gu: '3 વર્ષ દરમ્યાન હપ્તામાં સબસિડી મેળવો' },
    ],
  },

  // ── 8. Rashtriya Krishi Vikas Yojana (RKVY) ────────────────────────────────
  rkvy: {
    benefits: [
      { en: 'Funds for farm infrastructure like storage, roads', hi: 'भंडारण, सड़क जैसे कृषि बुनियादी ढांचे के लिए धन', gu: 'સ્ટોરેજ, રસ્તા જેવા ખેત ઇન્ફ્રાસ્ટ્રક્ચર માટે ભંડોળ' },
      { en: 'Support for agri-startups and FPOs', hi: 'कृषि स्टार्टअप और FPO को सहायता', gu: 'કૃષિ સ્ટાર્ટઅપ અને FPO ને સહાય' },
      { en: 'Training and skill development for farmers', hi: 'किसानों के लिए प्रशिक्षण और कौशल विकास', gu: 'ખેડૂત માટે તાલીમ અને કૌશલ્ય વિકાસ' },
    ],
    eligibility: [
      { en: 'Individual farmers, FPOs, cooperatives', hi: 'व्यक्तिगत किसान, FPO, सहकारी समितियां', gu: 'વ્યક્તિગત ખેડૂત, FPO, સહકારી મંડળ' },
      { en: 'Agri-entrepreneurs and startups', hi: 'कृषि उद्यमी और स्टार्टअप', gu: 'કૃષિ ઉદ્યોગ સાહસ અને સ્ટાર્ટઅપ' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Project Proposal', hi: 'परियोजना प्रस्ताव', gu: 'પ્રોજેક્ટ દરખાસ્ત' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
    ],
    steps: [
      { en: 'Prepare a project proposal for your farm activity', hi: 'अपनी कृषि गतिविधि के लिए परियोजना प्रस्ताव तैयार करें', gu: 'તમારી ખેત પ્રવૃત્તિ માટે પ્રોજેક્ટ દરખાસ્ત તૈયાર કરો' },
      { en: 'Submit to District Agriculture Officer', hi: 'जिला कृषि अधिकारी को जमा करें', gu: 'જિલ્લા કૃષિ અધિકારીને જમા કરો' },
      { en: 'Project reviewed and approved by committee', hi: 'समिति द्वारा परियोजना की समीक्षा और अनुमोदन', gu: 'સમિતિ દ્વારા પ્રોજેક્ટ સમીક્ષા અને મંજૂરી' },
      { en: 'Funds released in phases as work progresses', hi: 'काम की प्रगति के अनुसार चरणों में धन जारी', gu: 'કામ આગળ વધે તેમ તબક્કામાં ભંડોળ' },
    ],
  },

  // ── 9. PM Kisan Maandhan Yojana ─────────────────────────────────────────────
  kisanMaandhan: {
    benefits: [
      { en: '₹3,000 per month pension after age 60', hi: '60 वर्ष के बाद ₹3,000 प्रति माह पेंशन', gu: '60 વર્ષ પછી ₹3,000 દર મહિને પેન્શન' },
      { en: 'Government contributes equal amount to your premium', hi: 'सरकार आपके प्रीमियम के बराबर योगदान देती है', gu: 'સરકાર તમારા પ્રીમિયમ જેટલો ફાળો આપે છે' },
      { en: 'Spouse gets 50% pension if farmer passes away', hi: 'किसान की मृत्यु पर पति/पत्नी को 50% पेंशन', gu: 'ખેડૂત ગુજરી જાય તો જીવનસાથીને 50% પેન્શન' },
    ],
    eligibility: [
      { en: 'Small & marginal farmers aged 18 to 40 years', hi: '18 से 40 वर्ष के छोटे और सीमांत किसान', gu: '18 થી 40 વર્ષના નાના અને સીમાંત ખેડૂત' },
      { en: 'Must not be covered under any other pension scheme', hi: 'किसी अन्य पेंशन योजना में शामिल नहीं होना चाहिए', gu: 'અન્ય કોઈ પેન્શન યોજનામાં સામેલ ન હોવું' },
      { en: 'Monthly premium ₹55 to ₹200 based on age', hi: 'उम्र के अनुसार ₹55 से ₹200 मासिक प्रीमियम', gu: 'ઉંમર મુજબ ₹55 થી ₹200 માસિક પ્રીમિયમ' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
      { en: 'Mobile Number', hi: 'मोबाइल नंबर', gu: 'મોબાઇલ નંબર' },
    ],
    steps: [
      { en: 'Visit nearest CSC center with documents', hi: 'दस्तावेजों के साथ नजदीकी CSC केंद्र जाएं', gu: 'દસ્તાવેજો સાથે નજીકના CSC કેન્દ્ર જાઓ' },
      { en: 'Fill enrollment form', hi: 'नामांकन फॉर्म भरें', gu: 'નોંધણી ફોર્મ ભરો' },
      { en: 'Choose monthly premium amount', hi: 'मासिक प्रीमियम राशि चुनें', gu: 'માસિક પ્રીમિયમ રકમ પસંદ કરો' },
      { en: 'Auto-debit set up from bank account', hi: 'बैंक खाते से ऑटो-डेबिट सेट करें', gu: 'બેંક ખાતામાંથી ઓટો-ડેબિટ સેટ કરો' },
      { en: 'Pension starts automatically at age 60', hi: '60 वर्ष की आयु में पेंशन स्वतः शुरू', gu: '60 વર્ષ ઉંમરે પેન્શન આપોઆપ શરૂ' },
    ],
  },

  // ── 10. PM KUSUM Yojana ─────────────────────────────────────────────────────
  pmKusumYojana: {
    benefits: [
      { en: 'Solar pump installed at 90% subsidy', hi: '90% सब्सिडी पर सोलर पंप लगाएं', gu: '90% સબસિડી પર સોલર પંપ લગાવો' },
      { en: 'Free electricity for irrigation', hi: 'सिंचाई के लिए मुफ्त बिजली', gu: 'સિંચાઈ માટે મફત વીજળી' },
      { en: 'Sell extra solar power to grid and earn income', hi: 'अतिरिक्त सौर ऊर्जा ग्रिड को बेचकर आय', gu: 'વધારાની સૌર ઊર્જા ગ્રિડને વેચીને આવક' },
    ],
    eligibility: [
      { en: 'Farmers with own agricultural land', hi: 'अपनी कृषि भूमि वाले किसान', gu: 'પોતાની ખેતીની જમીન ધરાવતા ખેડૂત' },
      { en: 'No existing electricity connection on farm', hi: 'खेत पर मौजूदा बिजली कनेक्शन नहीं', gu: 'ખેતરમાં હાલ વીજળી જોડાણ ન હોય' },
      { en: 'Water source available for irrigation', hi: 'सिंचाई के लिए पानी का स्रोत उपलब्ध', gu: 'સિંચાઈ માટે પાણીનો સ્ત્રોત ઉપલબ્ધ' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records (7/12)', hi: 'भूमि रिकॉर्ड (7/12)', gu: 'જમીન રેકોર્ડ (7/12)' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Passport Size Photo', hi: 'पासपोर्ट साइज फोटो', gu: 'પાસપોર્ટ સાઇઝ ફોટો' },
    ],
    steps: [
      { en: 'Apply online at mnre.gov.in or state portal', hi: 'mnre.gov.in या राज्य पोर्टल पर ऑनलाइन आवेदन', gu: 'mnre.gov.in અથવા રાજ્ય પોર્ટલ પર ઓનલાઇન અરજી' },
      { en: 'Submit land and bank documents', hi: 'भूमि और बैंक दस्तावेज जमा करें', gu: 'જમીન અને બેંક દસ્તાવેજ જમા કરો' },
      { en: 'Site inspection by DISCOM officer', hi: 'DISCOM अधिकारी द्वारा साइट निरीक्षण', gu: 'DISCOM અધિકારી દ્વારા સ્થળ નિરીક્ષણ' },
      { en: 'Pay your 10% share of pump cost', hi: 'पंप लागत का 10% हिस्सा जमा करें', gu: 'પંપ ખર્ચના 10% ભાગ ભરો' },
      { en: 'Solar pump installed within 90 days', hi: '90 दिनों में सोलर पंप लगाया जाएगा', gu: '90 દિવસમાં સોલર પંપ લગાવાશે' },
    ],
  },

  // ── 11. Tractor Subsidy ─────────────────────────────────────────────────────
  tractorSubsidy: {
    benefits: [
      { en: '25% to 50% subsidy on tractor purchase', hi: 'ट्रैक्टर खरीद पर 25% से 50% सब्सिडी', gu: 'ટ્રેક્ટર ખરીદ પર 25% થી 50% સબસિડી' },
      { en: 'Maximum subsidy up to ₹1.25 lakh', hi: 'अधिकतम ₹1.25 लाख तक सब्सिडी', gu: 'મહત્તમ ₹1.25 લાખ સુધી સબસિડી' },
      { en: 'Higher subsidy for SC/ST and women farmers', hi: 'SC/ST और महिला किसानों के लिए अधिक सब्सिडी', gu: 'SC/ST અને મહિલા ખેડૂત માટે વધારે સબસિડી' },
    ],
    eligibility: [
      { en: 'Small & marginal farmers with land up to 5 acres', hi: '5 एकड़ तक भूमि वाले छोटे किसान', gu: '5 એકર સુધી જમીન ધરાવતા નાના ખેડૂત' },
      { en: 'Should not have received tractor subsidy in last 7 years', hi: 'पिछले 7 साल में ट्रैक्टर सब्सिडी नहीं ली हो', gu: 'છેલ્લા 7 વર્ષમાં ટ્રેક્ટર સબસિડી ન લીધી હોય' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records (7/12)', hi: 'भूमि रिकॉर्ड (7/12)', gu: 'જમીન રેકોર્ડ (7/12)' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Tractor Quotation from dealer', hi: 'डीलर से ट्रैक्टर कोटेशन', gu: 'ડીલર પાસેથી ટ્રેક્ટર ક્વોટેશન' },
      { en: 'Caste Certificate (if SC/ST)', hi: 'जाति प्रमाण पत्र (SC/ST के लिए)', gu: 'જ્ઞાતિ પ્રમાણપત્ર (SC/ST માટે)' },
    ],
    steps: [
      { en: 'Apply online at state agriculture portal', hi: 'राज्य कृषि पोर्टल पर ऑनलाइन आवेदन', gu: 'રાજ્ય કૃષિ પોર્ટલ પર ઓનલાઇન અરજી' },
      { en: 'Submit documents and tractor quotation', hi: 'दस्तावेज और ट्रैक्टर कोटेशन जमा करें', gu: 'દસ્તાવેજ અને ટ્રેક્ટર ક્વોટેશન જમા કરો' },
      { en: 'Application verified by Agriculture Officer', hi: 'कृषि अधिकारी द्वारा आवेदन सत्यापन', gu: 'કૃષિ અધિકારી દ્વારા અરજી ચકાસણી' },
      { en: 'Purchase tractor from approved dealer', hi: 'अनुमोदित डीलर से ट्रैक्टर खरीदें', gu: 'મંજૂર ડીલર પાસેથી ટ્રેક્ટર ખરીદો' },
      { en: 'Subsidy credited to bank account', hi: 'सब्सिडी बैंक खाते में जमा', gu: 'સબસિડી બેંક ખાતામાં જમા' },
    ],
  },

  // ── 12. Drip Irrigation Subsidy ─────────────────────────────────────────────
  dripSubsidy: {
    benefits: [
      { en: '55% subsidy for small farmers, 45% for others', hi: 'छोटे किसानों को 55%, अन्य को 45% सब्सिडी', gu: 'નાના ખેડૂત માટે 55%, અન્ય માટે 45% સબસિડી' },
      { en: 'Saves up to 50% water', hi: '50% तक पानी की बचत', gu: '50% સુધી પાણી બચત' },
      { en: 'Increases crop yield by 20-30%', hi: 'फसल उपज में 20-30% वृद्धि', gu: 'પાક ઉપજ 20-30% વધે' },
    ],
    eligibility: [
      { en: 'All farmers with minimum 0.5 acre land', hi: 'न्यूनतम 0.5 एकड़ भूमि वाले सभी किसान', gu: 'ઓછામાં ઓછી 0.5 એકર જમીન ધરાવતા ખેડૂત' },
      { en: 'Water source must be available', hi: 'पानी का स्रोत उपलब्ध होना चाहिए', gu: 'પાણીનો સ્ત્રોત ઉપલબ્ધ હોવો જોઈએ' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records (7/12)', hi: 'भूमि रिकॉर्ड (7/12)', gu: 'જમીન રેકોર્ડ (7/12)' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Quotation from registered vendor', hi: 'पंजीकृत विक्रेता से कोटेशन', gu: 'નોંધાયેલ વિક્રેતા પાસેથી ક્વોટેશન' },
    ],
    steps: [
      { en: 'Apply at Agriculture Department or online portal', hi: 'कृषि विभाग या ऑनलाइन पोर्टल पर आवेदन', gu: 'કૃષિ વિભાગ અથવા ઓનલાઇન પોર્ટલ પર અરજી' },
      { en: 'Field inspection by department officer', hi: 'विभाग अधिकारी द्वारा खेत निरीक्षण', gu: 'વિભાગ અધિકારી દ્વારા ખેત નિરીક્ષણ' },
      { en: 'Get approval and purchase from registered vendor', hi: 'स्वीकृति लें और पंजीकृत विक्रेता से खरीदें', gu: 'મંજૂરી મેળવો અને નોંધાયેલ વિક્રેતા પાસેથી ખરીદો' },
      { en: 'Subsidy amount credited after installation', hi: 'स्थापना के बाद सब्सिडी राशि जमा', gu: 'સ્થાપના પછી સબસિડી રકમ જમા' },
    ],
  },

  // ── 13. Solar Pump Subsidy ──────────────────────────────────────────────────
  solarPumpSubsidy: {
    benefits: [
      { en: 'Up to 90% subsidy on solar water pump', hi: 'सोलर वाटर पंप पर 90% तक सब्सिडी', gu: 'સોલર વોટર પંપ પર 90% સુધી સબસિડી' },
      { en: 'Zero electricity bill for irrigation', hi: 'सिंचाई के लिए शून्य बिजली बिल', gu: 'સિંચાઈ માટે શૂન્ય વીજળી બિલ' },
      { en: 'Pump works 25+ years with low maintenance', hi: 'पंप 25+ साल कम रखरखाव के साथ चलता है', gu: 'પંપ 25+ વર્ષ ઓછી જાળવણી સાથે ચાલે' },
    ],
    eligibility: [
      { en: 'Farmers without electricity connection on farm', hi: 'खेत पर बिजली कनेक्शन नहीं वाले किसान', gu: 'ખેતરમાં વીજળી જોડાણ ન ધરાવતા ખેડૂત' },
      { en: 'Own agricultural land required', hi: 'अपनी कृषि भूमि आवश्यक', gu: 'પોતાની ખેતીની જમીન જરૂરી' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records (7/12)', hi: 'भूमि रिकॉर्ड (7/12)', gu: 'જમીન રેકોર્ડ (7/12)' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'No Electricity Connection Certificate', hi: 'बिजली कनेक्शन न होने का प्रमाण', gu: 'વીજળી જોડાણ ન હોવાનું પ્રમાણ' },
    ],
    steps: [
      { en: 'Apply at state energy department or online', hi: 'राज्य ऊर्जा विभाग या ऑनलाइन आवेदन', gu: 'રાજ્ય ઊર્જા વિભાગ અથવા ઓનલાઇન અરજી' },
      { en: 'Submit documents for verification', hi: 'सत्यापन के लिए दस्तावेज जमा करें', gu: 'ચકાસણી માટે દસ્તાવેજ જમા કરો' },
      { en: 'Site survey by DISCOM engineer', hi: 'DISCOM इंजीनियर द्वारा साइट सर्वे', gu: 'DISCOM ઇજનેર દ્વારા સ્થળ સર્વે' },
      { en: 'Pay 10% farmer share', hi: '10% किसान हिस्सा जमा करें', gu: '10% ખેડૂત ભાગ ભરો' },
      { en: 'Solar pump installed by approved agency', hi: 'अनुमोदित एजेंसी द्वारा सोलर पंप स्थापित', gu: 'મંજૂર એજન્સી દ્વારા સોલર પંપ સ્થાપિત' },
    ],
  },

  // ── 14. Seed Subsidy ────────────────────────────────────────────────────────
  seedSubsidy: {
    benefits: [
      { en: '50% subsidy on certified high-yield seeds', hi: 'प्रमाणित उच्च उपज बीज पर 50% सब्सिडी', gu: 'પ્રમાણિત ઉચ્ચ ઉપજ બિયારણ પર 50% સબસિડી' },
      { en: 'Quality seeds improve crop yield by 15-20%', hi: 'गुणवत्ता बीज से फसल उपज 15-20% बढ़ती है', gu: 'ગુણવત્તા બિયારણ પાક ઉપજ 15-20% વધારે' },
      { en: 'Seeds available at government seed centers', hi: 'सरकारी बीज केंद्रों पर बीज उपलब्ध', gu: 'સરકારી બિયારણ કેન્દ્રો પર બિયારણ ઉપલબ્ધ' },
    ],
    eligibility: [
      { en: 'All registered farmers', hi: 'सभी पंजीकृत किसान', gu: 'બધા નોંધાયેલ ખેડૂત' },
      { en: 'Priority to small and marginal farmers', hi: 'छोटे और सीमांत किसानों को प्राथमिकता', gu: 'નાના અને સીમાંત ખેડૂત ને પ્રાથમિકતા' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
      { en: 'Farmer Registration ID', hi: 'किसान पंजीकरण आईडी', gu: 'ખેડૂત નોંધણી ID' },
    ],
    steps: [
      { en: 'Register at Agriculture Department', hi: 'कृषि विभाग में पंजीकरण करें', gu: 'કૃષિ વિભાગ સાથે નોંધણી કરો' },
      { en: 'Apply for seed subsidy before sowing season', hi: 'बुवाई मौसम से पहले बीज सब्सिडी के लिए आवेदन', gu: 'વાવણી સીઝન પહેલા બિયારણ સબસિડી માટે અરજી' },
      { en: 'Collect subsidized seeds from government center', hi: 'सरकारी केंद्र से सब्सिडी वाले बीज लें', gu: 'સરકારી કેન્દ્ર પાસેથી સબસિડી વાળા બિયારણ લો' },
    ],
  },

  // ── 15. Fertilizer Subsidy ──────────────────────────────────────────────────
  fertilizerSubsidy: {
    benefits: [
      { en: 'Urea available at fixed price ₹242 per 45kg bag', hi: 'यूरिया ₹242 प्रति 45 किग्रा बैग पर उपलब्ध', gu: 'યુરિયા ₹242 પ્રતિ 45 કિગ્રા બેગ પર ઉપલબ્ધ' },
      { en: 'Government pays 70-80% of actual fertilizer cost', hi: 'सरकार वास्तविक उर्वरक लागत का 70-80% देती है', gu: 'સરકાર વાસ્તવિક ખાતર ખર્ચ 70-80% ચૂકવે' },
      { en: 'Available at all registered fertilizer shops', hi: 'सभी पंजीकृत उर्वरक दुकानों पर उपलब्ध', gu: 'બધી નોંધાયેલ ખાતર દુકાનો પર ઉપલબ્ધ' },
    ],
    eligibility: [
      { en: 'All farmers with valid Aadhaar', hi: 'वैध आधार वाले सभी किसान', gu: 'માન્ય આધાર ધરાવતા બધા ખેડૂત' },
      { en: 'Purchase linked to Aadhaar at Point of Sale', hi: 'पॉइंट ऑफ सेल पर आधार से जुड़ी खरीद', gu: 'પોઇન્ટ ઓફ સેલ પર આધાર સાથે ખરીદ' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records (for large purchases)', hi: 'भूमि रिकॉर्ड (बड़ी खरीद के लिए)', gu: 'જમીન રેકોર્ડ (મોટી ખરીદ માટે)' },
    ],
    steps: [
      { en: 'Visit registered fertilizer dealer', hi: 'पंजीकृत उर्वरक डीलर के पास जाएं', gu: 'નોંધાયેલ ખાતર ડીલર પાસે જાઓ' },
      { en: 'Provide Aadhaar for biometric verification', hi: 'बायोमेट्रिक सत्यापन के लिए आधार दें', gu: 'બાયોમેટ્રિક ચકાસણી માટે આધાર આપો' },
      { en: 'Purchase fertilizer at subsidized price', hi: 'सब्सिडी वाली कीमत पर उर्वरक खरीदें', gu: 'સબસિડી ભાવે ખાતર ખરીદો' },
    ],
  },

  // ── 16. Farm Equipment Subsidy ──────────────────────────────────────────────
  farmEquipSubsidy: {
    benefits: [
      { en: '40% to 50% subsidy on farm machinery', hi: 'कृषि मशीनरी पर 40% से 50% सब्सिडी', gu: 'ખેત મશીનરી પર 40% થી 50% સબસિડી' },
      { en: 'Covers rotavator, thresher, seed drill and more', hi: 'रोटावेटर, थ्रेशर, सीड ड्रिल आदि शामिल', gu: 'રોટાવેટર, થ્રેશર, સીડ ડ્રિલ વગેરે સામેલ' },
      { en: 'Custom Hiring Centers get up to 80% subsidy', hi: 'कस्टम हायरिंग सेंटर को 80% तक सब्सिडी', gu: 'કસ્ટમ હાયરિંગ સેન્ટર ને 80% સુધી સબસિડી' },
    ],
    eligibility: [
      { en: 'Individual farmers and FPOs', hi: 'व्यक्तिगत किसान और FPO', gu: 'વ્યક્તિગત ખેડૂત અને FPO' },
      { en: 'Should not have received same equipment subsidy in 5 years', hi: '5 साल में उसी उपकरण की सब्सिडी नहीं ली हो', gu: '5 વર્ષમાં એ જ સાધનની સબસિડી ન લીધી હોય' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Equipment Quotation', hi: 'उपकरण कोटेशन', gu: 'સાધન ક્વોટેશન' },
    ],
    steps: [
      { en: 'Apply on DBT Agriculture portal', hi: 'DBT कृषि पोर्टल पर आवेदन करें', gu: 'DBT કૃષિ પોર્ટલ પર અરજી કરો' },
      { en: 'Upload documents and equipment quotation', hi: 'दस्तावेज और उपकरण कोटेशन अपलोड करें', gu: 'દસ્તાવેજ અને સાધન ક્વોટેશન અપલોડ કરો' },
      { en: 'Wait for approval (15-30 days)', hi: 'स्वीकृति का इंतजार करें (15-30 दिन)', gu: 'મંજૂરીની રાહ જુઓ (15-30 દિવસ)' },
      { en: 'Purchase from approved dealer after approval', hi: 'स्वीकृति के बाद अनुमोदित डीलर से खरीदें', gu: 'મંજૂરી પછી મંજૂર ડીલર પાસેથી ખરીદો' },
      { en: 'Subsidy credited to bank account', hi: 'सब्सिडी बैंक खाते में जमा', gu: 'સબસિડી બેંક ખાતામાં જમા' },
    ],
  },

  // ── 17. Polyhouse Subsidy ───────────────────────────────────────────────────
  polyhouseSubsidy: {
    benefits: [
      { en: '50% subsidy on polyhouse construction cost', hi: 'पॉलीहाउस निर्माण लागत पर 50% सब्सिडी', gu: 'પોલીહાઉસ બાંધકામ ખર્ચ પર 50% સબસિડી' },
      { en: 'Grow vegetables year-round regardless of weather', hi: 'मौसम की परवाह किए बिना साल भर सब्जियां उगाएं', gu: 'હવામાન ગમે તે હોય, આખા વર્ષ શાકભાજી ઉગાડો' },
      { en: '3-4x higher income compared to open field farming', hi: 'खुले खेत की तुलना में 3-4 गुना अधिक आय', gu: 'ખુલ્લા ખેત કરતાં 3-4 ગણી વધારે આવક' },
    ],
    eligibility: [
      { en: 'Farmers with minimum 0.25 acre land', hi: 'न्यूनतम 0.25 एकड़ भूमि वाले किसान', gu: 'ઓછામાં ઓછી 0.25 એકર જમીન ધરાવતા ખેડૂત' },
      { en: 'Water and electricity connection required', hi: 'पानी और बिजली कनेक्शन आवश्यक', gu: 'પાણી અને વીજળી જોડાણ જરૂરી' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records (7/12)', hi: 'भूमि रिकॉर्ड (7/12)', gu: 'જમીન રેકોર્ડ (7/12)' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Construction Estimate', hi: 'निर्माण अनुमान', gu: 'બાંધકામ અંદાજ' },
    ],
    steps: [
      { en: 'Apply at Horticulture Department', hi: 'बागवानी विभाग में आवेदन करें', gu: 'બાગાયત વિભાગ સાથે અરજી કરો' },
      { en: 'Submit land records and construction estimate', hi: 'भूमि रिकॉर्ड और निर्माण अनुमान जमा करें', gu: 'જમીન રેકોર્ડ અને બાંધકામ અંદાજ જમા કરો' },
      { en: 'Site inspection and approval', hi: 'साइट निरीक्षण और अनुमोदन', gu: 'સ્થળ નિરીક્ષણ અને મંજૂરી' },
      { en: 'Construct polyhouse with approved agency', hi: 'अनुमोदित एजेंसी के साथ पॉलीहाउस बनाएं', gu: 'મંજૂર એજન્સી સાથે પોલીહાઉસ બનાવો' },
      { en: 'Subsidy released after completion inspection', hi: 'पूर्णता निरीक्षण के बाद सब्सिडी जारी', gu: 'પૂર્ણ નિરીક્ષણ પછી સબસિડી' },
    ],
  },

  // ── 18. Cold Storage Subsidy ────────────────────────────────────────────────
  coldStorageSubsidy: {
    benefits: [
      { en: '35% subsidy on cold storage construction', hi: 'कोल्ड स्टोरेज निर्माण पर 35% सब्सिडी', gu: 'કોલ્ડ સ્ટોરેજ બાંધકામ પર 35% સબસિડી' },
      { en: 'Store produce and sell when prices are high', hi: 'उपज संग्रहीत करें और अच्छे भाव पर बेचें', gu: 'ઉપજ સ્ટોર કરો અને ભાવ સારા હોય ત્યારે વેચો' },
      { en: 'Reduces post-harvest losses by up to 30%', hi: 'कटाई के बाद नुकसान 30% तक कम होता है', gu: 'કાપણી પછી નુકસાન 30% સુધી ઘટે' },
    ],
    eligibility: [
      { en: 'Farmers, FPOs, cooperatives and entrepreneurs', hi: 'किसान, FPO, सहकारी समितियां और उद्यमी', gu: 'ખેડૂત, FPO, સહકારી મંડળ અને ઉદ્યોગ સાહસ' },
      { en: 'Minimum capacity 5000 MT for full subsidy', hi: 'पूर्ण सब्सिडी के लिए न्यूनतम 5000 MT क्षमता', gu: 'પૂર્ણ સબસિડી માટે ઓછામાં ઓછી 5000 MT ક્ષમતા' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
      { en: 'Project Report', hi: 'परियोजना रिपोर्ट', gu: 'પ્રોજેક્ટ રિપોર્ટ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
    ],
    steps: [
      { en: 'Apply at NHB or state horticulture department', hi: 'NHB या राज्य बागवानी विभाग में आवेदन', gu: 'NHB અથવા રાજ્ય બાગાયત વિભાગ સાથે અરજી' },
      { en: 'Submit project report and land documents', hi: 'परियोजना रिपोर्ट और भूमि दस्तावेज जमा करें', gu: 'પ્રોજેક્ટ રિપોર્ટ અને જમીન દસ્તાવેજ જમા કરો' },
      { en: 'Technical and financial appraisal', hi: 'तकनीकी और वित्तीय मूल्यांकन', gu: 'ટેકનિકલ અને નાણાકીય મૂલ્યાંકન' },
      { en: 'Construct cold storage after approval', hi: 'स्वीकृति के बाद कोल्ड स्टोरेज बनाएं', gu: 'મંજૂરી પછી કોલ્ડ સ્ટોરેજ બનાવો' },
      { en: 'Subsidy released in 2 installments', hi: 'सब्सिडी 2 किस्तों में जारी', gu: 'સબસિડી 2 હપ્તામાં' },
    ],
  },

  // ── 19. Dairy Subsidy ───────────────────────────────────────────────────────
  dairySubsidy: {
    benefits: [
      { en: '25% subsidy on dairy farm setup (up to ₹1.25 lakh)', hi: 'डेयरी फार्म स्थापना पर 25% सब्सिडी (₹1.25 लाख तक)', gu: 'ડેરી ફાર્મ સ્થાપના પર 25% સબસિડી (₹1.25 લાખ સુધી)' },
      { en: 'Subsidy on purchase of milch animals', hi: 'दुधारू पशु खरीद पर सब्सिडी', gu: 'દૂધ આપતા પ્રાણી ખરીદ પર સબસિડી' },
      { en: 'Free veterinary services and animal insurance', hi: 'मुफ्त पशु चिकित्सा सेवाएं और पशु बीमा', gu: 'મફત પશુ ચિકિત્સા સેવા અને પ્રાણી વીમો' },
    ],
    eligibility: [
      { en: 'Farmers and rural entrepreneurs', hi: 'किसान और ग्रामीण उद्यमी', gu: 'ખેડૂત અને ગ્રામીણ ઉદ્યોગ સાહસ' },
      { en: 'Must have land for cattle shed', hi: 'पशु शेड के लिए भूमि होनी चाहिए', gu: 'ઢોર શેડ માટે જમીન હોવી જોઈએ' },
      { en: 'Minimum 2 milch animals to start', hi: 'शुरुआत के लिए न्यूनतम 2 दुधारू पशु', gu: 'શરૂ કરવા ઓછામાં ઓછા 2 દૂધ આપતા પ્રાણી' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Animal Purchase Receipt', hi: 'पशु खरीद रसीद', gu: 'પ્રાણી ખરીદ રસીદ' },
    ],
    steps: [
      { en: 'Apply at Animal Husbandry Department', hi: 'पशुपालन विभाग में आवेदन करें', gu: 'પશુ સંવર્ધન વિભાગ સાથે અરજી કરો' },
      { en: 'Submit documents and project plan', hi: 'दस्तावेज और परियोजना योजना जमा करें', gu: 'દસ્તાવેજ અને પ્રોજેક્ટ યોજના જમા કરો' },
      { en: 'Inspection of cattle shed site', hi: 'पशु शेड स्थल का निरीक्षण', gu: 'ઢોર શેડ સ્થળ નિરીક્ષણ' },
      { en: 'Purchase animals from approved source', hi: 'अनुमोदित स्रोत से पशु खरीदें', gu: 'મંજૂર સ્ત્રોત પાસેથી પ્રાણી ખરીદો' },
      { en: 'Subsidy credited after verification', hi: 'सत्यापन के बाद सब्सिडी जमा', gu: 'ચકાસણી પછી સબસિડી જમા' },
    ],
  },

  // ── 20. Sprayer Subsidy ─────────────────────────────────────────────────────
  sprayerSubsidy: {
    benefits: [
      { en: '40% to 50% subsidy on power sprayer', hi: 'पावर स्प्रेयर पर 40% से 50% सब्सिडी', gu: 'પાવર સ્પ્રેયર પર 40% થી 50% સબસિડી' },
      { en: 'Saves time — spray 5 acres in 1 hour', hi: 'समय बचाएं — 1 घंटे में 5 एकड़ स्प्रे', gu: 'સમય બચાવો — 1 કલાકમાં 5 એકર સ્પ્રે' },
      { en: 'Reduces pesticide use by 20-30%', hi: 'कीटनाशक उपयोग 20-30% कम होता है', gu: 'જંતુનાશક ઉપયોગ 20-30% ઘટે' },
    ],
    eligibility: [
      { en: 'All registered farmers', hi: 'सभी पंजीकृत किसान', gu: 'બધા નોંધાયેલ ખેડૂત' },
      { en: 'Should not have received sprayer subsidy in 5 years', hi: '5 साल में स्प्रेयर सब्सिडी नहीं ली हो', gu: '5 વર્ષમાં સ્પ્રેયર સબસિડી ન લીધી હોય' },
    ],
    docs: [
      { en: 'Aadhaar Card', hi: 'आधार कार्ड', gu: 'આધાર કાર્ડ' },
      { en: 'Land Records', hi: 'भूमि रिकॉर्ड', gu: 'જમીન રેકોર્ડ' },
      { en: 'Bank Passbook', hi: 'बैंक पासबुक', gu: 'બેંક પાસબુક' },
      { en: 'Sprayer Quotation', hi: 'स्प्रेयर कोटेशन', gu: 'સ્પ્રેયર ક્વોટેશન' },
    ],
    steps: [
      { en: 'Apply on DBT Agriculture portal or Agriculture Dept', hi: 'DBT कृषि पोर्टल या कृषि विभाग में आवेदन', gu: 'DBT કૃષિ પોર્ટલ અથવા કૃષિ વિભાગ સાથે અરજી' },
      { en: 'Submit documents and sprayer quotation', hi: 'दस्तावेज और स्प्रेयर कोटेशन जमा करें', gu: 'દસ્તાવેજ અને સ્પ્રેયર ક્વોટેશન જમા કરો' },
      { en: 'Approval within 15 days', hi: '15 दिनों में स्वीकृति', gu: '15 દિવસમાં મંજૂરી' },
      { en: 'Purchase from approved dealer', hi: 'अनुमोदित डीलर से खरीदें', gu: 'મંજૂર ડીલર પાસેથી ખરીદો' },
      { en: 'Subsidy credited to bank account', hi: 'सब्सिडी बैंक खाते में जमा', gu: 'સબસિડી બેંક ખાતામાં જમા' },
    ],
  },

};

/**
 * Mandi Translation Service
 * Local mapping — no API calls, instant lookup, fallback to English.
 */

export type Lang = 'en' | 'hi' | 'gu';

// ── PART 5: Crop translation map ─────────────────────────────────────────────
// Keys are lowercase English names as returned by data.gov.in API
const CROP_MAP: Record<string, { hi: string; gu: string }> = {
  // Vegetables
  tomato:       { hi: 'टमाटर',       gu: 'ટામેટા'       },
  potato:       { hi: 'आलू',         gu: 'બટાકા'        },
  onion:        { hi: 'प्याज',        gu: 'ડુંગળી'       },
  brinjal:      { hi: 'बैंगन',        gu: 'રીંગણ'        },
  cabbage:      { hi: 'पत्तागोभी',    gu: 'કોબી'         },
  cauliflower:  { hi: 'फूलगोभी',      gu: 'ફ્લાવર'       },
  spinach:      { hi: 'पालक',         gu: 'પાલક'         },
  carrot:       { hi: 'गाजर',         gu: 'ગાજર'         },
  cucumber:     { hi: 'खीरा',         gu: 'કાકડી'        },
  ladyfinger:   { hi: 'भिंडी',        gu: 'ભીંડા'        },
  pumpkin:      { hi: 'कद्दू',        gu: 'કોળું'        },
  bittergourd:  { hi: 'करेला',        gu: 'કારેલા'       },
  bottlegourd:  { hi: 'लौकी',         gu: 'દૂધી'         },
  ridgegourd:   { hi: 'तोरई',         gu: 'તૂરિયા'       },
  drumstick:    { hi: 'सहजन',         gu: 'સરગવો'        },
  capsicum:     { hi: 'शिमला मिर्च',  gu: 'સિમલા મરચું'  },
  chilli:       { hi: 'मिर्च',        gu: 'મરચું'        },
  garlic:       { hi: 'लहसुन',        gu: 'લસણ'          },
  ginger:       { hi: 'अदरक',         gu: 'આદુ'          },
  turmeric:     { hi: 'हल्दी',        gu: 'હળદર'         },
  coriander:    { hi: 'धनिया',        gu: 'ધાણા'         },
  fenugreek:    { hi: 'मेथी',         gu: 'મેથી'         },
  radish:       { hi: 'मूली',         gu: 'મૂળા'         },
  beetroot:     { hi: 'चुकंदर',       gu: 'બીટ'          },
  sweetpotato:  { hi: 'शकरकंद',       gu: 'શક્કરિયા'     },
  // Fruits
  mango:        { hi: 'आम',           gu: 'કેરી'         },
  banana:       { hi: 'केला',         gu: 'કેળા'         },
  apple:        { hi: 'सेब',          gu: 'સફરજન'        },
  orange:       { hi: 'संतरा',        gu: 'નારંગી'       },
  grapes:       { hi: 'अंगूर',        gu: 'દ્રાક્ષ'      },
  pomegranate:  { hi: 'अनार',         gu: 'દાડમ'         },
  guava:        { hi: 'अमरूद',        gu: 'જામફળ'        },
  papaya:       { hi: 'पपीता',        gu: 'પપૈયા'        },
  watermelon:   { hi: 'तरबूज',        gu: 'તડબૂચ'        },
  muskmelon:    { hi: 'खरबूजा',       gu: 'શક્કરટેટી'    },
  litchi:       { hi: 'लीची',         gu: 'લીચી'         },
  pineapple:    { hi: 'अनानास',       gu: 'અનાનાસ'       },
  coconut:      { hi: 'नारियल',       gu: 'નારિયેળ'      },
  lemon:        { hi: 'नींबू',        gu: 'લીંબુ'        },
  sapota:       { hi: 'चीकू',         gu: 'ચીકુ'         },
  jackfruit:    { hi: 'कटहल',         gu: 'ફણસ'          },
  // Grains & Oilseeds
  wheat:        { hi: 'गेहूं',        gu: 'ઘઉં'          },
  rice:         { hi: 'चावल',         gu: 'ચોખા'         },
  corn:         { hi: 'मक्का',        gu: 'મકાઈ'         },
  maize:        { hi: 'मक्का',        gu: 'મકાઈ'         },
  jowar:        { hi: 'ज्वार',        gu: 'જુવાર'        },
  bajra:        { hi: 'बाजरा',        gu: 'બાજરો'        },
  barley:       { hi: 'जौ',           gu: 'જવ'           },
  mustard:      { hi: 'सरसों',        gu: 'સરસવ'         },
  soyabean:     { hi: 'सोयाबीन',      gu: 'સોયાબીન'      },
  cotton:       { hi: 'कपास',         gu: 'કપાસ'         },
  groundnut:    { hi: 'मूंगफली',      gu: 'મગફળી'        },
  sugarcane:    { hi: 'गन्ना',        gu: 'શેરડી'        },
  sesame:       { hi: 'तिल',          gu: 'તલ'           },
  linseed:      { hi: 'अलसी',         gu: 'અળસી'         },
  sunflower:    { hi: 'सूरजमुखी',     gu: 'સૂર્યમુખી'    },
  castor:       { hi: 'अरंडी',        gu: 'એરંડા'        },
  // Pulses
  gram:         { hi: 'चना',          gu: 'ચણા'          },
  moong:        { hi: 'मूंग',         gu: 'મગ'           },
  urad:         { hi: 'उड़द',         gu: 'અડદ'          },
  arhar:        { hi: 'अरहर',         gu: 'તુવેર'        },
  toor:         { hi: 'तूर',          gu: 'તુવેર'        },
  lentil:       { hi: 'मसूर',         gu: 'મસૂર'         },
  masoor:       { hi: 'मसूर',         gu: 'મસૂર'         },
  peas:         { hi: 'मटर',          gu: 'વટાણા'        },
  rajma:        { hi: 'राजमा',        gu: 'રાજમા'        },
  moth:         { hi: 'मोठ',          gu: 'મઠ'           },
  horsegram:    { hi: 'कुलथी',        gu: 'કળથી'         },

  // ── More Vegetables ──────────────────────────────────────────────────────
  'green peas':       { hi: 'हरी मटर',       gu: 'લીલા વટાણા'    },
  'cluster beans':    { hi: 'गवार फली',      gu: 'ગુવાર'          },
  'cowpea':           { hi: 'लोबिया',        gu: 'ચોળા'           },
  'french beans':     { hi: 'फ्रेंच बीन्स',  gu: 'ફ્રેન્ચ બીન'   },
  'beans':            { hi: 'बीन्स',         gu: 'બીન'            },
  'snakegourd':       { hi: 'चिचिंडा',       gu: 'પડવળ'           },
  'ashgourd':         { hi: 'पेठा',          gu: 'કોળું'          },
  'tinda':            { hi: 'टिंडा',         gu: 'ટીંડોળા'        },
  'parwal':           { hi: 'परवल',          gu: 'પરવળ'           },
  'pointed gourd':    { hi: 'परवल',          gu: 'પરવળ'           },
  'ivy gourd':        { hi: 'कुंदरू',        gu: 'ટૂંડા'          },
  'colocasia':        { hi: 'अरबी',          gu: 'અળવી'           },
  'yam':              { hi: 'जिमीकंद',       gu: 'સૂરણ'           },
  'raw banana':       { hi: 'कच्चा केला',    gu: 'કાચા કેળા'      },
  'green chilli':     { hi: 'हरी मिर्च',     gu: 'લીલા મરચા'      },
  'dry chilli':       { hi: 'सूखी मिर्च',    gu: 'સૂકા મરચા'      },
  'red chilli':       { hi: 'लाल मिर्च',     gu: 'લાલ મરચા'       },
  'curry leaves':     { hi: 'करी पत्ता',     gu: 'લીમડો'          },
  'mint':             { hi: 'पुदीना',        gu: 'ફુદીનો'         },
  'amaranthus':       { hi: 'चौलाई',         gu: 'ચોળાઈ'          },
  'drumstick leaves': { hi: 'सहजन पत्ती',    gu: 'સરગવાના પાન'    },
  'raw mango':        { hi: 'कच्चा आम',      gu: 'કાચી કેરી'      },
  'tamarind':         { hi: 'इमली',          gu: 'આમલી'           },
  'broccoli':         { hi: 'ब्रोकली',       gu: 'બ્રોકોલી'       },
  'mushroom':         { hi: 'मशरूम',         gu: 'મશરૂમ'          },
  'sweet corn':       { hi: 'स्वीट कॉर्न',   gu: 'સ્વીટ કોર્ન'   },
  'baby corn':        { hi: 'बेबी कॉर्न',    gu: 'બેબી કોર્ન'     },
  'turnip':           { hi: 'शलजम',          gu: 'સલગમ'           },
  'knol khol':        { hi: 'गांठ गोभी',     gu: 'નોળ ખોળ'        },
  'leek':             { hi: 'लीक',           gu: 'લીક'            },
  'celery':           { hi: 'अजवाइन',        gu: 'અજમો'           },
  'spring onion':     { hi: 'हरा प्याज',     gu: 'લીલી ડુંગળી'    },
  'green garlic':     { hi: 'हरा लहसुन',     gu: 'લીલું લસણ'      },

  // ── More Fruits ──────────────────────────────────────────────────────────
  'chikoo':           { hi: 'चीकू',          gu: 'ચીકુ'           },
  'custard apple':    { hi: 'सीताफल',        gu: 'સીતાફળ'         },
  'wood apple':       { hi: 'बेल',           gu: 'બીલ'            },
  'fig':              { hi: 'अंजीर',         gu: 'અંજીર'          },
  'dates':            { hi: 'खजूर',          gu: 'ખજૂર'           },
  'plum':             { hi: 'आलूबुखारा',     gu: 'જાંબુ'          },
  'jamun':            { hi: 'जामुन',         gu: 'જાંબુ'          },
  'ber':              { hi: 'बेर',           gu: 'બોર'            },
  'amla':             { hi: 'आंवला',         gu: 'આમળા'           },
  'kiwi':             { hi: 'कीवी',          gu: 'કીવી'           },
  'strawberry':       { hi: 'स्ट्रॉबेरी',    gu: 'સ્ટ્રોબેરી'     },
  'avocado':          { hi: 'एवोकाडो',       gu: 'એવોકાડો'        },
  'dragon fruit':     { hi: 'ड्रैगन फ्रूट',  gu: 'ડ્રેગન ફ્રૂટ'   },
  'sweet lime':       { hi: 'मौसंबी',        gu: 'મોસંબી'         },
  'mosambi':          { hi: 'मौसंबी',        gu: 'મોસંબી'         },
  'grapefruit':       { hi: 'चकोतरा',        gu: 'ચકોતરા'         },
  'pear':             { hi: 'नाशपाती',       gu: 'નાસપાતી'        },
  'peach':            { hi: 'आड़ू',           gu: 'આડૂ'            },
  'apricot':          { hi: 'खुबानी',        gu: 'જરદાળુ'         },
  'cherry':           { hi: 'चेरी',          gu: 'ચેરી'           },
  'almond':           { hi: 'बादाम',         gu: 'બદામ'           },
  'walnut':           { hi: 'अखरोट',         gu: 'અખરોટ'          },
  'cashew':           { hi: 'काजू',          gu: 'કાજુ'           },
  'raisin':           { hi: 'किशमिश',        gu: 'દ્રાક્ષ'        },
  'tender coconut':   { hi: 'नारियल पानी',   gu: 'નારિયેળ પાણી'   },

  // ── More Grains & Oilseeds ───────────────────────────────────────────────
  'ragi':             { hi: 'रागी',          gu: 'નાગલી'          },
  'finger millet':    { hi: 'रागी',          gu: 'નાગલી'          },
  'pearl millet':     { hi: 'बाजरा',         gu: 'બાજરો'          },
  'sorghum':          { hi: 'ज्वार',         gu: 'જુવાર'          },
  'foxtail millet':   { hi: 'कंगनी',         gu: 'કાંગ'           },
  'kodo millet':      { hi: 'कोदो',          gu: 'કોદો'           },
  'little millet':    { hi: 'कुटकी',         gu: 'ગૂઢ'            },
  'buckwheat':        { hi: 'कुट्टू',        gu: 'કૂટ'            },
  'oats':             { hi: 'जई',            gu: 'ઓટ'             },
  'quinoa':           { hi: 'क्विनोआ',       gu: 'ક્વિનોઆ'        },
  'paddy':            { hi: 'धान',           gu: 'ડાંગર'          },
  'raw rice':         { hi: 'कच्चा चावल',    gu: 'કાચા ચોખા'      },
  'parboiled rice':   { hi: 'उसना चावल',     gu: 'ઉસ્ના ચોખા'     },
  'basmati':          { hi: 'बासमती',        gu: 'બાસમતી'         },
  'safflower':        { hi: 'कुसुम',         gu: 'કુસુમ'          },
  'niger':            { hi: 'रामतिल',        gu: 'રામતિલ'         },
  'hemp':             { hi: 'भांग',          gu: 'ભાંગ'           },
  'cotton seed':      { hi: 'बिनौला',        gu: 'બિયારણ'         },
  'copra':            { hi: 'खोपरा',         gu: 'ખોપરો'          },
  'dry coconut':      { hi: 'सूखा नारियल',   gu: 'સૂકું નારિયેળ'  },

  // ── More Pulses ──────────────────────────────────────────────────────────
  'black gram':       { hi: 'उड़द',          gu: 'અડદ'            },
  'green gram':       { hi: 'मूंग',          gu: 'મગ'             },
  'red gram':         { hi: 'अरहर',          gu: 'તુવેર'          },
  'bengal gram':      { hi: 'चना',           gu: 'ચણા'            },
  'chickpea':         { hi: 'चना',           gu: 'ચણા'            },
  'kabuli chana':     { hi: 'काबुली चना',    gu: 'કાબૂલી ચણા'     },
  'field peas':       { hi: 'मटर',           gu: 'વટાણા'          },
  'lathyrus':         { hi: 'खेसारी',        gu: 'ખેસારી'         },
  'cowpeas':          { hi: 'लोबिया',        gu: 'ચોળા'           },
  'val':              { hi: 'वाल',           gu: 'વાલ'            },
  'kulthi':           { hi: 'कुलथी',         gu: 'કળથી'           },
  'matki':            { hi: 'मटकी',          gu: 'મઠ'             },
  'chana dal':        { hi: 'चना दाल',       gu: 'ચણા દાળ'        },
  'moong dal':        { hi: 'मूंग दाल',      gu: 'મગ દાળ'         },
  'urad dal':         { hi: 'उड़द दाल',      gu: 'અડદ દાળ'        },
  'toor dal':         { hi: 'तूर दाल',       gu: 'તુવેર દાળ'      },
  'masoor dal':       { hi: 'मसूर दाल',      gu: 'મસૂર દાળ'       },

  // ── Spices & Condiments ──────────────────────────────────────────────────
  'cumin':            { hi: 'जीरा',          gu: 'જીરું'          },
  'jeera':            { hi: 'जीरा',          gu: 'જીરું'          },
  'fennel':           { hi: 'सौंफ',          gu: 'વરિયાળી'        },
  'ajwain':           { hi: 'अजवाइन',        gu: 'અજમો'           },
  'carom':            { hi: 'अजवाइन',        gu: 'અજમો'           },
  'fenugreek seeds':  { hi: 'मेथी दाना',     gu: 'મેથી'           },
  'black pepper':     { hi: 'काली मिर्च',    gu: 'કાળા મરી'       },
  'cardamom':         { hi: 'इलायची',        gu: 'એલચી'           },
  'cloves':           { hi: 'लौंग',          gu: 'લવિંગ'          },
  'cinnamon':         { hi: 'दालचीनी',       gu: 'તજ'             },
  'nutmeg':           { hi: 'जायफल',         gu: 'જાયફળ'          },
  'star anise':       { hi: 'चक्र फूल',      gu: 'ચક્ર ફૂલ'       },
  'bay leaf':         { hi: 'तेज पत्ता',     gu: 'તેજ પત્ર'       },
  'asafoetida':       { hi: 'हींग',          gu: 'હિંગ'           },
  'dry ginger':       { hi: 'सोंठ',          gu: 'સૂંઠ'           },
  'dry turmeric':     { hi: 'सूखी हल्दी',    gu: 'સૂકી હળદર'      },
  'poppy seeds':      { hi: 'खसखस',          gu: 'ખસ ખસ'          },
  'mustard seeds':    { hi: 'राई',           gu: 'રાઈ'            },

  // ── Flowers ──────────────────────────────────────────────────────────────
  'marigold':         { hi: 'गेंदा',         gu: 'ગલગોટા'         },
  'rose':             { hi: 'गुलाब',         gu: 'ગુલાબ'          },
  'jasmine':          { hi: 'चमेली',         gu: 'ચમેલી'          },
  'lotus':            { hi: 'कमल',           gu: 'કમળ'            },
  'chrysanthemum':    { hi: 'गुलदाउदी',      gu: 'ગુલ'            },

  // ── Fodder & Others ──────────────────────────────────────────────────────
  'fodder':           { hi: 'चारा',          gu: 'ઘાસ'            },
  'hay':              { hi: 'घास',           gu: 'ઘાસ'            },
  'jute':             { hi: 'जूट',           gu: 'શણ'             },
  'tobacco':          { hi: 'तंबाकू',        gu: 'તમાકુ'          },
  'rubber':           { hi: 'रबर',           gu: 'રબર'            },
  'coffee':           { hi: 'कॉफी',          gu: 'કોફી'           },
  'tea':              { hi: 'चाय',           gu: 'ચા'             },
  'arecanut':         { hi: 'सुपारी',        gu: 'સોપારી'         },
  'betelnut':         { hi: 'सुपारी',        gu: 'સોપારી'         },
  'bamboo':           { hi: 'बांस',          gu: 'વાંસ'           },
  'neem':             { hi: 'नीम',           gu: 'લીમડો'          },
  'aloe vera':        { hi: 'एलोवेरा',       gu: 'કુંવારપાઠું'    },
  'stevia':           { hi: 'स्टेविया',      gu: 'સ્ટેવિયા'       },
  'moringa':          { hi: 'सहजन',          gu: 'સરગવો'          },
  'isabgol':          { hi: 'इसबगोल',        gu: 'ઇસબગોળ'         },
  'psyllium':         { hi: 'इसबगोल',        gu: 'ઇસબગોળ'         },
  'senna':            { hi: 'सनाय',          gu: 'સનાય'           },
  'ashwagandha':      { hi: 'अश्वगंधा',      gu: 'અશ્વગંધા'       },
};

// ── PART 7: translateCrop helper ─────────────────────────────────────────────
/**
 * Translate a crop name from English API data to the target language.
 * Falls back to English if no translation found.
 */
export function translateCrop(englishName: string, lang: Lang): string {
  if (lang === 'en' || !englishName) return englishName;

  const key = englishName.toLowerCase().trim();

  // 1. Exact match
  if (CROP_MAP[key]) return CROP_MAP[key][lang] || englishName;

  // 2. Exact match after removing extra spaces / special chars
  const normalized = key.replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
  if (CROP_MAP[normalized]) return CROP_MAP[normalized][lang] || englishName;

  // 3. Longest key that the crop name contains (prefer longer matches)
  let bestMatch = '';
  let bestLen   = 0;
  for (const k of Object.keys(CROP_MAP)) {
    if (key.includes(k) && k.length > bestLen) {
      bestMatch = k;
      bestLen   = k.length;
    }
  }
  if (bestMatch) return CROP_MAP[bestMatch][lang] || englishName;

  // 4. Key that contains the crop name (e.g. "chilli" matches "green chilli")
  for (const [k, v] of Object.entries(CROP_MAP)) {
    if (k.includes(key)) return v[lang] || englishName;
  }

  // 5. Word-level match — any word in the crop name matches a key
  const words = key.split(/\s+/);
  for (const word of words) {
    if (word.length > 3 && CROP_MAP[word]) {
      return CROP_MAP[word][lang] || englishName;
    }
  }

  return englishName; // fallback to English
}

// ── Static UI label translations ─────────────────────────────────────────────
const MANDI_LABELS: Record<string, { hi: string; gu: string }> = {
  // Filter labels
  'Select State':    { hi: 'राज्य चुनें',    gu: 'રાજ્ય પસંદ કરો'   },
  'Select District': { hi: 'जिला चुनें',     gu: 'જિલ્લો પસંદ કરો'  },
  'Select Market':   { hi: 'मंडी चुनें',     gu: 'મંડી પસંદ કરો'    },
  'Clear':           { hi: 'साफ करें',       gu: 'સાફ કરો'           },
  // Search
  'Search mandi or crop...': { hi: 'मंडी या फसल खोजें...', gu: 'મંડી અથવા પાક શોધો...' },
  'Search crop or variety...': { hi: 'फसल या किस्म खोजें...', gu: 'પાક અથવા જાત શોધો...' },
  // Section titles
  'Nearby Mandis':   { hi: 'नजदीकी मंडियां', gu: 'નજીકની મંડીઓ'     },
  'Mandis in':       { hi: 'मंडियां:',        gu: 'મંડીઓ:'            },
  // Card labels
  'crops':           { hi: 'फसलें',           gu: 'પાક'               },
  'away':            { hi: 'दूर',             gu: 'દૂર'               },
  'Best':            { hi: 'सबसे अच्छा',      gu: 'સૌથી સારો'         },
  'mandis found':    { hi: 'मंडियां मिलीं',   gu: 'મંડીઓ મળી'        },
  'Nearest':         { hi: 'सबसे नजदीक',      gu: 'સૌથી નજીક'        },
  'Live':            { hi: 'लाइव',            gu: 'લાઇવ'              },
  'Cached':          { hi: 'कैश्ड',           gu: 'કૅશ્ડ'             },
  // Detail screen
  'Crops':           { hi: 'फसलें',           gu: 'પાક'               },
  'Rising ↑':        { hi: 'बढ़त ↑',          gu: 'વધારો ↑'           },
  'Falling ↓':       { hi: 'गिरावट ↓',        gu: 'ઘટાડો ↓'           },
  'Avg/qtl':         { hi: 'औसत/क्विंटल',    gu: 'સરેરાશ/ક્વિ.'      },
  'Show Map Location': { hi: 'नक्शा देखें',   gu: 'નકશો જુઓ'          },
  'Show Crop List':  { hi: 'फसल सूची',        gu: 'પાક યાદી'          },
  'All':             { hi: 'सभी',             gu: 'બધા'               },
  'vegetables':      { hi: 'सब्जियां',        gu: 'શાકભાજી'           },
  'fruits':          { hi: 'फल',              gu: 'ફળ'                },
  'grains':          { hi: 'अनाज',            gu: 'અનાજ'              },
  'pulses':          { hi: 'दालें',           gu: 'કઠોળ'              },
  'Price':           { hi: 'भाव',             gu: 'ભાવ'               },
  'Name':            { hi: 'नाम',             gu: 'નામ'               },
  'Variety':         { hi: 'किस्म',           gu: 'જાત'               },
  'Min':             { hi: 'न्यूनतम',         gu: 'ન્યૂનતમ'           },
  'Max':             { hi: 'अधिकतम',          gu: 'મહત્તમ'            },
  'Modal':           { hi: 'मोडल',            gu: 'મોડલ'              },
  'General':         { hi: 'सामान्य',         gu: 'સામાન્ય'           },
  'varieties':       { hi: 'किस्में',         gu: 'જાતો'              },
  'Directions':      { hi: 'रास्ता',          gu: 'રસ્તો'             },
  'Share Prices':    { hi: 'भाव शेयर करें',   gu: 'ભાવ શેર કરો'       },
  'No mandi data available': { hi: 'मंडी डेटा उपलब्ध नहीं', gu: 'મંડી ડેટા ઉપલબ્ધ નથી' },
  'No nearby mandis available': { hi: 'नजदीकी मंडी नहीं मिली', gu: 'નજીકની મંડી મળી નથી' },
  'Tap crops with multiple varieties to expand': {
    hi: 'एकाधिक किस्म वाली फसल पर टैप करें',
    gu: 'અનેક જાત ધરાવતા પાક પર ટૅપ કરો',
  },
  'Fetching all pages, please wait': {
    hi: 'सभी पेज लोड हो रहे हैं...',
    gu: 'બધા પૃષ્ઠ લોડ થઈ રહ્યા છે...',
  },
  // Category labels for market screen
  'Vegetables': { hi: 'सब्जियां', gu: 'શાકભાજી' },
  'Grains':     { hi: 'अनाज',     gu: 'અનાજ'    },
  'Pulses':     { hi: 'दालें',    gu: 'કઠોળ'    },
  'Fruits':     { hi: 'फल',       gu: 'ફળ'      },
};

/**
 * Translate a static UI label.
 * Falls back to English if no translation found.
 */
export function translateLabel(label: string, lang: Lang): string {
  if (lang === 'en' || !label) return label;
  return MANDI_LABELS[label]?.[lang] || label;
}

/**
 * Convenience: translate crop name + show English in parentheses if different
 * Useful for search — user can still find by English name
 */
export function translateCropWithFallback(englishName: string, lang: Lang): string {
  if (lang === 'en') return englishName;
  const translated = translateCrop(englishName, lang);
  if (translated === englishName) return englishName;
  return translated; // just show translated, English is in search
}

// ── Language display names ────────────────────────────────────────────────────
export const LANG_OPTIONS: { code: Lang; label: string; native: string }[] = [
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'hi', label: 'Hindi',    native: 'हिंदी'    },
  { code: 'en', label: 'English',  native: 'English'  },
];

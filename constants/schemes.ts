export interface Scheme {
  id: string;
  icon: string; // FontAwesome5 icon name
  color: string;
  title_en: string;
  title_hi: string;
  desc_en: string;
  desc_hi: string;
  benefits_en: string[];
  benefits_hi: string[];
  eligibility_en: string[];
  eligibility_hi: string[];
  steps_en: string[];
  steps_hi: string[];
}

export const GOV_SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    icon: "hand-holding-usd",
    color: "#4CAF50", // Green
    title_en: "PM-KISAN Samman Nidhi",
    title_hi: "पीएम-किसान सम्मान निधि",
    desc_en:
      "Direct income support for farmers. Helps with financial needs for inputs and household.",
    desc_hi:
      "किसानों के लिए प्रत्यक्ष आय सहायता। खेती और घरेलू जरूरतों के लिए आर्थिक मदद।",
    benefits_en: [
      "₹6,000 per year income support",
      "Paid in 3 installments of ₹2,000",
      "Direct Bank Transfer (DBT)",
    ],
    benefits_hi: [
      "₹6,000 प्रति वर्ष आय सहायता",
      "₹2,000 की 3 समान किस्तों में भुगतान",
      "सीधे बैंक खाते में (DBT)",
    ],
    eligibility_en: [
      "Small & marginal farmers",
      "Must have Aadhaar Card",
      "Must have Bank Account",
      "Must have Land Records",
    ],
    eligibility_hi: [
      "छोटे और सीमांत किसान",
      "आधार कार्ड होना अनिवार्य है",
      "बैंक खाता होना अनिवार्य है",
      "भूमि रिकॉर्ड होना चाहिए",
    ],
    steps_en: [
      "Apply at PM-KISAN Portal",
      "Visit Common Service Centre (CSC)",
      "Contact State Agriculture Office",
    ],
    steps_hi: [
      "PM-KISAN पोर्टल पर आवेदन करें",
      "कॉमन सर्विस सेंटर (CSC) पर जाएं",
      "राज्य कृषि कार्यालय से संपर्क करें",
    ],
  },
  {
    id: "pmfby",
    icon: "shield-alt",
    color: "#1976D2", // Blue
    title_en: "PMFBY (Crop Insurance)",
    title_hi: "पीएम फसल बीमा योजना",
    desc_en:
      "Insurance protection against crop loss due to flood, drought, or pests.",
    desc_hi:
      "बाढ़, सूखा, या कीटों के कारण फसल के नुकसान के खिलाफ बीमा सुरक्षा।",
    benefits_en: [
      "Insurance against Flood & Drought",
      "Protection from Pest Attacks",
      "Very low premium (2–5%)",
    ],
    benefits_hi: [
      "बाढ़ और सूखे के खिलाफ बीमा",
      "कीट हमलों से सुरक्षा",
      "बहुत कम प्रीमियम (2-5%)",
    ],
    eligibility_en: [
      "Farmers growing notified crops",
      "Both Loanee & Non-loanee farmers",
    ],
    eligibility_hi: [
      "अधिसूचित फसलें उगाने वाले किसान",
      "ऋणी और गैर-ऋणी दोनों किसान",
    ],
    steps_en: [
      "Apply via Bank",
      "Visit Common Service Centre (CSC)",
      "Apply on PMFBY Portal",
    ],
    steps_hi: [
      "बैंक के माध्यम से आवेदन करें",
      "कॉमन सर्विस सेंटर (CSC) पर जाएं",
      "PMFBY पोर्टल पर आवेदन करें",
    ],
  },
  {
    id: "kvk",
    icon: "chalkboard-teacher",
    color: "#F57C00", // Orange
    title_en: "Krishi Vigyan Kendra (KVK)",
    title_hi: "कृषि विज्ञान केंद्र (KVK)",
    desc_en:
      "Government agricultural training centers providing free education and new techniques.",
    desc_hi:
      "सरकारी कृषि प्रशिक्षण केंद्र जो मुफ्त शिक्षा और नई तकनीक प्रदान करते हैं।",
    benefits_en: [
      "Free training on new techniques",
      "Soil health & organic farming education",
      "Get Government Certificates",
      "Access to Demonstration farms",
    ],
    benefits_hi: [
      "नई तकनीकों पर मुफ्त प्रशिक्षण",
      "मृदा स्वास्थ्य और जैविक खेती की शिक्षा",
      "सरकारी प्रमाण पत्र प्राप्त करें",
      "प्रदर्शन खेतों तक पहुंच",
    ],
    eligibility_en: ["Any farmer", "No fees required"],
    eligibility_hi: ["कोई भी किसान", "कोई शुल्क नहीं"],
    steps_en: ["Visit nearest KVK center", "Register during training drives"],
    steps_hi: [
      "निकटतम KVK केंद्र पर जाएं",
      "प्रशिक्षण अभियान के दौरान पंजीकरण करें",
    ],
  },
  {
    id: "digital-green",
    icon: "video",
    color: "#388E3C", // Green
    title_en: "Digital Green",
    title_hi: "डिजिटल ग्रीन",
    desc_en:
      "NGO using local-language videos to educate farmers for higher yields.",
    desc_hi:
      "किसानों की पैदावार बढ़ाने के लिए स्थानीय भाषा के वीडियो का उपयोग करने वाला एनजीओ।",
    benefits_en: [
      "Easy-to-understand video lessons",
      "Proven higher yield & income",
      "Special focus on women farmers",
    ],
    benefits_hi: [
      "समझने में आसान वीडियो पाठ",
      "पैदावार और आय में वृद्धि",
      "महिला किसानों पर विशेष ध्यान",
    ],
    eligibility_en: ["Any farmer", "Works with Self-Help Groups (SHGs)"],
    eligibility_hi: [
      "कोई भी किसान",
      "स्वयं सहायता समूहों (SHG) के साथ काम करता है",
    ],
    steps_en: [
      "Watch lessons on app/village screenings",
      "Connect with local village group",
    ],
    steps_hi: [
      "ऐप या गांव की स्क्रीनिंग पर वीडियो देखें",
      "स्थानीय ग्राम समूह से जुड़ें",
    ],
  },
  {
    id: "nabard",
    icon: "users",
    color: "#8E24AA", // Purple
    title_en: "NABARD FPO Program",
    title_hi: "नाबार्ड FPO कार्यक्रम",
    desc_en:
      "Training and funding via Farmer Producer Organisations (FPOs) for better market access.",
    desc_hi:
      "बेहतर बाजार पहुंच के लिए किसान उत्पादक संगठनों (FPO) के माध्यम से प्रशिक्षण और धन।",
    benefits_en: [
      "Skill training",
      "Help to form FPOs",
      "Better market prices",
      "Access to credit & grants",
    ],
    benefits_hi: [
      "कौशल प्रशिक्षण",
      "FPO बनाने में मदद",
      "बाजार में बेहतर कीमतें",
      "क्रेडिट और अनुदान तक पहुंच",
    ],
    eligibility_en: ["Individual farmers", "Farmer groups / FPOs"],
    eligibility_hi: ["व्यक्तिगत किसान", "किसान समूह / FPO"],
    steps_en: ["Join a local FPO", "Contact nearest NABARD office"],
    steps_hi: [
      "स्थानीय FPO से जुड़ें",
      "निकटतम नाबार्ड कार्यालय से संपर्क करें",
    ],
  },
];

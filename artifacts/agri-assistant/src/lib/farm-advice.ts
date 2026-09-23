export interface FarmAdviceTip {
  en: string;
  fil: string;
  categoryEn: string;
  categoryFil: string;
}

export interface CropAdviceCollection {
  cropKeywords: string[];
  displayNameEn: string;
  displayNameFil: string;
  emoji: string;
  tips: FarmAdviceTip[];
}

export const CROP_ADVICE_CATALOG: CropAdviceCollection[] = [
  {
    cropKeywords: ["rice", "palay", "paddy", "sinandomeng", "dinorado", "ir64", "jasmine", "rc", "milled"],
    displayNameEn: "Rice (Palay)",
    displayNameFil: "Palay (Bigas)",
    emoji: "🌾",
    tips: [
      {
        en: "Maintain proper water levels during the early growth stage and regularly check for signs of pests.",
        fil: "Panatilihin ang tamang lebel ng tubig sa unang yugto ng paglaki at regular na suriin ang mga peste.",
        categoryEn: "Water Management",
        categoryFil: "Pamamahala sa Tubig",
      },
      {
        en: "Apply nitrogen fertilizer in split doses to maximize panicle development and prevent plant lodging.",
        fil: "Hatiin ang paglalagay ng pataba (nitrogen) upang maging mataba ang uhay at maiwasan ang pagtumba.",
        categoryEn: "Nutrient Care",
        categoryFil: "Pagpapataba",
      },
      {
        en: "Inspect early morning field canopy for stem borer egg masses and rice blast symptoms.",
        fil: "Suriin ang mga dahon tuwing umaga para sa maagang sintomas ng stem borer o rice blast.",
        categoryEn: "Pest Scouting",
        categoryFil: "Pagsusuri sa Peste",
      },
      {
        en: "Drain paddy water 7 to 10 days before target harvest date for uniform grain maturity and firmer soil.",
        fil: "Patuyuin ang palayan 7 hanggang 10 araw bago anihin para sa pantay na pagkahinog ng mga butil.",
        categoryEn: "Harvest Preparation",
        categoryFil: "Paghahanda sa Ani",
      },
      {
        en: "Practice alternate wetting and drying (AWD) during vegetative growth to save water and strengthen root depth.",
        fil: "Isagawa ang alternate wetting and drying upang makatipid sa tubig at mapalalim ang mga ugat ng palay.",
        categoryEn: "Irrigation Efficiency",
        categoryFil: "Tipid sa Patubig",
      },
    ],
  },
  {
    cropKeywords: ["corn", "mais", "maize", "sweet corn", "yellow corn", "white corn", "hybrid"],
    displayNameEn: "Corn (Mais)",
    displayNameFil: "Mais",
    emoji: "🌽",
    tips: [
      {
        en: "Monitor soil moisture during early growth and keep the area around the plants free from excessive weeds.",
        fil: "Bantayan ang halumigmig ng lupa sa unang yugto ng paglaki at panatilihing malinis laban sa damo.",
        categoryEn: "Early Growth",
        categoryFil: "Unang Paglaki",
      },
      {
        en: "Scout corn whorls weekly for fall armyworm larvae to protect young growing central shoots.",
        fil: "Suriin ang loob ng dahon linggu-linggo upang maagapan ang fall armyworm bago masira ang puso ng mais.",
        categoryEn: "Pest Management",
        categoryFil: "Pamamahala sa Peste",
      },
      {
        en: "Hill up soil around the stalk base 3 to 4 weeks after emergence to bolster wind resistance and root support.",
        fil: "Tambakan ng lupa ang puno ng mais 3-4 linggo pagkatanim upang patatagin ang ugat laban sa hangin.",
        categoryEn: "Soil Cultivation",
        categoryFil: "Pag-aalaga ng Lupa",
      },
      {
        en: "Ensure adequate moisture during tasseling and silking to guarantee complete cob pollination and kernel fill.",
        fil: "Siguraduhing sapat ang tubig sa panahon ng pamumulaklak upang mapuno ang bawat puso ng butil.",
        categoryEn: "Flowering Stage",
        categoryFil: "Pamumulaklak",
      },
    ],
  },
  {
    cropKeywords: ["tomato", "kamatis", "diamante", "cherry tomato"],
    displayNameEn: "Tomato (Kamatis)",
    displayNameFil: "Kamatis",
    emoji: "🍅",
    tips: [
      {
        en: "Check tomato leaves regularly for early signs of pests and maintain consistent soil moisture.",
        fil: "Suriin ang mga dahon ng kamatis laban sa mga peste at panatilihing pantay ang basa ng lupa.",
        categoryEn: "Crop Monitoring",
        categoryFil: "Pagsubaybay sa Tanim",
      },
      {
        en: "Prune bottom leaves touching the ground to improve air movement and deter fungal blight spores.",
        fil: "Putulin ang mga mababang dahon na sumasayad sa lupa upang maiwasan ang sakit na amag o blight.",
        categoryEn: "Pruning & Airflow",
        categoryFil: "Pagpupungos",
      },
      {
        en: "Irrigate directly at the base of the plant in early morning rather than spraying overhead foliage.",
        fil: "Magdilig sa mismong puno sa umaga kaysa basain ang dahon upang maiwasan ang bacterial leaf spot.",
        categoryEn: "Smart Watering",
        categoryFil: "Tamang Pagdidilig",
      },
      {
        en: "Stake plants securely with bamboo trellises to keep heavy fruiting branches off damp soil.",
        fil: "Tukuran ng kawayan ang mga sanga upang hindi lumaylay at sumayad sa basang lupa ang mga bunga.",
        categoryEn: "Support Trellising",
        categoryFil: "Paglalagay ng Tukod",
      },
    ],
  },
  {
    cropKeywords: ["eggplant", "talong", "long purple", "dumaguete"],
    displayNameEn: "Eggplant (Talong)",
    displayNameFil: "Talong",
    emoji: "🍆",
    tips: [
      {
        en: "Regularly inspect shoots for fruit and shoot borer damage and prune wilted tips immediately.",
        fil: "Suriin ang mga dulo ng talong laban sa shoot borer at agad putulin ang mga nalalantang tangkay.",
        categoryEn: "Shoot Care",
        categoryFil: "Pag-iingat sa Tangkay",
      },
      {
        en: "Ensure raised beds with good drainage to prevent root fungal pathogens during heavy rains.",
        fil: "Gumawa ng nakataas na kamada na may maayos na daluyan ng tubig upang maiwasan ang bulok sa ugat.",
        categoryEn: "Drainage",
        categoryFil: "Daloy ng Tubig",
      },
      {
        en: "Harvest mature eggplants every 3 to 4 days while skins are glossy to stimulate new flower clusters.",
        fil: "Mag-ani tuwing 3 hanggang 4 na araw habang makintab pa ang balat upang tuloy-tuloy ang pamumulaklak.",
        categoryEn: "Harvest Routine",
        categoryFil: "Pag-aani",
      },
    ],
  },
  {
    cropKeywords: ["onion", "sibuyas", "red pinoy", "granex", "shallot", "lasona"],
    displayNameEn: "Onion (Sibuyas)",
    displayNameFil: "Sibuyas",
    emoji: "🧅",
    tips: [
      {
        en: "Avoid excess standing water during bulb sizing to protect against bottom rot and bacterial rots.",
        fil: "Iwasan ang labis na tubig habang lumalaki ang sibuyas upang maiwasan ang pagkabulok ng ugat.",
        categoryEn: "Bulb Protection",
        categoryFil: "Proteksyon sa Lasona",
      },
      {
        en: "Monitor leaf folds for onion thrips during dry sunny spells and spray botanical repellents early.",
        fil: "Suriin ang singit ng dahon laban sa thrips kapag tag-init at maagang maglagay ng organikong lunas.",
        categoryEn: "Thrips Control",
        categoryFil: "Lunas sa Peste",
      },
      {
        en: "Withhold irrigation 10 to 14 days before harvest so outer onion wrappers cure crisply for storage.",
        fil: "Itigil ang patubig 10-14 araw bago mag-ani upang matuyo at tumibay ang balat ng sibuyas sa imbakan.",
        categoryEn: "Storage Curing",
        categoryFil: "Paghahanda sa Imbakan",
      },
    ],
  },
  {
    cropKeywords: ["garlic", "bawang", "ilocos white"],
    displayNameEn: "Garlic (Bawang)",
    displayNameFil: "Bawang",
    emoji: "🧄",
    tips: [
      {
        en: "Apply rice straw mulch around garlic rows to conserve soil coolness and prevent weed competition.",
        fil: "Maglatag ng dayami sa paligid ng mga tanim na bawang upang mapanatili ang lamig ng lupa at pigilan ang damo.",
        categoryEn: "Mulching Care",
        categoryFil: "Pagpapanatili ng Lupa",
      },
      {
        en: "Keep planting soil loose and friable so garlic bulbs can expand into tight, full-sized cloves.",
        fil: "Panatilihing buhaghag ang lupa upang lumaking malalaki at siksik ang mga butil ng bawang.",
        categoryEn: "Soil Texture",
        categoryFil: "Kalidad ng Lupa",
      },
    ],
  },
  {
    cropKeywords: ["chili", "pepper", "sili", "labuyo", "panig", "bell pepper"],
    displayNameEn: "Chili / Pepper (Sili)",
    displayNameFil: "Sili",
    emoji: "🌶️",
    tips: [
      {
        en: "Control whiteflies and aphids in early vegetative stages to prevent chili leaf curl virus transmission.",
        fil: "Puksain agad ang whiteflies at aphids upang maiwasan ang sakit na pamimilipit ng dahon sa sili.",
        categoryEn: "Virus Prevention",
        categoryFil: "Pag-iwas sa Sakit",
      },
      {
        en: "Provide consistent soil moisture and organic compost tea to encourage continuous flowering and hot pod set.",
        fil: "Magdilig nang katamtaman at regular na maglagay ng organikong pataba para sa tuloy-tuloy na pamumunga.",
        categoryEn: "Fruit Setting",
        categoryFil: "Pamumunga",
      },
    ],
  },
  {
    cropKeywords: ["cabbage", "repolyo", "wongbok", "pechay", "bok choy"],
    displayNameEn: "Cabbage & Brassicas (Repolyo)",
    displayNameFil: "Repolyo / Pechay",
    emoji: "🥬",
    tips: [
      {
        en: "Inspect underside of cabbage leaves for diamondback moth larvae and treat early with biological sprays.",
        fil: "Suriin ang ilalim ng dahon laban sa uod ng diamondback moth at maglapat agad ng angkop na proteksyon.",
        categoryEn: "Foliage Protection",
        categoryFil: "Proteksyon sa Dahon",
      },
      {
        en: "Keep soil evenly moist during head enlargement to prevent head bursting from sudden moisture swings.",
        fil: "Panatilihing pantay ang basa ng lupa upang maiwasan ang pagbibakbak o pagputok ng ulo ng repolyo.",
        categoryEn: "Head Formation",
        categoryFil: "Pagbubuo ng Ulo",
      },
    ],
  },
  {
    cropKeywords: ["cassava", "kamoteng kahoy", "balinghoy", "lakan"],
    displayNameEn: "Cassava (Kamoteng Kahoy)",
    displayNameFil: "Kamoteng Kahoy",
    emoji: "🥔",
    tips: [
      {
        en: "Plant clean mature stem cuttings slightly angled into well-tilled mounds for best tuber initiation.",
        fil: "Itanim ang magagandang sanga nang pahilig sa binungkal na kamada para sa mabilis na pag-ugat.",
        categoryEn: "Planting Method",
        categoryFil: "Tamang Pagtatanim",
      },
      {
        en: "Ensure intensive weeding during the first 60 to 90 days until the crop develops a dense shading canopy.",
        fil: "Magdamo nang mabuti sa unang 2 hanggang 3 buwan hanggang sa malilim ng mga dahon ang lupa.",
        categoryEn: "Weed Suppression",
        categoryFil: "Pagpuksa sa Damo",
      },
    ],
  },
  {
    cropKeywords: ["banana", "saging", "saba", "lakatan", "cavendish", "latundan"],
    displayNameEn: "Banana (Saging)",
    displayNameFil: "Saging",
    emoji: "🍌",
    tips: [
      {
        en: "Prune excessive suckers to leave one main producing stem and one healthy follower per mat.",
        fil: "Bawasan ang mga suwi at mag-iwan lamang ng isang namumungang puno at isang kasunod na suwi.",
        categoryEn: "Sucker Pruning",
        categoryFil: "Pagbabawas ng Suwi",
      },
      {
        en: "Bag developing fruit bunches with blue perforated covers to prevent thrips blemishes and bird damage.",
        fil: "Balutan ng plastic cover ang mga piling ng saging upang maiwasan ang mantsa mula sa insekto at ibon.",
        categoryEn: "Bunch Protection",
        categoryFil: "Pagbalot ng Piling",
      },
    ],
  },
  {
    cropKeywords: ["mango", "mangga", "carabao", "pico", "sweet elena"],
    displayNameEn: "Mango (Mangga)",
    displayNameFil: "Mangga",
    emoji: "🥭",
    tips: [
      {
        en: "Prune overcrowded interior canopy branches after harvest to let sunlight sterilize inner tree foliage.",
        fil: "Tabasan ang mga sangang nagkakasalubong sa loob ng puno pagkatapos ng ani upang maarawan ang buong puno.",
        categoryEn: "Post-Harvest Pruning",
        categoryFil: "Pagtatabas ng Sanga",
      },
      {
        en: "Scout flower panicles at dawn for mango leafhoppers and blossom blight during dry flowering months.",
        fil: "Bantayan ang mga bulaklak sa umaga laban sa leafhopper at amag sa panahon ng pamumulaklak.",
        categoryEn: "Blossom Care",
        categoryFil: "Pag-iingat sa Bulaklak",
      },
    ],
  },
  {
    cropKeywords: ["ampalaya", "bitter gourd", "bitter melon"],
    displayNameEn: "Bitter Gourd (Ampalaya)",
    displayNameFil: "Ampalaya",
    emoji: "🥒",
    tips: [
      {
        en: "Set up pheromone or yellow sticky traps on trellises to intercept fruit flies before egg-laying.",
        fil: "Magkabit ng fruit fly trap sa balag upang maagapan ang mga langaw bago mangitlog sa bunga ng ampalaya.",
        categoryEn: "Fruit Fly Guard",
        categoryFil: "Bitag sa Langaw",
      },
      {
        en: "Harvest fruits while firm and vibrant dark green before tips turn yellow or orange.",
        fil: "Anihin ang ampalaya habang berde at matigas pa bago magsimulang manilaw ang dulo.",
        categoryEn: "Optimal Harvesting",
        categoryFil: "Tamang Pag-ani",
      },
    ],
  },
  {
    cropKeywords: ["squash", "kalabasa", "pumpkin"],
    displayNameEn: "Squash (Kalabasa)",
    displayNameFil: "Kalabasa",
    emoji: "🎃",
    tips: [
      {
        en: "Preserve natural pollinators like honeybees in early morning hours to achieve complete fruit set.",
        fil: "Pangalagaan ang mga bubuyog sa umaga habang namumulaklak upang maparami ang mabubuong kalabasa.",
        categoryEn: "Pollination Care",
        categoryFil: "Pamumulaklak",
      },
      {
        en: "Place a bed of dry straw under heavy developing squash to isolate them from wet soil pathogens.",
        fil: "Sapnan ng tuyong dayami ang ilalim ng bunga upang hindi mabasa at mabulok sa lupa.",
        categoryEn: "Fruit Bedding",
        categoryFil: "Proteksyon sa Lupa",
      },
    ],
  },
  {
    cropKeywords: ["mungbean", "mongo", "mung bean", "pag-asa"],
    displayNameEn: "Mungbean (Mongo)",
    displayNameFil: "Mongo",
    emoji: "🫘",
    tips: [
      {
        en: "Incorporate mungbean into your crop rotation to naturally enrich soil nitrogen for future plantings.",
        fil: "Mainam magtanim ng mongo pagkatapos ng palay upang natural na madagdagan ang nitroheno sa lupa.",
        categoryEn: "Soil Enrichment",
        categoryFil: "Pampataba sa Lupa",
      },
      {
        en: "Pick mature black seed pods promptly in dry morning weather before pods shatter in hot afternoon sun.",
        fil: "Pitasin agad ang mga itim at hinog na pods sa tuyong umaga bago pumutok sa matinding sikat ng araw.",
        categoryEn: "Pod Gathering",
        categoryFil: "Pagpitas ng Bunga",
      },
    ],
  },
  {
    cropKeywords: ["kamote", "sweet potato"],
    displayNameEn: "Sweet Potato (Kamote)",
    displayNameFil: "Kamote",
    emoji: "🍠",
    tips: [
      {
        en: "Hill up soil ridges around the vines at 4 to 6 weeks to protect forming tubers from sweetpotato weevils.",
        fil: "Tambakan ng lupa ang kamada 4-6 linggo pagkatanim upang protektahan ang laman laban sa weevil.",
        categoryEn: "Weevil Defense",
        categoryFil: "Proteksyon sa Laman",
      },
      {
        en: "Avoid applying excessive chemical nitrogen to encourage root tuber swelling instead of excessive vine foliage.",
        fil: "Iwasan ang labis na nitrogen upang lumaki ang laman sa ilalim sa halip na puro baging lamang.",
        categoryEn: "Tuber Sizing",
        categoryFil: "Pagpapalaki ng Laman",
      },
    ],
  },
];

const GENERAL_FARM_TIPS: FarmAdviceTip[] = [
  {
    en: "Test soil drainage regularly and apply organic compost to build long-term soil resilience and beneficial microbes.",
    fil: "Suriin ang daloy ng tubig sa lupa at maglagay ng organikong pataba para sa malusog na taniman.",
    categoryEn: "Soil Health",
    categoryFil: "Kalusugan ng Lupa",
  },
  {
    en: "Observe crop foliage in the early morning to catch nutrient deficiencies and pest activity early.",
    fil: "Obserbahan ang mga dahon tuwing umaga upang maagapan ang kakulangan sa nutrisyon at mga peste.",
    categoryEn: "Field Scouting",
    categoryFil: "Pagsusuri sa Bukid",
  },
  {
    en: "Rotate crops seasonally to break persistent pest life cycles and maintain balanced soil fertility.",
    fil: "Salit-salitin ang mga tanim bawat panahon upang maputol ang ikot ng peste at mapanatili ang taba ng lupa.",
    categoryEn: "Crop Rotation",
    categoryFil: "Salitang Pagtatanim",
  },
  {
    en: "Maintain farm sanitation by removing diseased crop residues away from active planting fields.",
    fil: "Panatilihing malinis ang paligid ng taniman at ilayo ang mga may sakit na nalaglag na dahon.",
    categoryEn: "Field Sanitation",
    categoryFil: "Kalinisan sa Sakahan",
  },
];

/**
 * Find the most relevant crop advice collection based on a crop name
 */
export function getCropAdvice(cropName?: string): {
  cropLabelEn: string;
  cropLabelFil: string;
  emoji: string;
  tips: FarmAdviceTip[];
} {
  if (!cropName) {
    return {
      cropLabelEn: "General Farming",
      cropLabelFil: "Pangkalahatang Bukid",
      emoji: "🌱",
      tips: GENERAL_FARM_TIPS,
    };
  }

  const clean = cropName.trim().toLowerCase();

  for (const item of CROP_ADVICE_CATALOG) {
    if (item.cropKeywords.some((kw) => clean.includes(kw) || kw.includes(clean))) {
      return {
        cropLabelEn: item.displayNameEn,
        cropLabelFil: item.displayNameFil,
        emoji: item.emoji,
        tips: item.tips,
      };
    }
  }

  // If crop is unknown, return tailored default with the user's crop name
  return {
    cropLabelEn: cropName,
    cropLabelFil: cropName,
    emoji: "🌱",
    tips: [
      {
        en: `Monitor ${cropName} leaves regularly for early signs of pests and maintain consistent soil moisture.`,
        fil: `Suriin ang mga dahon ng ${cropName} laban sa mga peste at panatilihing pantay ang basa ng lupa.`,
        categoryEn: "Crop Care",
        categoryFil: "Pag-aalaga ng Tanim",
      },
      ...GENERAL_FARM_TIPS,
    ],
  };
}

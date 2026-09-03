const RestrictedItem = require('../models/RestrictedItem');

// System rules keep validation useful before an admin adds custom database rules.
// Admin-created rules are loaded from MongoDB and checked alongside these defaults.
const DEFAULT_RESTRICTED_ITEMS = [
  {
    id: 'default-weapons',
    name: 'Weapons and firearms',
    keywords: ['weapon', 'gun', 'firearm', 'ammunition', 'knife'],
    category: 'dangerous_goods',
    restrictionLevel: 'prohibited',
    reason: 'Weapons and ammunition cannot be carried through BringBuddy.',
    isSystemRule: true,
  },
  {
    id: 'default-explosives',
    name: 'Explosives and flammable materials',
    keywords: ['explosive', 'bomb', 'firework', 'gasoline', 'flammable'],
    category: 'dangerous_goods',
    restrictionLevel: 'prohibited',
    reason: 'Explosive and highly flammable materials are prohibited.',
    isSystemRule: true,
  },
  {
    id: 'default-drugs',
    name: 'Illegal drugs and narcotics',
    keywords: ['illegal drug', 'narcotic', 'cocaine', 'heroin', 'cannabis'],
    category: 'controlled_substances',
    restrictionLevel: 'prohibited',
    reason: 'Illegal drugs and narcotics are prohibited.',
    isSystemRule: true,
  },
  {
    id: 'default-cash',
    name: 'Cash and currency',
    keywords: ['cash', 'currency', 'banknote'],
    category: 'money',
    restrictionLevel: 'prohibited',
    reason: 'Cash and negotiable currency cannot be sent through BringBuddy.',
    isSystemRule: true,
  },
  {
    id: 'default-alcohol',
    name: 'Alcoholic beverages',
    keywords: ['alcohol', 'liquor', 'wine', 'beer', 'whisky', 'vodka'],
    category: 'alcohol',
    restrictionLevel: 'restricted',
    reason: 'Alcohol is regulated and may require customs approval.',
    isSystemRule: true,
  },
  {
    id: 'default-batteries',
    name: 'Lithium batteries',
    keywords: ['lithium battery', 'lithium batteries', 'power bank'],
    category: 'dangerous_goods',
    restrictionLevel: 'restricted',
    reason: 'Lithium batteries are regulated by airlines and destination customs.',
    isSystemRule: true,
  },
  {
    id: 'default-medication',
    name: 'Prescription medication',
    keywords: ['prescription medicine', 'prescription medication', 'controlled medicine'],
    category: 'medication',
    restrictionLevel: 'restricted',
    reason: 'Prescription medication may require a prescription and customs documents.',
    isSystemRule: true,
  },
];

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function containsKeyword(text, keyword) {
  const normalizedText = ` ${normalizeText(text)} `;
  const normalizedKeyword = normalizeText(keyword);
  return normalizedKeyword && normalizedText.includes(` ${normalizedKeyword} `);
}

async function getRestrictedItemCatalog() {
  const customItems = await RestrictedItem.find({ isActive: true })
    .select('name keywords category restrictionLevel reason isActive createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return [
    ...DEFAULT_RESTRICTED_ITEMS,
    ...customItems.map((item) => ({
      ...item,
      id: item._id.toString(),
      isSystemRule: false,
    })),
  ];
}

async function validateDescriptions(descriptions) {
  const values = (Array.isArray(descriptions) ? descriptions : [descriptions])
    .map((description) => String(description || '').trim())
    .filter(Boolean);
  const catalog = await getRestrictedItemCatalog();
  const matches = [];

  for (const rule of catalog) {
    const matchedKeyword = rule.keywords.find((keyword) =>
      values.some((description) => containsKeyword(description, keyword))
    );

    if (matchedKeyword) {
      matches.push({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        restrictionLevel: rule.restrictionLevel,
        reason: rule.reason,
        matchedKeyword,
        isSystemRule: rule.isSystemRule,
      });
    }
  }

  const blockedItems = matches.filter((match) => match.restrictionLevel === 'prohibited');
  const warnings = matches.filter((match) => match.restrictionLevel === 'restricted');

  return {
    allowed: blockedItems.length === 0,
    requiresAcknowledgement: warnings.length > 0,
    blockedItems,
    warnings,
  };
}

module.exports = {
  DEFAULT_RESTRICTED_ITEMS,
  getRestrictedItemCatalog,
  validateDescriptions,
};

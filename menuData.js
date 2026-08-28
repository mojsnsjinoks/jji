/**
 * Menu Data Module
 *
 * Currently returns hardcoded Arabic sample menu items.
 * Structured as an async function so it can later be replaced with a live fetch
 * from a Google Sheet (e.g. via CSV endpoint or Google Sheets API) without changing
 * any downstream backend or Gemini logic.
 */

const SAMPLE_MENU = [
  { "name": "كابتشينو دبل اسباني", "price": 90, "category": "مشروبات", "description": "إسبريسو غني مع حليب مبخر وجرعة دبل" },
  { "name": "بيتزا مارجريتا الفاخرة", "price": 180, "category": "أطباق رئيسية - مخبوزات", "description": "جبنة موتزاريلا، صلصة طماطم طازة، ريحان" },
  { "name": "ساندوتش زنجر ارتيزان", "price": 120, "category": "أطباق رئيسية - مقلي", "description": "فيليه دجاج مقرمش متبل، خبز أرتيزان، مايونيز حار" },
  { "name": "برجر تشيز ارستقراطي", "price": 150, "category": "أطباق رئيسية - مشوي", "description": "قطعة لحم بقري، جبنة مزدوجة، خبز بريوش" },
  { "name": "ساكورا كيك رول", "price": 95, "category": "حلويات", "description": "رول اسفنجي طري بالكريمة ونكهة زهر الكرز" },
  { "name": "سوشي قارب نيجيري", "price": 220, "category": "مأكولات بحرية", "description": "تشكيلة سوشي نيجيري، سالمون وتونة طازة" }
];

/**
 * Retrieves the current menu dataset.
 * @returns {Promise<Array<{name: string, price: number, category: string, description: string}>>}
 */
async function getMenuData() {
  // In the future, replace this line with a live fetch from Google Sheets
  return SAMPLE_MENU;
}

module.exports = {
  getMenuData,
  SAMPLE_MENU
};

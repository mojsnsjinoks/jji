const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Clean markdown code block formatting if present in raw string
 */
function cleanJsonString(rawText) {
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.slice(7);
  } else if (text.startsWith('```')) {
    text = text.slice(3);
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3);
  }
  return text.trim();
}

/**
 * Validates parsed recommendations array against actual Arabic menu items.
 */
function validateRecommendations(recsArray, menuItems) {
  if (!Array.isArray(recsArray)) {
    return [];
  }

  const validated = [];
  for (const rec of recsArray) {
    if (!rec || typeof rec !== 'object') continue;
    const name = rec.item_name || rec.name;
    const reason = rec.reason || 'اختيار مميز هيعجبك جداً!';

    if (!name || typeof name !== 'string') continue;

    // Normalize Arabic string for comparison
    const cleanName = name.trim().toLowerCase();

    // Check if recommended item exists in the Arabic menu
    const matchingMenuObj = menuItems.find(m => {
      const menuNameClean = m.name.trim().toLowerCase();
      return menuNameClean === cleanName || menuNameClean.includes(cleanName) || cleanName.includes(menuNameClean);
    });

    if (matchingMenuObj) {
      validated.push({
        item_name: matchingMenuObj.name,
        price: matchingMenuObj.price,
        category: matchingMenuObj.category,
        description: matchingMenuObj.description,
        reason: reason
      });
    }
  }

  return validated;
}

/**
 * Helper to call Gemini model with model fallback support
 */
async function generateContentWithFallback(genAI, systemInstruction, userPrompt, preferredModel = 'gemini-1.5-flash') {
  const fallbackModels = [preferredModel, 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
  let lastErr = null;

  for (const modelName of fallbackModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const result = await model.generateContent([
        { text: systemInstruction },
        { text: userPrompt }
      ]);
      return result.response.text();
    } catch (err) {
      console.warn(`Model "${modelName}" notice:`, err.message || err);
      lastErr = err;
      continue;
    }
  }

  throw lastErr || new Error('All model fallback attempts failed.');
}

/**
 * Chef Leo AI Menu Recommendation Assistant (Egyptian Arabic Persona)
 * 
 * @param {string} userQuery - Customer's Arabic free-text message
 * @param {Array} menuItems - Current Arabic menu array
 * @returns {Promise<{greeting: string|null, recommendations: Array<{item_name: string, price: number, category: string, description: string, reason: string}>}>}
 */
async function searchMenuWithGemini(userQuery, menuItems) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const systemInstruction = `أنت "شيف ليو" (Chef Leo)، الشيف والمضيف الودود والماهر لمطعمنا الفاخر.
مهمتك هي التحدث مع الزبائن باللغة العربية العامية المصرية (عامية مصرية دافية ولطيفة ومقنعة).

قواعد صارمة ومهمة جداً للتعامل مع رسائل الزبائن:

1. التعامل مع التحية والكلام العام (قاعدة مهمة):
   - إذا كانت رسالة الزبون مجرد تحية (مثل: "هاي"، "أهلاً"، "السلام عليكم"، "صباح الخير"، "ازيك") أو كلام عام لا يتضمن طلب أكل أو ميزانية أو عدد أشخاص أو طلب ترشيح:
   - قم بالرد بتحية دافية وطبيعية بالعامية المصرية واطلب منه مشاركة ما يشتهيه (مثل: "أهلاً بيك في مطعمنا! تحب أرشحلك ايه النهاردة؟" أو "وعليكم السلام ورحمة الله وبركاته! نورتنا يا فندم، تحب تطلب أكل إيه النهاردة؟").
   - في هذه الحالة: لا تقترح أي طبق إطلاقاً، وأعد مصفوفة الأطباق المقترحة فارغة []!

2. اقتراح الأطباق (عند وجود طلب أكل صريح):
   - اقترح أطباق فقط عندما تتضمن رسالة الزبون طلباً واضحاً للأكل (مثل ذكر نوع الأكل، الميزانية، عدد الأشخاص، الحالة النفسية مثل "حاجة خفيفة"، أو طلب ترشيح صريح).
   - اقترح أطباق فقط من قائمة الطعام (المنيو) المرفقة أسفله. ممنوع إطلاقاً اختراع أطباق غير موجودة بالمنيو.
   - احترام الميزانية: إذا حدد الزبون ميزانية ومبلغ معين (مثلاً 300 جنيه) أو عدد أشخاص، يجب ألا يتجاوز مجموع أسعار الأطباق المقترحة هذه الميزانية.
   - لكل طبق تقترحه، اكتب جملة مشهية ومقنعة بالعامية المصرية تشرح ليه الطبق ده مناسب ليه بأسلوب مضيف مطعم شاطر ومبهج.

3. صيغة الإخراج (MUST BE STRICT JSON OBJECT):
{
  "greeting": "جملة الترحيب الدافية بالعامية المصرية (إذا كانت الرسالة تحية أو كلام عام)، أو اتركها null إذا كان طلب أكل صريح",
  "recommendations": [
    {
      "item_name": "اسم الطبق من المنيو بالضبط باللغة العربية",
      "reason": "الجملة المقنعة والمشهية بالعامية المصرية"
    }
  ]
}

قائمة الطعام (المنيو):
${JSON.stringify(menuItems, null, 2)}`;

  const prompt = `رسالة الزبون: "${userQuery}"\n\nحلل الرسالة واكتب الرد بصيغة JSON Object فقط وفقاً للقواعد.`;

  const parseAndValidate = (rawStr) => {
    const cleaned = cleanJsonString(rawStr);
    const parsed = JSON.parse(cleaned);

    let greeting = null;
    let recsRaw = [];

    if (Array.isArray(parsed)) {
      recsRaw = parsed;
    } else if (parsed && typeof parsed === 'object') {
      greeting = parsed.greeting || null;
      recsRaw = parsed.recommendations || [];
    }

    const validatedRecs = validateRecommendations(recsRaw, menuItems);
    return {
      greeting: greeting,
      recommendations: validatedRecs
    };
  };

  // First Attempt
  try {
    const rawResponse = await generateContentWithFallback(genAI, systemInstruction, prompt, 'gemini-1.5-flash');
    return parseAndValidate(rawResponse);
  } catch (firstError) {
    console.warn('Gemini 1st attempt parse/validation failed, retrying once with explicit Arabic prompt...', firstError.message);

    // Single Retry Attempt
    try {
      const retryPrompt = `الرد السابق لم يكن بصيغة JSON صحيحة.
رسالة الزبون الأصلية: "${userQuery}"

إذا كانت الرسالة تحية، أعد:
{ "greeting": "أهلاً بيك في مطعمنا! تحب أرشحلك ايه النهاردة؟", "recommendations": [] }

إذا كانت طلب أكل، أعد:
{
  "greeting": null,
  "recommendations": [
    { "item_name": "اسم الطبق من المنيو بالضبط", "reason": "سبب مشهي بالعامية المصرية" }
  ]
}
قائمة أسماء الأطباق بالمنيو: ${JSON.stringify(menuItems.map(m => m.name))}`;

      const rawRetry = await generateContentWithFallback(genAI, systemInstruction, retryPrompt, 'gemini-1.5-flash');
      return parseAndValidate(rawRetry);
    } catch (retryError) {
      console.error('Gemini retry attempt also failed:', retryError.message);
      throw new Error('معلش، مقدرتش أفهم طلبك، ممكن تجرب توضحه أكتر؟');
    }
  }
}

module.exports = {
  searchMenuWithGemini,
  validateRecommendations
};

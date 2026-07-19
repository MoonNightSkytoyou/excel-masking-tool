/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EntityType } from '../types';

// Regular expressions for deterministic PII types
const EMAIL_REGEX = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/;

const CN_PHONE_REGEX = /\b(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}\b/;
const TW_PHONE_REGEX = /\b09\d{2}-?\d{3}-?\d{3}\b/;
const EN_PHONE_REGEX = /\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/;

const CREDIT_CARD_REGEX = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})\b/;

const DATE_YMD = /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/;
const DATE_MDY = /\b\d{1,2}[-/.]\d{1,2}[-/.](?:\d{4}|\d{2})\b/;

// Keywords to assist in identification
const ADDRESS_KEYWORDS_CN = ['省', '市', '区', '县', '乡', '镇', '村', '路', '街', '大道', '号', '室', '胡同'];
const ADDRESS_KEYWORDS_TW = ['縣', '區', '鄉', '鎮', '路', '街', '大道', '號', '樓', '巷', '弄'];
const ADDRESS_KEYWORDS_EN = ['street', 'st.', 'st', 'avenue', 'ave.', 'ave', 'road', 'rd.', 'rd', 'drive', 'dr.', 'dr', 'lane', 'ln.', 'ln', 'boulevard', 'blvd.', 'blvd', 'way', 'court', 'ct.', 'ct'];

const SURNAMES_ZH = new Set([
  '赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨',
  '朱', '秦', '尤', '许', '何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏', '陶', '姜',
  '戚', '谢', '邹', '喻', '柏', '水', '窦', '章', '云', '苏', '潘', '葛', '奚', '范', '彭', '郎',
  '鲁', '韦', '昌', '马', '苗', '凤', '花', '方', '俞', '任', '袁', '柳', '酆', '鲍', '史', '唐',
  '费', '廉', '岑', '薛', '雷', '贺', '倪', '汤', '滕', '殷', '罗', '毕', '郝', '邬', '安', '常',
  '樂', '于', '時', '傅', '皮', '卞', '齊', '康', '伍', '余', '元', '卜', '顧', '孟', '平', '黃',
  '和', '穆', '蕭', '尹', '姚', '邵', '湛', '汪', '祁', '毛', '禹', '狄', '米', '貝', '明', '臧',
  '計', '伏', '成', '戴', '談', '宋', '茅', '龐', '熊', '紀', '舒', '屈', '項', '祝', '董', '梁',
  '杜', '阮', '藍', '閔', '席', '季', '麻', '強', '賈', '路', '婁', '危', '江', '童', '顏', '郭',
  '梅', '盛', '林', '刁', '鍾', '徐', '邱', '駱', '高', '夏', '蔡', '田', '樊', '胡', '凌', '霍',
  '虞', '萬', '支', '柯', '昝', '管', '盧', '莫', '經', '房', '裘', '繆', '干', '解', '應', '宗',
  '丁', '宣', '賁', '鄧', '郁', '單', '杭', '洪', '包', '諸', '左', '石', '崔', '吉', '鈕', '龔',
  '程', '嵇', '邢', '滑', '裴', '陸', '榮', '翁', '荀', '羊', '於', '惠', '甄', '麴', '家', '封',
  '芮', '羿', '儲', '靳', '汲', '邴', '糜', '松', '井', '段', '富', '巫', '烏', '焦', '巴', '弓',
  '牧', '隗', '山', '谷', '車', '侯', '宓', '蓬', '全', '郗', '班', '仰', '秋', '仲', '伊', '宮',
  '寧', '仇', '欒', '暴', '甘', '鈄', '厲', '戎', '祖', '武', '符', '劉', '景', '詹', '束', '龍',
  '葉', '幸', '司', '韶', '郜', '黎', '薊', '薄', '印', '宿', '白', '懷', '蒲', '邰', '從', '鄂',
  '索', '咸', '籍', '賴', '卓', '藺', '屠', '蒙', '池', '喬', '陰', '鬱', '胥', '能', '蒼', '雙',
  '聞', '莘', '黨', '翟', '譚', '貢', '勞', '逄', '姬', '申', '扶', '堵', '冉', '宰', '酈', '雍',
  '郤', '璩', '桑', '桂', '濮', '牛', '壽', '通', '邊', '扈', '燕', '冀', '郟', '浦', '尚', '農',
  '溫', '別', '莊', '晏', '柴', '瞿', '閻', '充', '慕', '連', '茹', '習', '宦', '艾', '魚', '容',
  '向', '古', '易', '慎', '戈', '廖', '庾', '終', '暨', '居', '衡', '步', '都', '耿', '滿', '弘',
  '匡', '國', '文', '寇', '廣', '祿', '闕', '東', '歐', '殳', '沃', '利', '蔚', '越', '夔', '隆',
  '師', '鞏', '厍', '聶', '晁', '勾', '敖', '融', '冷', '訾', '辛', '那', '簡', '饒', '空', '曾',
  '毋', '沙', '乜', '養', '鞠', '須', '豐', '巢', '關', '蒯', '相', '查', '后', '荊', '紅', '游',
  '竺', '權', '逯', '蓋', '益', '桓', '公', '万俟', '司馬', '上官', '歐陽', '夏侯', '諸葛', '聞人',
  '東方', '赫連', '皇甫', '尉遲', '公羊', '澹臺', '公冶', '宗政', '濮陽', '淳於', '單于', '太叔',
  '申屠', '公孫', '仲孫', '軒轅', '令狐', '鍾離', '宇文', '長孫', '慕容', '鮮于', '閭丘', '司徒',
  '司空', '亓官', '司寇', '仉', '督', '子車', '顓孫', '端木', '巫馬', '公西', '漆雕', '樂正', '壤駟',
  '公良', '拓跋', '夾谷', '宰父', '穀梁', '晉', '楚', '閆', '法', '汝', '鄢', '涂', '欽', '段干',
  '百里', '東郭', '南門', '呼延', '歸', '海', '羊舌', '微生', '岳', '帥', '緱', '亢', '況', '後',
  '有', '琴', '梁丘', '左丘', '東門', '西門', '商', '牟', '佘', '佴', '伯', '賞', '南宮', '墨',
  '哈', '譙', '笪', '年', '愛', '陽', '佟', '賴', '黃', '蔡', '廖'
]);

/**
 * Heuristic scan of a single text cell to determine if it resembles a PII.
 */
export function detectCellType(text: string): EntityType | undefined {
  if (!text) return undefined;
  const cleaned = text.trim();
  if (cleaned.length === 0) return undefined;

  // 1. EMAIL
  if (EMAIL_REGEX.test(cleaned)) {
    return 'EMAIL';
  }

  // 2. CREDIT CARD
  if (CREDIT_CARD_REGEX.test(cleaned.replace(/[-.\s]/g, ''))) {
    return 'CREDIT_CARD';
  }

  // 3. PHONE
  const digitsOnly = cleaned.replace(/[-.\s()+]/g, '');
  if (CN_PHONE_REGEX.test(digitsOnly) || TW_PHONE_REGEX.test(digitsOnly) || EN_PHONE_REGEX.test(cleaned)) {
    return 'PHONE';
  }

  // 4. DATE
  if (DATE_YMD.test(cleaned) || DATE_MDY.test(cleaned)) {
    return 'DATE';
  }

  // 5. ADDRESS
  // If it's sufficiently long and contains address keywords
  if (cleaned.length >= 6) {
    const hasCnKw = ADDRESS_KEYWORDS_CN.some(kw => cleaned.includes(kw));
    const hasTwKw = ADDRESS_KEYWORDS_TW.some(kw => cleaned.includes(kw));
    const lower = cleaned.toLowerCase();
    const hasEnKw = ADDRESS_KEYWORDS_EN.some(kw => lower.includes(kw));
    if (hasCnKw || hasTwKw || hasEnKw) {
      return 'ADDRESS';
    }
  }

  // 6. NAME
  // Chinese Name heuristic: Length 2-4, all Chinese, starts with a common surname
  if (/^[\u4e00-\u9fa5]{2,4}$/.test(cleaned)) {
    const firstChar = cleaned.charAt(0);
    const firstTwoChars = cleaned.substring(0, 2);
    if (SURNAMES_ZH.has(firstChar) || SURNAMES_ZH.has(firstTwoChars)) {
      return 'NAME';
    }
  }

  // 7. COMPANY
  if (/(?:公司|集團|有限公司|股份公司|工作室|商行|Co\.|Ltd\.|Corp\.|Inc\.|LLC)$/i.test(cleaned)) {
    return 'COMPANY';
  }

  return undefined;
}

/**
 * Column Header parsing: auto-identifies whole columns based on column headers.
 * This is incredibly powerful and handles tabular files perfectly.
 */
export function detectTypeFromHeader(header: string): EntityType | undefined {
  if (!header) return undefined;
  const lower = header.trim().toLowerCase();

  if (/公司|公司名稱|集團|企業|商號|company|firm|corp|corporation|organization|employer|business|vendor|client_company/i.test(lower)) {
    return 'COMPANY';
  }
  if (/姓名|姓名\/name|name|owner|contacts?|contact|聯絡人|聯絡人姓名|顧客姓名|customer|client/i.test(lower)) {
    return 'NAME';
  }
  if (/电话|電話|手机|手機|聯絡電話|号码|号码|phone|mobile|tel|contact_number|cellphone/i.test(lower)) {
    return 'PHONE';
  }
  if (/邮箱|電子郵件|电子邮件|email|e-mail|mail_address|addr_mail/i.test(lower)) {
    return 'EMAIL';
  }
  if (/地址|住址|聯絡地址|address|residential|street_address|location/i.test(lower)) {
    return 'ADDRESS';
  }
  if (/日期|生日|建立時間|date|birthday|created_at|updated_at|timestamp/i.test(lower)) {
    return 'DATE';
  }
  if (/卡号|卡號|信用卡|credit_card|credit|card_number|card_no|pan/i.test(lower)) {
    return 'CREDIT_CARD';
  }
  if (/金額|薪資|薪水|salary|wage|income|revenue|price|amount|cost|費用|單價|金額\/amount|薪資\/salary|年薪|月薪|獎金|bonus|pay|payment/i.test(lower)) {
    return 'AMOUNT';
  }
  if (/基底|基底數值|base|base_value|basevalue|factor_base|公式基底/i.test(lower)) {
    return 'FORMULA_BASE';
  }
  if (/敏感單一數值|敏感數值|敏感數字|sensitive_numeric|sensitive_num|sensitive_value|single_value/i.test(lower)) {
    return 'SENSITIVE_NUMERIC';
  }

  return undefined;
}

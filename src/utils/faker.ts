/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EntityType } from '../types';

// Simple seeded pseudo-random number generator (sfc32)
export function createPRNG(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (h ^ (h >>> 16)) >>> 0;
  let b = (h ^ (a >>> 15)) >>> 0;
  let c = (h ^ (b >>> 13)) >>> 0;
  let d = c ^ b;

  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

// Seeded array pick
function seededPick<T>(arr: T[], rng: () => number): T {
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

// Seeded number range [min, max]
function seededRange(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// Datasets for realistic mock generation
const SURNAMES_ZH_CN = [
  '赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '褚', '卫', '蒋', '沈', '韩', '杨',
  '朱', '秦', '尤', '许', '何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏', '陶', '姜',
  '戚', '谢', '邹', '喻', '柏', '水', '窦', '章', '云', '苏', '潘', '葛', '奚', '范', '彭', '郎',
  '鲁', '韦', '昌', '马', '苗', '凤', '花', '方', '俞', '任', '袁', '柳', '酆', '鲍', '史', '唐',
  '费', '廉', '岑', '薛', '雷', '贺', '倪', '汤', '滕', '殷', '罗', '毕', '郝', '邬', '安', '常'
];

const GIVEN_NAMES_ZH_CN = [
  '伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋', '勇', '艳', '杰', '娟', '涛', '明',
  '超', '秀兰', '霞', '平', '刚', '桂英', '文', '宏', '辉', '帅', '晨', '宇', '欣', '婷', '佳', '航',
  '浩', '然', '轩', '雨', '梓', '凯', '涵', '琪', '乐', '毅', '健', '骏', '天', '博', '雅', '梦'
];

const SURNAMES_ZH_TW = [
  '陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '洪', '郭', '邱',
  '曾', '廖', '賴', '徐', '周', '葉', '莊', '蘇', '何', '莊', '蕭', '詹', '沈', '羅', '江', '梁'
];

const GIVEN_NAMES_ZH_TW = [
  '冠宇', '家豪', '承翰', '承恩', '宇軒', '欣妤', '雅婷', '雨婷', '詩婷', '郁婷', '雅雯', '佳穎',
  '千惠', '美玲', '美惠', '淑珍', '淑華', '宛婷', '庭萱', '思妤', '若瑄', '博宇', '俊傑', '子軒',
  '冠廷', '威廷', '哲宇', '皓宇', '欣怡', '佩珊', '佳蓉', '宛蓁', '宜婷', '靜怡', '惠婷', '佩君'
];

const SURNAMES_ZH_HK = [
  '陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '洪', '郭', '鄧',
  '梁', '曾', '廖', '賴', '徐', '周', '葉', '莊', '蘇', '何', '蕭', '詹', '沈', '羅', '江', '鍾',
  '盧', '彭', '胡', '趙', '潘'
];

const GIVEN_NAMES_ZH_HK = [
  '嘉欣', '俊賢', '雅婷', '志偉', '子健', '浩然', '卓軒', '家豪', '穎欣', '詠珊', '梓軒', '俊傑',
  '樂軒', '宇軒', '欣怡', '家樂', '明軒', '美玲', '淑賢', '宛婷', '家瑜', '皓軒', '梓豪', '凱晴',
  '曉彤', '穎彤', '子軒', '凱晴', '芷晴', '俊宇', '俊熙', '子謙', '曉瑩', '家晴'
];

const SURNAMES_EN = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez',
  'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson',
  'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker'
];

const FIRST_NAMES_EN = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Christopher', 'Matthew', 'Daniel', 'Emily', 'Ashley', 'Amanda', 'Jessica', 'David', 'James', 'Robert'
];

const STREETS_ZH_CN = [
  '中山路', '人民路', '解放路', '青年路', '新华路', '建设路', '和平路', '复兴路', '朝阳路', '友谊路',
  '中关村大街', '南京东路', '深南大道', '芙蓉南路', '天府大道', '黄河路', '长江路', '淮海路', '西藏中路'
];

const CITY_DISTRICTS_ZH_CN = [
  { prov: '北京市', city: '北京市', dist: '海淀区' },
  { prov: '北京市', city: '北京市', dist: '朝阳区' },
  { prov: '上海市', city: '上海市', dist: '浦东新区' },
  { prov: '上海市', city: '上海市', dist: '徐汇区' },
  { prov: '广东省', city: '广州市', dist: '天河区' },
  { prov: '广东省', city: '深圳市', dist: '南山区' },
  { prov: '四川省', city: '成都市', dist: '武侯区' },
  { prov: '浙江省', city: '杭州市', dist: '西湖区' },
  { prov: '江苏省', city: '南京市', dist: '玄武区' },
  { prov: '湖北省', city: '武汉市', dist: '武昌区' }
];

const STREETS_ZH_TW = [
  '忠孝東路', '仁愛路', '信義路', '和平东路', '南京東路', '民生東路', '八德路', '中華路', '重慶南路',
  '台灣大道', '公益路', '美村路', '三民路', '五福路', '中山路', '成功路', '復興路', '自由路'
];

const CITY_DISTRICTS_ZH_TW = [
  { city: '台北市', dist: '大安區' },
  { city: '台北市', dist: '信義區' },
  { city: '台北市', dist: '中山區' },
  { city: '新北市', dist: '板橋區' },
  { city: '新北市', dist: '中和區' },
  { city: '台中市', dist: '西屯區' },
  { city: '台中市', dist: '北屯區' },
  { city: '高雄市', dist: '苓雅區' },
  { city: '高雄市', dist: '三民區' },
  { city: '台南市', dist: '東區' }
];

const STREETS_ZH_HK = [
  '彌敦道', '軒尼詩道', '德輔道中', '皇后大道中', '亞皆老街', '長沙灣道', '渣華道', '英皇道',
  '漆咸道北', '青山公路', '大埔公路', '沙田正街', '屯門鄉事會路', '元朗體育路', '廣東道'
];

const CITY_DISTRICTS_ZH_HK = [
  { region: '香港島', dist: '中西區' },
  { region: '香港島', dist: '灣仔區' },
  { region: '香港島', dist: '東區' },
  { region: '香港島', dist: '南區' },
  { region: '九龍', dist: '油尖旺區' },
  { region: '九龍', dist: '深水埗區' },
  { region: '九龍', dist: '九龍城區' },
  { region: '九龍', dist: '黃大仙區' },
  { region: '九龍', dist: '觀塘區' },
  { region: '新界', dist: '沙田區' },
  { region: '新界', dist: '屯門區' },
  { region: '新界', dist: '元朗區' },
  { region: '新界', dist: '荃灣區' },
  { region: '新界', dist: '大埔區' }
];

const STREETS_EN = [
  'Main St', 'Oak Ave', 'Pine Road', 'Maple Drive', 'Cedar Lane', 'Washington Boulevard',
  'Broadway', 'Park Place', 'Sunset Strip', 'Madison Avenue', 'Peachtree St', 'Michigan Ave'
];

const CITIES_EN = [
  { city: 'Springfield', state: 'IL', zip: '62701' },
  { city: 'Seattle', state: 'WA', zip: '98101' },
  { city: 'Austin', state: 'TX', zip: '78701' },
  { city: 'Boston', state: 'MA', zip: '02108' },
  { city: 'Denver', state: 'CO', zip: '80202' },
  { city: 'San Francisco', state: 'CA', zip: '94102' },
  { city: 'Chicago', state: 'IL', zip: '60601' },
  { city: 'New York', state: 'NY', zip: '10001' },
  { city: 'Atlanta', state: 'GA', zip: '30301' },
  { city: 'Miami', state: 'FL', zip: '33101' }
];

const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'qq.com', '163.com', 'mail.ru', 'naver.com', 'gmx.com'
];

/**
 * Deterministic faker function that maps an original text to a masked fake value
 * based on EntityType and Locale.
 */
export function generateFakeValue(
  original: string,
  type: EntityType,
  locale: 'zh_CN' | 'zh_TW' | 'en' | 'zh_HK',
  salt: string = 'mask-salt'
): string {
  // Create deterministic RNG seeded with original text + salt
  const rng = createPRNG(original + salt);

  switch (type) {
    case 'NAME': {
      if (locale === 'zh_CN') {
        const surname = seededPick(SURNAMES_ZH_CN, rng);
        // 70% chance of double character given name, 30% single character
        const doubleChar = rng() > 0.3;
        const char1 = seededPick(GIVEN_NAMES_ZH_CN, rng);
        const char2 = doubleChar ? seededPick(GIVEN_NAMES_ZH_CN, rng) : '';
        return `${surname}${char1}${char2}`;
      } else if (locale === 'zh_TW') {
        const surname = seededPick(SURNAMES_ZH_TW, rng);
        const givenName = seededPick(GIVEN_NAMES_ZH_TW, rng);
        return `${surname}${givenName}`;
      } else if (locale === 'zh_HK') {
        const surname = seededPick(SURNAMES_ZH_HK, rng);
        const givenName = seededPick(GIVEN_NAMES_ZH_HK, rng);
        return `${surname}${givenName}`;
      } else {
        const first = seededPick(FIRST_NAMES_EN, rng);
        const last = seededPick(SURNAMES_EN, rng);
        return `${first} ${last}`;
      }
    }

    case 'PHONE': {
      if (locale === 'zh_CN') {
        const prefixes = ['138', '139', '150', '158', '186', '177', '189'];
        const pfx = seededPick(prefixes, rng);
        const suffix = Array.from({ length: 8 }, () => seededRange(0, 9, rng)).join('');
        return `${pfx}${suffix}`;
      } else if (locale === 'zh_TW') {
        const suffix = Array.from({ length: 8 }, () => seededRange(0, 9, rng)).join('');
        // Mobile starts with 09
        return `09${suffix.substring(0, 2)}-${suffix.substring(2, 5)}-${suffix.substring(5)}`;
      } else if (locale === 'zh_HK') {
        const prefixes = ['5', '6', '9'];
        const pfx = seededPick(prefixes, rng);
        const suffix = Array.from({ length: 7 }, () => seededRange(0, 9, rng)).join('');
        return `${pfx}${suffix.substring(0, 3)} ${suffix.substring(3)}`;
      } else {
        const areaCode = seededRange(200, 999, rng);
        const prefix = seededRange(100, 999, rng);
        const line = seededRange(1000, 9999, rng);
        return `+1 (${areaCode}) ${prefix}-${line}`;
      }
    }

    case 'EMAIL': {
      // Create user name from name arrays
      let user = '';
      if (locale === 'zh_CN' || locale === 'zh_TW' || locale === 'zh_HK') {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        user = Array.from({ length: seededRange(5, 10, rng) }, () => seededPick(letters.split(''), rng)).join('');
      } else {
        const first = seededPick(FIRST_NAMES_EN, rng).toLowerCase();
        const last = seededPick(SURNAMES_EN, rng).toLowerCase();
        user = `${first}.${last}${seededRange(10, 99, rng)}`;
      }
      const domain = seededPick(EMAIL_DOMAINS, rng);
      return `${user}@${domain}`;
    }

    case 'ADDRESS': {
      if (locale === 'zh_CN') {
        const cd = seededPick(CITY_DISTRICTS_ZH_CN, rng);
        const street = seededPick(STREETS_ZH_CN, rng);
        const no = seededRange(1, 400, rng);
        const room = seededRange(101, 2405, rng);
        return `${cd.prov}${cd.city}${cd.dist}${street}${no}号${room}室`;
      } else if (locale === 'zh_TW') {
        const cd = seededPick(CITY_DISTRICTS_ZH_TW, rng);
        const street = seededPick(STREETS_ZH_TW, rng);
        const sec = rng() > 0.5 ? `${seededRange(1, 4, rng)}段` : '';
        const no = seededRange(1, 600, rng);
        const floor = seededRange(2, 25, rng);
        return `${cd.city}${cd.dist}${street}${sec}${no}號${floor}樓`;
      } else if (locale === 'zh_HK') {
        const cd = seededPick(CITY_DISTRICTS_ZH_HK, rng);
        const street = seededPick(STREETS_ZH_HK, rng);
        const no = seededRange(1, 300, rng);
        const floor = seededRange(2, 45, rng);
        const flat = seededPick(['A', 'B', 'C', 'D', 'E'], rng);
        return `${cd.region}${cd.dist}${street}${no}號${floor}樓${flat}室`;
      } else {
        const cityObj = seededPick(CITIES_EN, rng);
        const street = seededPick(STREETS_EN, rng);
        const num = seededRange(100, 9999, rng);
        return `${num} ${street}, ${cityObj.city}, ${cityObj.state} ${cityObj.zip}`;
      }
    }

    case 'COMPANY': {
      if (locale === 'zh_CN') {
        const prefixes = ['华通', '宏达', '百川', '星宇', '天盛', '信达', '恒瑞', '创世'];
        const industries = ['科技', '商贸', '实业', '制造', '信息', '网络', '物流'];
        const pfx = seededPick(prefixes, rng);
        const ind = seededPick(industries, rng);
        return `${pfx}${ind}有限公司`;
      } else if (locale === 'zh_TW' || locale === 'zh_HK') {
        const prefixes = ['台聚', '宏盛', '永達', '星河', '天瑞', '信誠', '恒生', '創立', '中建', '長江'];
        const industries = ['科技', '實業', '製造', '資訊', '網絡', '物流', '金融', '地產'];
        const pfx = seededPick(prefixes, rng);
        const ind = seededPick(industries, rng);
        const suffix = locale === 'zh_HK' ? '有限公司' : '股份有限公司';
        return `${pfx}${ind}${suffix}`;
      } else {
        const prefixes = ['Global', 'Apex', 'Horizon', 'Summit', 'Vertex', 'Stellar', 'Synergy'];
        const industries = ['Technologies', 'Solutions', 'Logistics', 'Ventures', 'Holdings', 'Group'];
        const pfx = seededPick(prefixes, rng);
        const ind = seededPick(industries, rng);
        return `${pfx} ${ind} LLC`;
      }
    }

    case 'CREDIT_CARD': {
      // Generate visa/mastercard lookalikes with Luhn checksum or just realistic card sequence
      const cardPrefix = seededPick(['4', '51', '52', '55'], rng);
      const remainingLength = 16 - cardPrefix.length;
      const digits = Array.from({ length: remainingLength }, () => seededRange(0, 9, rng)).join('');
      const fullNum = `${cardPrefix}${digits}`;
      // Format as groups of 4
      return `${fullNum.substring(0, 4)} ${fullNum.substring(4, 8)} ${fullNum.substring(8, 12)} ${fullNum.substring(12, 16)}`;
    }

    case 'DATE': {
      // Date replace (return random realistic date in past 5 years of same format or random ISO)
      const year = seededRange(2020, 2025, rng);
      const month = String(seededRange(1, 12, rng)).padStart(2, '0');
      const day = String(seededRange(1, 28, rng)).padStart(2, '0');
      if (original.includes('-')) {
        return `${year}-${month}-${day}`;
      } else if (original.includes('/')) {
        return `${year}/${month}/${day}`;
      } else {
        return `${year}-${month}-${day}`;
      }
    }

    default:
      return `[MASKED_${original.length}]`;
  }
}
export function sha256Hash(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const asciiLength = bytes.length;
  let wordsLength = ((asciiLength + 8) >> 6) + 1;
  const words = new Int32Array(wordsLength * 16);
  
  for (let i = 0; i < asciiLength; i++) {
    words[i >> 2] |= (bytes[i] & 0xff) << (24 - (i % 4) * 8);
  }
  words[asciiLength >> 2] |= 0x80 << (24 - (asciiLength % 4) * 8);
  words[wordsLength * 16 - 1] = asciiLength * 8;

  for (let i = 0; i < words.length; i += 16) {
    const w = Array.from(words.subarray(i, i + 16));
    const oldHash = [...hash];

    // Extend to 64 words
    for (let j = 16; j < 64; j++) {
      const w15 = w[j - 15];
      const w2 = w[j - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    for (let j = 0; j < 64; j++) {
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ((hash[4] & hash[5]) ^ (~hash[4] & hash[6])) + k[j] + w[j]) | 0;
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + ((hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]))) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (let j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  return hash.map(h => (h >>> 0).toString(16).padStart(8, '0')).join('').toUpperCase();
}

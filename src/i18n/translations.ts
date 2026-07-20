/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationSet {
  appTitle: string;
  appSub: string;
  sandboxStatus: string;
  importStep: string;
  configStep: string;
  auditStep: string;
  selectFileTitle: string;
  selectFileSubPre: string;
  selectFileSubSuf: string;
  dragDropText: string;
  dragDropSub: string;
  parsingText: string;
  parsingSub: string;
  sandboxTitle: string;
  sandboxDesc: string;
  formulaTitle: string;
  formulaDesc: string;
  fakeTitle: string;
  fakeDesc: string;
  reselectFile: string;
  globalStrategy: string;
  localeLabel: string;
  localeDesc: string;
  jitterLabel: string;
  numericJitterLabel: string;
  dateJitterLabel: string;
  defaultEntityLabel: string;
  saltLabel: string;
  updateSalt: string;
  sheetConfigTitle: string;
  columnHeader: string;
  headerNameHeader: string;
  detectedTypeHeader: string;
  overrideTypeHeader: string;
  applyOperatorHeader: string;
  generalData: string;
  unspecifiedType: string;
  applyButton: string;
  applyFooterInfo: string;
  previewTitle: string;
  previewSub: string;
  searchPlaceholder: string;
  cellHeader: string;
  originalHeader: string;
  maskedHeader: string;
  statusHeader: string;
  emptySheet: string;
  viewTopRows: string;
  totalCells: string;
  allLocalWarning: string;
  qualityInfoTitle: string;
  qualityInfoDesc: string;
  adjustStrategy: string;
  downloadButton: string;
  fileSize: string;
  sheetsCount: string;
  emptyCell: string;
  headerRow: string;
  formulaRecalc: string;
  maskedSuccess: string;
  noChange: string;
  errorParsing: string;
  errorFormat: string;
  errorSize: string;
  days: string;
  opLabels: Record<string, string>;
  entityLabels: Record<string, string>;
  locales: Record<string, string>;
  formulaIndicator: string;
  fx: string;
  binningLevelsLabel: string;
}

export type Locale = 'zh' | 'en';

export const TRANSLATIONS: Record<Locale, TranslationSet> = {
  zh: {
    appTitle: "Excel 數據脫敏工具",
    appSub: "100% 瀏覽器本地沙箱處理，檔案無任何網絡上載，保障資料私隱與合規性。",
    sandboxStatus: "本地沙箱已就緒",
    importStep: "匯入檔案",
    configStep: "脫敏策略配置",
    auditStep: "效果比對審計",
    selectFileTitle: "選擇要脫敏的 Excel 檔案",
    selectFileSubPre: "支援 ",
    selectFileSubSuf: " 試算表，單檔案上限為 20MB。",
    dragDropText: "拖曳檔案至此，或點選瀏覽",
    dragDropSub: "支援標準與多工作表（Sheets）試算表",
    parsingText: "正在解析試算表結構...",
    parsingSub: "正在讀取公式、單元格並比對特徵",
    sandboxTitle: "100% 離線沙箱",
    sandboxDesc: "全部處理在您的瀏覽器記憶體中完成，資料完全不出域。",
    formulaTitle: "公式保留重算",
    formulaDesc: "試算表公式完整保留，下載於 Excel 啟動時會根據遮罩值自動重新計算。",
    fakeTitle: "多語智能偽值",
    fakeDesc: "採用種子隨機化演算法，保證同一原始值在整份試算表映射相同的假名偽值。",
    reselectFile: "重新選擇檔案",
    globalStrategy: "全域脫敏策略",
    localeLabel: "虛擬偽值語系 (Locale)",
    localeDesc: "決定產生的假姓名、假地址、假電話的在地化特徵。",
    jitterLabel: "數值與日期隨機化配置 (Jitter)",
    numericJitterLabel: "數值抖動幅度",
    dateJitterLabel: "日期偏移天數",
    defaultEntityLabel: "預設敏感型態處理",
    saltLabel: "去標識化哈希鹽值 (Salt)",
    updateSalt: "更新鹽值",
    sheetConfigTitle: "工作表與欄位微調設定",
    columnHeader: "直欄",
    headerNameHeader: "標頭首列名稱 (Header)",
    detectedTypeHeader: "智慧識別特徵",
    overrideTypeHeader: "強制型態覆寫",
    applyOperatorHeader: "套用脫敏算子",
    generalData: "一般資料 (None)",
    unspecifiedType: "不特定敏感型態",
    applyButton: "應用脫敏策略與預覽",
    applyFooterInfo: "預覽載入僅會套用策略模擬，可在確認無誤後隨時調整。",
    previewTitle: "資料脫敏比對審計",
    previewSub: "高亮顯示變更。公式一律保留其計算模型，並不鎖死計算。",
    searchPlaceholder: "搜尋原始單元格...",
    cellHeader: "單元格",
    originalHeader: "原始儲存格值 (Original)",
    maskedHeader: "遮罩仿真結果 (Masked Result)",
    statusHeader: "變更特徵與狀態",
    emptySheet: "此工作表沒有單元格數據",
    viewTopRows: "檢視前 200 筆比對",
    totalCells: "共 {count} 個單元格",
    allLocalWarning: "所有資料計算均在您本機完成",
    qualityInfoTitle: "質量與合規提醒",
    qualityInfoDesc: "由於採用 100% 離線沙箱架構，本預覽比對已完整。當您匯出並在 Excel 中打開時，所有的 Excel 公式將會依據全新遮罩的關聯儲存格自動完成數值重算，不遺留原敏感數據。",
    adjustStrategy: "調整策略",
    downloadButton: "下載脫敏後 Excel",
    fileSize: "大小",
    sheetsCount: "個工作表",
    emptyCell: "(空)",
    headerRow: "欄位標頭 (跳過)",
    formulaRecalc: "公式重算",
    maskedSuccess: "已安全遮罩",
    noChange: "未變更",
    errorParsing: "解析檔案時發生錯誤：",
    errorFormat: "僅支援 .xlsx、.xls 與 .csv 格式之試算表。",
    errorSize: "檔案大小超過 20MB 安全上限，為確保瀏覽器執行效能，請拆分後再進行。",
    days: "天",
    opLabels: {
      PSEUDO: '智能替換 (Pseudo)',
      MASK: '星號掩碼 (Mask)',
      REDACT: '完全抑制 (Redact)',
      HASH: '哈希去標識 (Hash)',
      JITTER: '數值抖動 (Jitter)',
      BINNING: '區間與級距化 (Binning)',
      INDEX: '指數與百分比化 (Index/Norm)',
      SCALE: '統一秘密常數等比例縮放 (Scale)',
      NONE: '保留原值 (None)'
    },
    entityLabels: {
      NAME: '姓名 (Name)',
      PHONE: '電話 (Phone)',
      EMAIL: '電郵 (Email)',
      ADDRESS: '地址 (Address)',
      DATE: '日期 (Date)',
      CREDIT_CARD: '信用卡 (Credit Card)',
      SENSITIVE_NUMERIC: '敏感單一數值 (Sensitive Num)',
      AMOUNT: '金額 (Amount)',
      FORMULA_BASE: '公式的基底數值 (Formula Base)',
      COMPANY: '公司名稱 (Company Name)'
    },
    locales: {
      zh_TW: '繁體中文 (台灣)',
      zh_CN: '简体中文 (大陸)',
      zh_HK: '繁體中文 (香港)',
      en: 'English (US)'
    },
    formulaIndicator: '公式已保留，Excel 啟動時自動重算',
    fx: '公式',
    binningLevelsLabel: '層級數'
  },
  en: {
    appTitle: "Excel Masking & Anonymization Tool",
    appSub: "100% browser client-side sandbox execution. Your files are never uploaded, ensuring complete data privacy and security.",
    sandboxStatus: "Local sandbox ready",
    importStep: "Import File",
    configStep: "Masking Strategy",
    auditStep: "Audit & Preview",
    selectFileTitle: "Select Excel File to Anonymize",
    selectFileSubPre: "Supports ",
    selectFileSubSuf: " sheets, max 20MB limit.",
    dragDropText: "Drag and drop your file here, or click to browse",
    dragDropSub: "Supports standard and multi-sheet workbooks",
    parsingText: "Parsing workbook structures...",
    parsingSub: "Reading formulas, cells, and detecting data features",
    sandboxTitle: "100% Client Sandbox",
    sandboxDesc: "All processing occurs entirely in browser memory. Data never leaves your device.",
    formulaTitle: "Formula Preservation",
    formulaDesc: "Spreadsheet formulas are preserved. Formulas will automatically re-evaluate in Excel with masked values.",
    fakeTitle: "Smart Fake Value Generation",
    fakeDesc: "Uses deterministic seeded randomizer. The same original value consistently maps to the same pseudonym.",
    reselectFile: "Choose Another File",
    globalStrategy: "Global Masking Strategy",
    localeLabel: "Fake Value Locale",
    localeDesc: "Determines regional formats for generated fake names, addresses, and phone numbers.",
    jitterLabel: "Numeric & Date Jitter Configuration",
    numericJitterLabel: "Numeric Jitter Range",
    dateJitterLabel: "Date Jitter Days",
    defaultEntityLabel: "Default Type Actions",
    saltLabel: "Anonymization Salt/Seed",
    updateSalt: "Rotate Salt",
    sheetConfigTitle: "Sheets & Columns Tuning",
    columnHeader: "Col",
    headerNameHeader: "First Row Header Name",
    detectedTypeHeader: "Smart Identified Features",
    overrideTypeHeader: "Type Override",
    applyOperatorHeader: "Masking Operator",
    generalData: "General Data (None)",
    unspecifiedType: "General / Unspecified Type",
    applyButton: "Apply Strategy & Preview",
    applyFooterInfo: "Loading preview will apply simulated masks. You can refine strategies at any time.",
    previewTitle: "Data Masking Comparison Audit",
    previewSub: "Changes highlighted below. Original formula logic is fully preserved and recalculated dynamically.",
    searchPlaceholder: "Search original cells...",
    cellHeader: "Cell",
    originalHeader: "Original Value",
    maskedHeader: "Masked Result",
    statusHeader: "Change Feature / Status",
    emptySheet: "This sheet has no data cells.",
    viewTopRows: "Viewing top 200 comparison rows",
    totalCells: "Total {count} cells",
    allLocalWarning: "All computations run purely on your machine",
    qualityInfoTitle: "Privacy & Quality Reminder",
    qualityInfoDesc: "Since this application uses a serverless offline sandbox architecture, when you download and open the file in Excel, all Excel formulas will recompute themselves seamlessly using the new anonymized values, leaving no traces of original sensitive values.",
    adjustStrategy: "Adjust Strategy",
    downloadButton: "Download Masked Excel",
    fileSize: "Size",
    sheetsCount: "sheets",
    emptyCell: "(empty)",
    headerRow: "Column Header (Skipped)",
    formulaRecalc: "Formula Recalc",
    maskedSuccess: "Anonymized",
    noChange: "No Change",
    errorParsing: "Error parsing Excel workbook: ",
    errorFormat: "Only .xlsx, .xls, and .csv formats are supported.",
    errorSize: "File size exceeds the 20MB limit. Please split the sheet to ensure browser rendering performance.",
    days: "Days",
    opLabels: {
      PSEUDO: 'Replace (Pseudo)',
      MASK: 'Asterisk Mask',
      REDACT: 'Redact/Remove',
      HASH: 'Deterministic Hash',
      JITTER: 'Numerical Jitter',
      BINNING: 'Interval Binning (Binning)',
      INDEX: 'Index/Normalization (Index/Norm)',
      SCALE: 'Secret Constant Scaling (Scale)',
      NONE: 'Keep Original'
    },
    entityLabels: {
      NAME: 'Name',
      PHONE: 'Phone',
      EMAIL: 'Email',
      ADDRESS: 'Address',
      DATE: 'Date',
      CREDIT_CARD: 'Credit Card',
      SENSITIVE_NUMERIC: 'Sensitive Single Numeric Value',
      AMOUNT: 'Amount',
      FORMULA_BASE: 'Formula Base Value',
      COMPANY: 'Company Name'
    },
    locales: {
      zh_TW: 'Traditional Chinese (Taiwan)',
      zh_CN: 'Simplified Chinese (Mainland)',
      zh_HK: 'Traditional Chinese (Hong Kong)',
      en: 'English (US)'
    },
    formulaIndicator: 'Formula preserved, Excel will automatically recalculate',
    fx: 'Formula',
    binningLevelsLabel: 'Levels'
  }
};

export function getEntityLabel(t: TranslationSet, type: string): string {
  return (t.entityLabels as Record<string, string>)[type] || type;
}

export function getOperatorLabel(t: TranslationSet, op: string): string {
  return (t.opLabels as Record<string, string>)[op] || op;
}

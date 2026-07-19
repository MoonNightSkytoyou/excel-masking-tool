/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Check,
  Sparkles,
  Download,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Languages,
  Grid3X3,
  Search,
  Eye,
  Info,
  Sliders,
  Database
} from 'lucide-react';
import { CellModel, ColumnConfig, SheetData, MaskingConfig, EntityType, Operator, SessionContext } from '../types';
import { parseExcelFile, exportMaskedExcel } from '../utils/xlsx-handler';
import { maskCell } from '../utils/masker';

const DEFAULT_GLOBAL_OPERATORS: Record<EntityType, Operator> = {
  NAME: 'PSEUDO',
  PHONE: 'MASK',
  EMAIL: 'REDACT',
  ADDRESS: 'PSEUDO',
  DATE: 'JITTER',
  CREDIT_CARD: 'MASK',
  SENSITIVE_NUMERIC: 'INDEX',
  AMOUNT: 'BINNING',
  FORMULA_BASE: 'SCALE',
  COMPANY: 'MASK',
};

const ENTITY_COLORS: Record<EntityType, { color: string; bg: string }> = {
  NAME: { color: 'text-blue-700 border-blue-200', bg: 'bg-blue-50' },
  PHONE: { color: 'text-emerald-700 border-emerald-200', bg: 'bg-emerald-50' },
  EMAIL: { color: 'text-purple-700 border-purple-200', bg: 'bg-purple-50' },
  ADDRESS: { color: 'text-amber-700 border-amber-200', bg: 'bg-amber-50' },
  DATE: { color: 'text-pink-700 border-pink-200', bg: 'bg-pink-50' },
  CREDIT_CARD: { color: 'text-rose-700 border-rose-200', bg: 'bg-rose-50' },
  SENSITIVE_NUMERIC: { color: 'text-orange-700 border-orange-200', bg: 'bg-orange-50' },
  AMOUNT: { color: 'text-emerald-700 border-emerald-200', bg: 'bg-emerald-50' },
  FORMULA_BASE: { color: 'text-indigo-700 border-indigo-200', bg: 'bg-indigo-50' },
  COMPANY: { color: 'text-teal-700 border-teal-200', bg: 'bg-teal-50' },
};

const TRANSLATIONS = {
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

export default function ExcelMasker() {
  const [lang, setLang] = useState<'zh' | 'en'>(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const systemLang = window.navigator.language || '';
      if (systemLang.startsWith('en')) {
        return 'en';
      }
    }
    return 'zh';
  });

  const t = TRANSLATIONS[lang];

  const getEntityLabel = (type: EntityType) => {
    return t.entityLabels[type] || type;
  };

  const getOperatorLabel = (op: Operator) => {
    return t.opLabels[op] || op;
  };

  const [session, setSession] = useState<SessionContext>({
    sessionId: Math.random().toString(36).substring(2, 11).toUpperCase(),
    fileName: '',
    fileSize: 0,
    sheets: [],
    currentSheetIndex: 0,
    config: {
      globalOperators: { ...DEFAULT_GLOBAL_OPERATORS },
      columnOverrides: {},
      numericJitterPercent: 10,
      dateJitterDays: 5,
      hashSalt: 'hash-salt-101',
      locale: 'zh_TW',
    },
    state: 'IDLE',
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentSheet = useMemo(() => {
    if (session.sheets.length === 0) return null;
    return session.sheets[session.currentSheetIndex];
  }, [session.sheets, session.currentSheetIndex]);

  // Handle file import
  const processFile = async (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setErrorMsg(t.errorFormat);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg(t.errorSize);
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const sheets = await parseExcelFile(file);
      
      // Initialize columnOverrides map
      const initialOverrides: MaskingConfig['columnOverrides'] = {};
      for (const sheet of sheets) {
        initialOverrides[sheet.name] = {};
        for (const col of sheet.columns) {
          initialOverrides[sheet.name][col.colIndex] = {
            selectedType: col.selectedType,
            selectedOperator: col.selectedOperator,
          };
        }
      }

      setSession(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: file.size,
        sheets,
        currentSheetIndex: 0,
        config: {
          ...prev.config,
          columnOverrides: initialOverrides,
        },
        state: 'PARSED',
      }));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`${t.errorParsing}${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Modify individual column configuration
  const handleColumnTypeChange = (colIndex: number, type: EntityType | 'NONE') => {
    if (!currentSheet) return;

    const currentOverrides = session.config.columnOverrides[currentSheet.name] || {};
    const defaultOperator = type === 'NONE' ? 'NONE' : (session.config.globalOperators[type as EntityType] || 'PSEUDO');

    const updatedOverrides = {
      ...session.config.columnOverrides,
      [currentSheet.name]: {
        ...currentOverrides,
        [colIndex]: {
          selectedType: type,
          selectedOperator: defaultOperator,
        },
      },
    };

    setSession(prev => ({
      ...prev,
      config: {
        ...prev.config,
        columnOverrides: updatedOverrides,
      },
    }));
  };

  const handleColumnOperatorChange = (colIndex: number, op: Operator) => {
    if (!currentSheet) return;

    const currentOverrides = session.config.columnOverrides[currentSheet.name] || {};
    const updatedOverrides = {
      ...session.config.columnOverrides,
      [currentSheet.name]: {
        ...currentOverrides,
        [colIndex]: {
          ...currentOverrides[colIndex],
          selectedOperator: op,
        },
      },
    };

    setSession(prev => ({
      ...prev,
      config: {
        ...prev.config,
        columnOverrides: updatedOverrides,
      },
    }));
  };

  const handleKValueChange = (colIndex: number, val: number) => {
    if (!currentSheet) return;
    const key = `${currentSheet.name}_${colIndex}`;
    setSession(prev => ({
      ...prev,
      config: {
        ...prev.config,
        formulaBaseKValues: {
          ...(prev.config.formulaBaseKValues || {}),
          [key]: val,
        }
      }
    }));
  };

  const handlePercentValueChange = (colIndex: number, val: number) => {
    if (!currentSheet) return;
    const key = `${currentSheet.name}_${colIndex}`;
    setSession(prev => ({
      ...prev,
      config: {
        ...prev.config,
        formulaBaseIndexPercent: {
          ...(prev.config.formulaBaseIndexPercent || {}),
          [key]: val,
        }
      }
    }));
  };

  const handleBinningLevelsChange = (colIndex: number, val: number) => {
    if (!currentSheet) return;
    const key = `${currentSheet.name}_${colIndex}`;
    setSession(prev => ({
      ...prev,
      config: {
        ...prev.config,
        binningLevels: {
          ...(prev.config.binningLevels || {}),
          [key]: val,
        }
      }
    }));
  };

  const handleGlobalOperatorChange = (type: EntityType, op: Operator) => {
    setSession(prev => {
      const updatedGlobals = { ...prev.config.globalOperators, [type]: op };
      
      // Also sync any columns that are using global defaults (i.e. not overrides specifically customized by user)
      const newOverrides = { ...prev.config.columnOverrides };
      for (const sheet of prev.sheets) {
        if (!newOverrides[sheet.name]) continue;
        for (const col of sheet.columns) {
          const colOverride = newOverrides[sheet.name][col.colIndex];
          if (colOverride && colOverride.selectedType === type) {
            colOverride.selectedOperator = op;
          }
        }
      }

      return {
        ...prev,
        config: {
          ...prev.config,
          globalOperators: updatedGlobals,
          columnOverrides: newOverrides,
        },
      };
    });
  };

  // Run masking to transition to Preview State
  const handleApplyMasking = () => {
    setSession(prev => ({ ...prev, state: 'MASKED' }));
  };

  // Regenerate Salt to refresh mock values
  const handleRotateSalt = () => {
    const newSalt = Math.random().toString(36).substring(2, 11).toUpperCase();
    setSession(prev => ({
      ...prev,
      config: {
        ...prev.config,
        hashSalt: newSalt,
      },
    }));
  };

  // Toggle language and update default generation locale
  const handleLanguageToggle = () => {
    const nextLang = lang === 'zh' ? 'en' : 'zh';
    setLang(nextLang);
    setSession(prev => ({
      ...prev,
      config: {
        ...prev.config,
        locale: nextLang === 'en' ? 'en' : 'zh_TW'
      }
    }));
  };

  // Render masked text on preview side
  const getMaskedPreviewValue = (cell: CellModel) => {
    if (!currentSheet) return cell.original;
    if (cell.row === 0) return cell.original; // header row remains unmasked in Excel output

    const sheetOverrides = session.config.columnOverrides[currentSheet.name] || {};
    const colConfig = sheetOverrides[cell.col] || {
      selectedType: currentSheet.columns[cell.col]?.selectedType || 'NONE',
      selectedOperator: currentSheet.columns[cell.col]?.selectedOperator || 'NONE',
    };

    let appliedOperator = colConfig.selectedOperator;
    let selectedType = colConfig.selectedType;

    if (colConfig.selectedType === 'NONE') {
      const detected = cell.detectedType;
      if (detected) {
        appliedOperator = session.config.globalOperators[detected] || 'NONE';
        selectedType = detected;
      } else {
        appliedOperator = 'NONE';
      }
    }

    if (appliedOperator === 'NONE') return cell.original;

    return maskCell(
      cell,
      appliedOperator,
      selectedType !== 'NONE' ? selectedType : cell.detectedType,
      session.config.locale,
      session.config.numericJitterPercent,
      session.config.dateJitterDays,
      session.config.hashSalt,
      currentSheet.cells,
      session.config.formulaBaseKValues,
      session.config.formulaBaseIndexPercent,
      session.config.binningLevels
    );
  };

  // Perform XLSX generation & direct browser trigger
  const handleDownload = () => {
    exportMaskedExcel(session.sheets, session.config, session.fileName);
  };

  const handleDownloadGitHubPagesVersion = () => {
    // Try to trigger direct download of the standalone index.html page
    const directLink = document.createElement('a');
    directLink.href = '/github-pages/index.html';
    directLink.download = 'excel_masker_offline.html';
    document.body.appendChild(directLink);
    directLink.click();
    document.body.removeChild(directLink);
  };

  const handleReset = () => {
    setSession({
      sessionId: Math.random().toString(36).substring(2, 11).toUpperCase(),
      fileName: '',
      fileSize: 0,
      sheets: [],
      currentSheetIndex: 0,
      config: {
        globalOperators: { ...DEFAULT_GLOBAL_OPERATORS },
        columnOverrides: {},
        numericJitterPercent: 10,
        dateJitterDays: 5,
        hashSalt: 'hash-salt-101',
        locale: lang === 'en' ? 'en' : 'zh_TW',
      },
      state: 'IDLE',
    });
    setSearchQuery('');
  };

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="em-app-container">
      {/* Premium Tool Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-6" id="em-header">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight" id="em-app-title">{t.appTitle}</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">{t.appSub}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-4">
          {/* GitHub Pages Version Button */}
          <button
            onClick={handleDownloadGitHubPagesVersion}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 hover:border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 transition-all cursor-pointer shadow-2xs animate-fade-in"
            id="em-btn-gh-pages"
            title={lang === 'zh' ? '下載適用於 GitHub Pages 的獨立 HTML 版本' : 'Download standalone HTML version for GitHub Pages'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? 'GitHub Pages 離線版' : 'GitHub Pages Offline HTML'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-55 border border-gray-200 hover:border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-indigo-600 transition-all cursor-pointer shadow-2xs"
            id="em-btn-lang-toggle"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? 'English' : '繁體中文'}</span>
          </button>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-400 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <div>SESSION: <span className="text-gray-700 font-semibold">{session.sessionId}</span></div>
            <div className="w-px h-3 bg-gray-200"></div>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.sandboxStatus}
            </div>
          </div>
        </div>
      </header>

      {/* Main interactive workflow wrapper */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" id="em-workflow-card">
        {/* Step Wizard Nav indicators */}
        <div className="flex border-b border-gray-100 bg-gray-50/50" id="em-wizard-nav">
          <div className={`flex-1 py-4 px-6 flex items-center gap-2 border-r border-gray-100 text-sm font-medium ${session.state === 'IDLE' ? 'bg-white text-indigo-600 shadow-sm border-b-2 border-b-indigo-600' : 'text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${session.state === 'IDLE' ? 'bg-indigo-600 text-white font-bold' : (session.sheets.length > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500')}`}>
              {session.sheets.length > 0 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span>{t.importStep}</span>
          </div>
          <div className={`flex-1 py-4 px-6 flex items-center gap-2 border-r border-gray-100 text-sm font-medium ${session.state === 'PARSED' ? 'bg-white text-indigo-600 shadow-sm border-b-2 border-b-indigo-600' : 'text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${session.state === 'PARSED' ? 'bg-indigo-600 text-white font-bold' : (session.state === 'MASKED' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500')}`}>
              {session.state === 'MASKED' ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span>{t.configStep}</span>
          </div>
          <div className={`flex-1 py-4 px-6 flex items-center gap-2 border-r border-gray-100 text-sm font-medium ${session.state === 'MASKED' ? 'bg-white text-indigo-600 shadow-sm border-b-2 border-b-indigo-600' : 'text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${session.state === 'MASKED' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-200 text-gray-500'}`}>
              3
            </span>
            <span>{t.auditStep}</span>
          </div>
        </div>

        {/* Dynamic Wizard Steps Panel */}
        <div className="p-6 md:p-8" id="em-step-panel">
          <AnimatePresence mode="wait">
            {/* STEP 1: IDLE - Upload excel file */}
            {session.state === 'IDLE' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                key="step-upload"
                className="space-y-6"
                id="em-upload-step"
              >
                <div className="max-w-xl mx-auto text-center space-y-3">
                  <h2 className="text-xl font-medium text-gray-800 tracking-tight">{t.selectFileTitle}</h2>
                  <p className="text-gray-500 text-sm">
                    {t.selectFileSubPre}<span className="font-semibold font-mono bg-gray-50 px-1 py-0.5 rounded border border-gray-100 text-gray-600">.xlsx</span>, <span className="font-semibold font-mono bg-gray-50 px-1 py-0.5 rounded border border-gray-100 text-gray-600">.xls</span> or <span className="font-semibold font-mono bg-gray-50 px-1 py-0.5 rounded border border-gray-100 text-gray-600">.csv</span>{t.selectFileSubSuf}
                  </p>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`max-w-xl mx-auto border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer ${isDragOver ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50/50'}`}
                  id="em-drag-drop-zone"
                  onClick={() => document.getElementById('em-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="em-file-input"
                    className="hidden"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                  />
                  <div className={`p-4 rounded-full ${isDragOver ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                    {loading ? (
                      <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                    ) : (
                      <Upload className="w-8 h-8" />
                    )}
                  </div>
                  {loading ? (
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-indigo-600">{t.parsingText}</p>
                      <p className="text-xs text-gray-400">{t.parsingSub}</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-gray-700">{t.dragDropText}</p>
                      <p className="text-xs text-gray-400">{t.dragDropSub}</p>
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="max-w-xl mx-auto flex gap-3 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-sm" id="em-upload-error">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {/* Local Sandbox Security Badges */}
                <div className="max-w-2xl mx-auto pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-center" id="em-sandbox-features">
                  <div className="space-y-2">
                    <div className="mx-auto w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Shield className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-700">{t.sandboxTitle}</h3>
                    <p className="text-xxs text-gray-400">{t.sandboxDesc}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="mx-auto w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-700">{t.formulaTitle}</h3>
                    <p className="text-xxs text-gray-400">{t.formulaDesc}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="mx-auto w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-700">{t.fakeTitle}</h3>
                    <p className="text-xxs text-gray-400">{t.fakeDesc}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PARSED - Config column mapping & global strategies */}
            {session.state === 'PARSED' && currentSheet && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                key="step-config"
                className="space-y-8"
                id="em-config-step"
              >
                {/* File Details Summary */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100" id="em-file-summary-strip">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                      <FileSpreadsheet className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 font-mono">{session.fileName}</h4>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {t.fileSize}: {formatBytes(session.fileSize)} | {session.sheets.length} {t.sheetsCount}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-100 bg-white hover:bg-indigo-50/20 transition-all font-medium"
                    id="em-btn-reselect-file"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t.reselectFile}
                  </button>
                </div>

                {/* Multiphase Configurations Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="em-config-grid">
                  {/* Left Column: Global Options & Jitter Parameter Configuration */}
                  <div className="space-y-6 lg:border-r lg:border-gray-100 lg:pr-8" id="em-global-strategy-panel">
                    <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm uppercase tracking-wider">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      <span>{t.globalStrategy}</span>
                    </div>

                    {/* Localization settings */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600 block flex items-center gap-1">
                        <Languages className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t.localeLabel}</span>
                      </label>
                      <select
                        id="em-select-locale"
                        value={session.config.locale}
                        onChange={(e) => setSession(prev => ({ ...prev, config: { ...prev.config, locale: e.target.value as any } }))}
                        className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                      >
                        <option value="zh_TW">{t.locales.zh_TW}</option>
                        <option value="zh_CN">{t.locales.zh_CN}</option>
                        <option value="zh_HK">{t.locales.zh_HK}</option>
                        <option value="en">{t.locales.en}</option>
                      </select>
                      <p className="text-xxs text-gray-400 leading-relaxed">{t.localeDesc}</p>
                    </div>

                    {/* Jitter configs */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <label className="text-xs font-semibold text-gray-600 block flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t.jitterLabel}</span>
                      </label>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xxs font-mono text-gray-500">
                          <span>{t.numericJitterLabel}</span>
                          <span className="text-indigo-600 font-semibold">±{session.config.numericJitterPercent}%</span>
                        </div>
                        <input
                          type="range"
                          id="em-range-jitter-percent"
                          min="1"
                          max="40"
                          value={session.config.numericJitterPercent}
                          onChange={(e) => setSession(prev => ({ ...prev, config: { ...prev.config, numericJitterPercent: Number(e.target.value) } }))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xxs font-mono text-gray-500">
                          <span>{t.dateJitterLabel}</span>
                          <span className="text-indigo-600 font-semibold">±{session.config.dateJitterDays} {t.days}</span>
                        </div>
                        <input
                          type="range"
                          id="em-range-jitter-days"
                          min="1"
                          max="30"
                          value={session.config.dateJitterDays}
                          onChange={(e) => setSession(prev => ({ ...prev, config: { ...prev.config, dateJitterDays: Number(e.target.value) } }))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Global Entity Operators Mapping */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <label className="text-xs font-semibold text-gray-600 block flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t.defaultEntityLabel}</span>
                      </label>
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {(Object.keys(DEFAULT_GLOBAL_OPERATORS) as EntityType[]).map((type) => (
                          <div key={type} className="flex items-center justify-between gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                            <span className="font-medium text-gray-700">{getEntityLabel(type)}</span>
                            <select
                              id={`em-global-op-${type}`}
                              value={session.config.globalOperators[type]}
                              onChange={(e) => handleGlobalOperatorChange(type, e.target.value as Operator)}
                              className="text-xxs bg-white border border-gray-200 rounded px-1.5 py-1 text-gray-600 focus:outline-none"
                            >
                              {(Object.keys(t.opLabels) as Operator[]).map((op) => (
                                <option key={op} value={op}>{getOperatorLabel(op)}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Seed/Salt Configuration */}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-600 block">{t.saltLabel}</label>
                        <button
                          onClick={handleRotateSalt}
                          className="text-xxs text-indigo-600 hover:underline flex items-center gap-0.5"
                          id="em-btn-rotate-salt"
                        >
                          <RefreshCw className="w-3 h-3" />
                          {t.updateSalt}
                        </button>
                      </div>
                      <input
                        type="text"
                        id="em-input-salt"
                        value={session.config.hashSalt}
                        onChange={(e) => setSession(prev => ({ ...prev, config: { ...prev.config, hashSalt: e.target.value } }))}
                        className="w-full text-xs font-mono bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Right Panel: Multiple sheets tabs & column overrides config table */}
                  <div className="lg:col-span-2 space-y-6" id="em-columns-strategy-panel">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm uppercase tracking-wider">
                        <Grid3X3 className="w-4 h-4 text-indigo-500" />
                        <span>{t.sheetConfigTitle}</span>
                      </div>
                      {/* Sheet Switch Tabs */}
                      {session.sheets.length > 1 && (
                        <div className="flex bg-gray-100 p-1 rounded-lg gap-1 self-start" id="em-sheet-tabs">
                          {session.sheets.map((sheet, index) => (
                            <button
                              key={sheet.name}
                              id={`em-sheet-tab-${index}`}
                              onClick={() => setSession(prev => ({ ...prev, currentSheetIndex: index }))}
                              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${session.currentSheetIndex === index ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                              {sheet.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Column Configuration Table */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden" id="em-col-config-table-container">
                      <div className="overflow-x-auto max-h-[480px]">
                        <table className="w-full border-collapse text-left" id="em-col-config-table">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              <th className="py-3 px-4 font-mono">{t.columnHeader}</th>
                              <th className="py-3 px-4">{t.headerNameHeader}</th>
                              <th className="py-3 px-4">{t.detectedTypeHeader}</th>
                              <th className="py-3 px-4">{t.overrideTypeHeader}</th>
                              <th className="py-3 px-4">{t.applyOperatorHeader}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-xs">
                            {currentSheet.columns.map((col) => {
                              const sheetOverrides = session.config.columnOverrides[currentSheet.name] || {};
                              const override = sheetOverrides[col.colIndex] || {
                                selectedType: col.selectedType,
                                selectedOperator: col.selectedOperator,
                              };

                              return (
                                <tr key={col.colIndex} className="hover:bg-gray-50/30 transition-colors">
                                  <td className="py-3.5 px-4 font-mono font-semibold text-gray-400 bg-gray-50/40">
                                    {col.addressLetter}
                                  </td>
                                  <td className="py-3.5 px-4 font-semibold text-gray-800 max-w-[150px] truncate" title={col.headerName}>
                                    {col.headerName}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    {col.detectedType ? (
                                      <span className={`inline-flex px-2 py-1 rounded text-xxs font-semibold border ${ENTITY_COLORS[col.detectedType].color} ${ENTITY_COLORS[col.detectedType].bg}`}>
                                        {getEntityLabel(col.detectedType)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 font-medium">{t.generalData}</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <select
                                      id={`em-override-type-${col.colIndex}`}
                                      value={override.selectedType}
                                      onChange={(e) => handleColumnTypeChange(col.colIndex, e.target.value as EntityType | 'NONE')}
                                      className="bg-white border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                      <option value="NONE">{t.unspecifiedType}</option>
                                      {(Object.keys(DEFAULT_GLOBAL_OPERATORS) as EntityType[]).map((typeKey) => (
                                        <option key={typeKey} value={typeKey}>{getEntityLabel(typeKey)}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="flex flex-col gap-1.5">
                                      <select
                                        id={`em-override-op-${col.colIndex}`}
                                        value={override.selectedOperator}
                                        onChange={(e) => handleColumnOperatorChange(col.colIndex, e.target.value as Operator)}
                                        className={`border rounded px-2 py-1 font-semibold focus:outline-none focus:ring-1 ${override.selectedOperator === 'NONE' ? 'border-gray-200 text-gray-500 bg-white' : 'border-indigo-200 text-indigo-700 bg-indigo-50/30'}`}
                                      >
                                        {(Object.keys(t.opLabels) as Operator[]).map((op) => (
                                          <option key={op} value={op} disabled={override.selectedType === 'NONE' && (op === 'PSEUDO' || op === 'JITTER')}>{getOperatorLabel(op)}</option>
                                        ))}
                                      </select>
                                      
                                      {/* Inline parameters for FORMULA_BASE */}
                                      {(() => {
                                        const isFormulaBase = override.selectedType === 'FORMULA_BASE' || (override.selectedType === 'NONE' && col.detectedType === 'FORMULA_BASE');
                                        if (!isFormulaBase) return null;

                                        // Calculate dynamic k label (k1, k2, k3...)
                                        const formulaBaseCols = currentSheet.columns.filter(c => {
                                          const ov = (session.config.columnOverrides[currentSheet.name] || {})[c.colIndex];
                                          const selType = ov ? ov.selectedType : c.selectedType;
                                          return selType === 'FORMULA_BASE' || (selType === 'NONE' && c.detectedType === 'FORMULA_BASE');
                                        });
                                        const colIndexInFormulaBases = formulaBaseCols.findIndex(c => c.colIndex === col.colIndex);
                                        const kLabel = formulaBaseCols.length > 1 ? `k${colIndexInFormulaBases + 1}` : 'k';

                                        const kKey = `${currentSheet.name}_${col.colIndex}`;
                                        const kValue = (session.config.formulaBaseKValues && session.config.formulaBaseKValues[kKey] !== undefined)
                                          ? session.config.formulaBaseKValues[kKey]
                                          : 1.0;

                                        const pValue = (session.config.formulaBaseIndexPercent && session.config.formulaBaseIndexPercent[kKey] !== undefined)
                                          ? session.config.formulaBaseIndexPercent[kKey]
                                          : 100.0;

                                        if (override.selectedOperator === 'SCALE') {
                                          return (
                                            <div className="flex items-center gap-1.5 text-xxs text-gray-500 bg-amber-50 p-1.5 rounded border border-amber-100 w-fit">
                                              <span className="font-semibold text-amber-700 font-mono">{kLabel} =</span>
                                              <input
                                                type="number"
                                                step="0.01"
                                                className="w-16 bg-white border border-gray-200 rounded px-1.5 py-0.5 text-center text-gray-750 font-mono focus:outline-none focus:border-amber-300 font-semibold"
                                                value={kValue}
                                                onChange={(e) => handleKValueChange(col.colIndex, Number(e.target.value))}
                                              />
                                            </div>
                                          );
                                        }

                                        if (override.selectedOperator === 'INDEX') {
                                          return (
                                            <div className="flex items-center gap-1 text-xxs text-gray-500 bg-indigo-50 p-1.5 rounded border border-indigo-100 w-fit">
                                              <span className="font-semibold text-indigo-700">{lang === 'zh' ? '基數' : 'Base'} =</span>
                                              <input
                                                type="number"
                                                step="1"
                                                className="w-14 bg-white border border-gray-200 rounded px-1 py-0.5 text-center text-gray-700 font-mono focus:outline-none focus:border-indigo-300 font-semibold"
                                                value={pValue}
                                                onChange={(e) => handlePercentValueChange(col.colIndex, Number(e.target.value))}
                                              />
                                              <span className="font-mono">%</span>
                                            </div>
                                          );
                                        }

                                        if (override.selectedOperator === 'BINNING') {
                                          const bKey = `${currentSheet.name}_${col.colIndex}`;
                                          const levelsValue = (session.config.binningLevels && session.config.binningLevels[bKey] !== undefined)
                                            ? session.config.binningLevels[bKey]
                                            : 5;
                                          return (
                                            <div className="flex items-center gap-1.5 text-xxs text-gray-500 bg-emerald-50 p-1.5 rounded border border-emerald-100 w-fit">
                                              <span className="font-semibold text-emerald-700">{t.binningLevelsLabel} =</span>
                                              <input
                                                type="number"
                                                min="2"
                                                max="100"
                                                step="1"
                                                className="w-14 bg-white border border-gray-200 rounded px-1.5 py-0.5 text-center text-gray-750 font-mono focus:outline-none focus:border-emerald-300 font-semibold"
                                                value={levelsValue}
                                                onChange={(e) => handleBinningLevelsChange(col.colIndex, Math.max(2, Number(e.target.value)))}
                                              />
                                            </div>
                                          );
                                        }

                                        return null;
                                      })()}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apply button to trigger preview */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between" id="em-step2-footer">
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>{t.applyFooterInfo}</span>
                  </div>
                  <button
                    onClick={handleApplyMasking}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                    id="em-btn-apply-masking"
                  >
                    <span>{t.applyButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: MASKED - Real-time Preview audit & download options */}
            {session.state === 'MASKED' && currentSheet && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                key="step-preview"
                className="space-y-6"
                id="em-preview-step"
              >
                {/* Search, Sheet Tabs and Action Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-4" id="em-preview-actions-header">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSession(prev => ({ ...prev, state: 'PARSED' }))}
                      className="p-2 border border-gray-200 hover:border-indigo-100 hover:bg-indigo-50/20 text-gray-500 hover:text-indigo-600 rounded-lg transition-all cursor-pointer"
                      id="em-btn-back-to-config"
                      title={t.adjustStrategy}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{t.previewTitle}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{t.previewSub}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Sheet Tabs */}
                    {session.sheets.length > 1 && (
                      <div className="flex bg-gray-100 p-1 rounded-lg gap-1 text-xs" id="em-preview-tabs">
                        {session.sheets.map((sheet, index) => (
                          <button
                            key={sheet.name}
                            id={`em-preview-tab-${index}`}
                            onClick={() => setSession(prev => ({ ...prev, currentSheetIndex: index }))}
                            className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${session.currentSheetIndex === index ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
                          >
                            {sheet.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        id="em-input-search-query"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="text-xs bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 focus:border-indigo-300 rounded-lg pl-9 pr-4 py-2 w-48 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Audit Grid View (Original vs Masked) */}
                <div className="border border-gray-200 rounded-xl overflow-hidden" id="em-audit-grid-container">
                  <div className="overflow-x-auto max-h-[480px]">
                    <table className="w-full border-collapse text-left text-xs" id="em-audit-table">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="py-3 px-4 font-mono w-16">{t.cellHeader}</th>
                          <th className="py-3 px-6">{t.originalHeader}</th>
                          <th className="py-3 px-6">{t.maskedHeader}</th>
                          <th className="py-3 px-4 w-32">{t.statusHeader}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentSheet.cells
                          .filter(cell => {
                            if (!searchQuery) return true;
                            return cell.original.toLowerCase().includes(searchQuery.toLowerCase());
                          })
                          .slice(0, 200) // Render top 200 for lightning fast performance
                          .map((cell) => {
                            const maskedVal = getMaskedPreviewValue(cell);
                            const isChanged = cell.row > 0 && maskedVal !== cell.original;

                            return (
                              <tr key={cell.address} className={`hover:bg-gray-55/30 transition-colors ${isChanged ? 'bg-emerald-50/5' : ''}`}>
                                <td className="py-3 px-4 font-mono font-bold text-gray-400 bg-gray-50/20">
                                  {cell.address}
                                </td>
                                <td className="py-3 px-6 text-gray-600 font-mono select-all">
                                  {cell.formula ? (
                                    <span className="text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded text-xxs font-semibold">
                                      {t.fx}: {cell.formula}
                                    </span>
                                  ) : (
                                    cell.original || <span className="text-gray-300 italic">{t.emptyCell}</span>
                                  )}
                                </td>
                                <td className="py-3 px-6 font-mono font-medium text-gray-900 select-all">
                                  {cell.formula ? (
                                    <span className="text-purple-600 font-semibold flex items-center gap-1">
                                      <span>[{t.formulaIndicator}]</span>
                                    </span>
                                  ) : (
                                    maskedVal || <span className="text-gray-300 italic">{t.emptyCell}</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {cell.row === 0 ? (
                                    <span className="text-gray-400 text-xxs font-semibold">{t.headerRow}</span>
                                  ) : cell.formula ? (
                                    <span className="text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded text-xxs font-semibold flex items-center gap-1 w-max">
                                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                      {t.formulaRecalc}
                                    </span>
                                  ) : isChanged ? (
                                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-xxs font-semibold flex items-center gap-1 w-max">
                                      <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                                      {t.maskedSuccess}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-xxs">{t.noChange}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        {currentSheet.cells.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-gray-400">
                              {t.emptySheet}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex justify-between items-center text-xs text-gray-500 font-mono">
                    <span>{t.viewTopRows} ({t.totalCells.replace('{count}', String(currentSheet.cells.length))})</span>
                    <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded font-semibold text-xxs">
                      <Eye className="w-3.5 h-3.5" />
                      {t.allLocalWarning}
                    </span>
                  </div>
                </div>

                {/* Audit summary panel */}
                <div className="flex flex-col md:flex-row items-stretch gap-6 md:justify-between pt-6 border-t border-gray-100" id="em-step3-footer">
                  <div className="flex gap-3 max-w-xl p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg text-indigo-800 text-xs leading-relaxed">
                    <Info className="w-4 h-4 flex-shrink-0 text-indigo-500 mt-0.5" />
                    <div>
                      <h5 className="font-semibold mb-1">{t.qualityInfoTitle}</h5>
                      {t.qualityInfoDesc}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 self-end md:self-center">
                    <button
                      onClick={() => setSession(prev => ({ ...prev, state: 'PARSED' }))}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-indigo-100 bg-white hover:bg-indigo-50/20 transition-all font-medium cursor-pointer"
                      id="em-btn-adjust-strategy"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t.adjustStrategy}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                      id="em-btn-download-file"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t.downloadButton}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer style={{ textAlign: "center", marginTop: "50px", padding: "20px 0", color: "#7f8c8d", fontSize: "13px", borderTop: "1px solid #e0e0e0" }}>
        <p style={{ marginBottom: "8px" }}>© 2026 Lang Choy. Licensed under the MIT License.</p>
        <p style={{ fontWeight: 500, color: "#27ae60", marginBottom: "12px" }}>🛡️ Built for absolute data privacy.</p>
        <p>
          Interested in this project? 
          <a href="https://www.linkedin.com/in/langchoy1222/" target="_blank" rel="noreferrer" style={{ color: "#0077b5", textDecoration: "none", fontWeight: "bold", marginLeft: "5px" }}>
            🔗 Connect me on LinkedIn
          </a>
        </p>
      </footer>
    </div>
  );
}

# Excel Masking Tool (Excel 脱敏工具)

An objective, production-ready, pure-frontend Markdown guide explaining the operational mechanics, security architecture, and step-by-step workflows of the local Excel Masking Tool.

---

## 1. What is Data Masking?

**Data Masking** is a security control process that replaces personally identifiable information (PII)—such as names, phone numbers, email addresses, street addresses, dates, and credit card numbers—with realistic but non-reversible synthetic values. 

The primary objective is to preserve the structural integrity and semantic utility of the datasets for demonstration, validation, software testing, and pedagogical scenarios while systematically eliminating the risk of data leakage.

*   **Format-Preserving Realism:** Input formats remain consistent post-masking (e.g., `John Doe` converts to `Robert Smith`, retaining full linguistic context; a standard 11-digit mobile phone number is mapped to an alternate 11-digit structure that does not map to an active subscriber).
*   **Irreversibility:** The system transforms raw records into synthetic equivalents without exposing the source identity.

---

## 2. Security Architecture & Controls

This section provides an objective breakdown of the security design principles and structural controls implemented in the tool to ensure absolute data privacy.

### 2.1 Local Runtime and Zero Inbound/Outbound Network I/O
*   **Client-Side Execution:** The utility functions strictly as a single-file static HTML application executed entirely inside the local browser runtime environment.
*   **In-Memory Processing:** Selected Excel/CSV workbooks are parsed directly via the browser's native `FileReader` API into volatile local memory. The complete data transformation pipeline executes locally within a single browser thread.
*   **Zero Server Footprint:** The architecture contains no server backends, external database connections, authentication layers, or file upload components. Data vectors never traverse a network.
*   **Verification Protocol:** Security auditors can verify compliance by inspecting the **Network Panel** via Browser Developer Tools (F12). Upon performing the ingestion, configuration, and download phases, no `POST`, `PUT`, or upstream upload events will be initiated. All external traffic is constrained to initial static CDN asset fetches.

### 2.2 Unidirectional Pseudo-Value Generation
*   **Dictionary-Driven Synthesis:** Token substitution relies on dictionary maps paired with a deterministic pseudo-random number generator (PRNG). It does not employ symmetric or asymmetric encryption models.
*   **No Persistence:** The tool operates statelessly. It does not construct, cache, or maintain an internal mapping table (`Original Value ↔ Masked Value`), nor does it leverage a master server key. 
*   **Cryptographic Impossibility:** Because mappings are generated through one-way mathematical expansions, exposing the masked spreadsheet yields zero statistical channels for reverse engineering the original data.

### 2.3 Formula Preservation and Value Disassociation
*   **Semantic Preservation:** When parsing cell dependencies that contain standard formulas (e.g., `=SUM(A1:B1)`), the engine leaves the mathematical formula tokens untouched. Only the pre-computed evaluation cached within the sheet cell structure is masked.
*   **Independent Re-evaluation:** Upon opening the exported document within a spreadsheet reader (e.g., Microsoft Excel, LibreOffice), the application dynamically recalculates cell hierarchies based on the newly synthesized values. 
*   **Complete Sanitization:** Raw underlying sensitive vectors are physically stripped and replaced in the output stream, ensuring that stale metadata or historical privacy artifacts are completely expunged.

### 2.4 Deterministic Salting Mechanics
*   **The Role of Salt:** The configurable `Salt` parameter does not behave as an encryption key. It serves as a cryptographic seed modifier to ensure **mapping determinism** (idempotency).
*   **Consistency Across Columns:** If `Salt` equals `XYZ`, an input instance like `John Doe` will consistently map to the identical pseudonym `Robert Smith` across multiple rows, preserving relational data integrity and joins.
*   **Key Rotation:** Modifying or rotating the `Salt` completely alters the pseudo-random distribution array, generating a completely distinct, unlinked matrix of synthetic values. The salt provides structural consistency rather than confidentiality.

### 2.5 Subresource Integrity (SRI) Validations
*   **Static Asset Safeguards:** The interface relies on three remote web assets fetched via CDN: Tailwind CSS, SheetJS (`xlsx.full.min.js`), and the Lucide Icon library.
*   **Supply-Chain Mitigation:** Each asset deployment is strictly hardened via script tags containing `integrity="sha256-..."` and `crossorigin="anonymous"`. The browser hashes downloaded payloads on-the-fly and blocks execution immediately if any character variation is detected, mitigating upstream CDN compromise.
*   **Network Dependency:** While initial page loading requires external connectivity to download these layout and processing frameworks, the subsequent data processing flow remains 100% offline.

---

## 3. Operations & User Workflow

The user interface utilizes a linear three-step progressive wizard that manages ingestion, policy enforcement, and final asset synthesis.

```
[ Step 1: Ingest ] ──> [ Step 2: Configure ] ──> [ Step 3: Export ]
Local File Parsing     Rule Matrix Overrides     Blob Output Generation
```

### Step 1: Data Ingestion
1. Launch `index.html` within a compliant web browser (either locally via `file://` or hosted on an internal static web server).
2. Interact with the drag-and-drop landing target to stage target `.xlsx`, `.xls`, or `.csv` source material.
3. The internal file wrapper constrains document boundaries to a safe **20MB memory threshold**. The content is translated into an internal memory grid without triggering external processes.

### Step 2: Policy Configuration
1. The system executes an initial analysis sweep to automatically classify the data type of each column based on header metadata and string matching algorithms. It maps columns to default operational handlers (see Section 4).
2. Users can dynamically configure the execution parameters through the UI:
   * **Locale Switching:** Alter pseudonym dictionaries between diverse localized outputs (e.g., Chinese/English).
   * **Variance Multipliers:** Adjust numerical jitter thresholds (`±N%`) and date range deltas (days).
   * **Seed Modification:** Define or randomly cycle the `Salt` token.
   * **Granular Rule Overrides:** Explicitly override individual columns to swap masking strategies or declare a column as `NONE` (bypassing processing).
3. A real-time viewport refreshes on modification, demonstrating the resulting transformations immediately.

### Step 3: Reconciliation and Export
1. The reconciliation viewport renders a side-by-side comparative table charting the original raw rows against their masked counterparts for the first 200 data points.
2. Filter controls permit testing across structural edges.
3. Clicking the export action converts the finalized structures into an immutable byte stream using the browser’s `Blob` constructor combined with `URL.createObjectURL`.
4. The web runtime triggers a local file download, appending a `_masked` suffix to the original file name (e.g., `audit_report_masked.xlsx`).

---

## 4. Sensitive Data Classification Matrix

The runtime categorizes recognized columns into specific profiles, binding them to a default mathematical or programmatic transform operator.

| Data Type | Default Operator | Functional Execution |
| :--- | :--- | :--- |
| `NAME` | `PSEUDO` | Maps inputs to structural pseudonyms matching target locales. |
| `EMAIL` | `REDACT` | Overwrites the string signature entirely with static suppression tags. |
| `ADDRESS` | `PSEUDO` | Translates spatial strings into non-existent realistic physical paths. |
| `DATE` | `JITTER` | Offsets chronological variables randomly within bounded time horizons. |
| `SENSITIVE_NUMERIC` | `INDEX` | Normalizes values into relative index ratios, masking baseline amounts. |
| `AMOUNT` | `BINNING` | Aggregates precise financial values into discrete, generalized intervals. |
| `FORMULA_BASE` | `SCALE` | Performs uniform scaling across source data using a concealed factor. |

*Note: Extended pattern matching handles sensitive identifiers such as credit card configurations, structural corporate codes, and telecommunication vectors, which can be modified via user policy overrides.*

---

## 5. Masking Operator Specifications

The core engine implements 8 distinct mathematical and tokenization operators to control data degradation.

### 5.1 `PSEUDO` (Pseudonymization)
Generates high-fidelity, structurally compliant fake entities using a seed-derived index loop mapped against local dictionary records. Ensures that recurring strings yield identical, valid-looking synthetics for uniform column tracking.

### 5.2 `REDACT` (Suppression)
Completely purges the source data vector, populating the target string uniformly with a hardcoded `[REDACTED]` token. Used when underlying data holds zero analytical value for secondary workflows.

### 5.3 `HASH` (Anonymization via Digesting)
Computes a standard SHA-256 digest of the combined input values:
$$	ext{Output} = 	ext{SHA-256}(	ext{Raw Value} + 	ext{Salt})$$
Produces a fixed-length hexadecimal hash. This ensures irreversible records while allowing data analysts to perform deterministic data joins and exact-match lookups across separate datasets.

### 5.4 `JITTER` (Numerical Noise Injection)
Introduces controlled random variance to continuous variables. It perturbs numerical targets within a bounded proportional window:
$$	ext{Output} = 	ext{Raw Value} 	imes (1 + \epsilon), \quad \epsilon \in [-N\%, +N\%]$$
Preserves broad macroscopic statistical distributions while fuzzing discrete transaction items.

### 5.5 `BINNING` (Interval Aggregation)
Suppresses fine-grained values by bucketizing continuous quantitative fields into predefined, distinct category buckets (e.g., transforming an exact income metric into an inclusive bracket like `[10,000 - 20,000]`).

### 5.6 `INDEX` (Normalization & Indexing)
Transforms absolute numerical scales into relative percentages or normalized indexes against a specific column benchmark. This maintains directional scaling trends and magnitude comparisons while removing raw scalar values.

### 5.7 `SCALE` (Homogeneous Scaling)
Multiplies target numeric arrays by a single fixed scalar variable across the entire column vector. This maintains the exact proportional ratios and standard deviations of the distribution while shifting the baseline scale.

### 5.8 `NONE` (Passthrough)
Bypasses the masking pipeline entirely. The cell value passes to the output buffer unmodified, preserving non-sensitive operational columns.

---

## 6. Architecture & Data Flow

The utility is structured as an decoupled, multi-tier frontend engine operating inside the single-page application framework.

```
┌────────────────────────────────────────────────────────┐
│  1. Ingestion Layer                                    │
│     Extracts file streams using local FileReader       │
├────────────────────────────────────────────────────────┤
│  2. Parsing Layer                                      │
│     Isolates cell.f structures and metadata via SheetJS │
├────────────────────────────────────────────────────────┤
│  3. Classification Layer                               │
│     Heuristic matching using headers and regex tests   │
├────────────────────────────────────────────────────────┤
│  4. Mapping Matrix                                     │
│     Merges structural configurations & explicit rules  │
├────────────────────────────────────────────────────────┤
│  5. Operator Runtime                                   │
│     Executes Seeded PRNG, SHA-256, and math scales    │
├────────────────────────────────────────────────────────┤
│  6. Presentation & Export Layer                         │
│     Compiles output sheets to native Blob download     │
└────────────────────────────────────────────────────────┘
```

### Core Pipeline Mechanics
*   **Seeded PRNG Foundations:** The engine substitutes true random numbers with a deterministic Pseudo-Random Number Generator. By pinning the generation seed to a combination of the raw input text and the user-defined `Salt`, matching outputs are consistently reproduced across sessions.
*   **Formula Isolation Management:** During spreadsheet reconstruction, when an active formula cell is processed, the processor maps the string expression directly to the target output descriptor (`cellObj.f = sourceFormula`), while resetting the pre-calculated value descriptor (`cellObj.v = undefined`). This forces the spreadsheet engine to recompute the values upon opening.
*   **Offline Data Serialization:** The workbook is translated back into raw binary buffers using `XLSX.write`. This stream is converted directly into a browser application asset, avoiding any exposure to public networks.

---

## 7. Frequently Asked Questions (FAQ)

#### Q1: Are any records transmitted to remote servers?
**No.** The tool has zero network outbound hooks. All ingestion, normalization, and generation processes take place exclusively in the volatile memory space allocated to the active browser tab.

#### Q2: Can a masked file be reversed to reveal original data?
**No.** Because the application relies on one-way tokenization, noise addition, and suppression patterns rather than encryption, there is no structural mechanism or key file that can decode or reconstruct the original values.

#### Q3: Does the Salt value require strict administrative security?
**No.** The salt is used solely as a configuration seed to ensure identical inputs yield identical pseudonyms. It does not act as a secret decryption key; exposing it does not give an attacker the ability to reverse-engineer the masked outputs.

#### Q4: Will standard workbook cross-sheet formulas break?
**No.** The underlying syntax maps perfectly to the export target. Formulas update automatically relative to the newly modified synthetic variables upon initialization in Excel.

#### Q5: What are the maximum file limits?
The tool officially supports `.xlsx`, `.xls`, and `.csv` configurations up to a standard baseline of **20MB**.

---

## 8. Technical Constraints & Security Considerations

*   **Initialization Requirements:** The application requires active network access during the initial page bootstrap phase to retrieve the CDN-hosted Tailwind, SheetJS, and Lucide frameworks. For environment configurations requiring an absolute air-gapped setup, developers must pre-compile these dependencies locally using an asset bundler (e.g., Vite) alongside custom SRI injection configurations.
*   **SheetJS Library Notice:** The tool relies on `xlsx@0.18.5`. Security teams should note that this specific version profile contains documented historical ecosystem notices regarding Prototype Pollution and Regular Expression Denial of Service (ReDoS) vulnerabilities. Because the application runs entirely client-side on data files explicitly selected by the end-user, the practical exploit vectors are highly constrained. However, enterprise compliance architectures should monitor these dependencies or swap in hardened forks as required by internal policies.
*   **Heuristic Matching Thresholds:** The structural classification system depends on regex profiling and common header patterns. It cannot guarantee 100% precision across irregular or unstructured data schemas. Regular manual review of the reconciliation preview pane is strongly recommended before exporting critical enterprise data.

---

## License

This software utility is distributed under the terms of the **MIT License**. Permission is hereby granted to modify, distribute, and utilize the framework for internal operations, product testing, and training environments.

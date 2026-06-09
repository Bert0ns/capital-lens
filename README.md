# ETF Portfolio Analyzer & Dashboard

## 1. Project Overview

The goal is to develop an interactive web application, running entirely client-side, for the analysis and visualization of a custom ETF portfolio. The app will allow the user to upload official CSV files from issuers (iShares, Vanguard, Amundi, Lyxor, etc.), assign custom weights to each ETF, and view aggregated metrics in real-time.

## 2. Tech Stack

- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts Library:** Recharts (or Chart.js)
- **CSV Parsing:** PapaParse
- **Storage:** LocalStorage (no database or backend required)

## 3. Architecture (Client-Side "All-in-One")

The architecture must be 100% serverless/client-side. CSV processing will happen entirely in the user's browser.

1.  The user uploads CSV files and enters metadata.
2.  The files are parsed in memory and normalized into a standard data structure via PapaParse.
3.  The normalized data and portfolio configuration are saved in the browser's `localStorage`.
4.  The interface reads from state and renders charts, reacting reactively to weight changes (sliders).

## 4. Core Functional Requirements

### 4.1. ETF Management (Upload & Ingestion)

The user must be able to add new ETFs via a form containing:

- **ETF Name / Ticker** (Text).
- **Issuer** (Dropdown: iShares, Vanguard, Amundi, Lyxor). _Crucial for directing the correct parsing logic for the CSV structure._
- **TER (Total Expense Ratio)** (Numeric input, e.g., 0.22).
- **File Upload** (Selection of the holdings CSV file).

### 4.2. Data Normalization (Parsing)

Issuer CSVs vary in structure and nomenclature. The parser must extract and map data to a common TypeScript interface:

```typescript
interface Holding {
  ticker: string;
  name: string;
  weight: number; // Weight of the company within the single ETF (%)
  sector: string;
  country: string;
  currency: string;
}
```

### 4.3. Dashboard and Interactive Controls

- **Global Weight Slider:** Each entered ETF will have a slider (from 0% to 100%) to define its weight within the overall portfolio.
- **Validation Control:** The UI must clearly show if the sum of all ETF weights reaches 100%. If not, it must warn the user (e.g., red/green progress bar).
- **Reactivity:** Modifying a slider must trigger immediate recalculation of exposures via `useMemo` or `useEffect`.

### 4.4. Visualizations and Charts

The dashboard must show the following aggregations, calculated by multiplying the individual company's weight by the ETF's global weight in the portfolio:

1. **Geographic Exposure:** Pie or bar chart (Top aggregated Countries).
2. **Sector Exposure:** Pie or bar chart.
3. **Currency Exposure:** Pie chart (Euro, USD, Yen, etc.).
4. **Total Portfolio Cost (Weighted Average TER):** A highlighted Card/KPI.
5. **Top 10 Companies:** Table or horizontal bar chart. Must correctly aggregate companies present in multiple ETFs (e.g., crossing Apple from an S&P500 ETF and an MSCI World ETF by summing their weights).

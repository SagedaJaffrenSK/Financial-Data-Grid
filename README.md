# ◈ FinGrid — High-Performance Financial Data Grid

A production-grade virtualized data grid capable of rendering **1,000,000 financial transaction records** with smooth scrolling and minimal DOM usage.

This project demonstrates **large dataset rendering, DOM performance optimization, and virtualization techniques** commonly used in enterprise applications such as financial dashboards, analytics platforms, and trading terminals.

---

#  Live Features

*  **Virtualized Rendering** – Handles 1 million rows while rendering only ~30–50 DOM elements.
*  **Sorting** – Click any column header to sort ascending or descending.
*  **Filtering** – Filter transactions by merchant name (debounced input).
*  **Status Filters** – Quick filter buttons for `Completed`, `Pending`, and `Failed`.
*  **Inline Cell Editing** – Double-click any editable cell to modify its value.
*  **Column Pinning** – Pin important columns (ID and Date) during horizontal scrolling.
*  **Row Selection** – Single-click or Ctrl/Cmd multi-select rows.
*  **Debug Performance Panel** – Displays real-time FPS, rendered rows, and scroll position.
*  **Dockerized Deployment** – Application runs using a single `docker-compose up` command.

---

#  Problem Solved

Rendering **1 million rows directly in the DOM** causes:

* High memory consumption
* Slow rendering
* Browser crashes

This project solves the problem using **virtual scrolling (windowing)**.

Instead of rendering all rows, only the rows currently visible in the viewport are rendered.

Typical DOM usage:

| Dataset Size   | DOM Elements |
| -------------- | ------------ |
| 1,000,000 rows | ~30–50 rows  |

This keeps performance **fast and consistent regardless of dataset size**.

---

#  Architecture Overview

The grid uses three main elements:

### 1️ Scroll Container

A container with:

```
overflow-y: scroll
```

This acts as the viewport.

---

### 2️ Sizer Element

A hidden element that simulates the full height of the dataset.

```
totalHeight = totalRows × rowHeight
```

Example:

```
1,000,000 rows × 40px = 40,000,000px
```

This creates the correct scrollbar.

---

### 3️ Window Element

Only the visible rows are rendered here.

Positioning is controlled using:

```
transform: translateY(scrollPosition)
```

This is GPU accelerated and ensures smooth scrolling.

---

#  Virtualization Logic

Visible rows are calculated from the scroll position:

```
startIndex = floor(scrollTop / rowHeight)
endIndex   = startIndex + visibleRows + buffer
```

Rendered rows:

```
dataset.slice(startIndex, endIndex)
```

This ensures:

* Constant DOM size
* Smooth 60 FPS scrolling
* Efficient memory usage

---

#  Dataset Generation

The dataset is generated using a Node.js script.

Run:

```
npm run generate-data
```

This generates:

```
public/transactions.json
```

Dataset size:

```
1,000,000 financial transactions
```

Each record contains:

```
{
  id: number,
  date: string (ISO),
  merchant: string,
  category: string,
  amount: number,
  status: "Completed" | "Pending" | "Failed",
  description: string
}
```

---

#  Running with Docker

The easiest way to run the project.

### 1️ Install dependencies

```
npm install
```

### 2️ Generate dataset

```
npm run generate-data
```

### 3️ Start application

```
docker-compose up --build
```

Open in browser:

```
http://localhost:8080
```

---

#  Running in Development Mode

If you want to run the project without Docker:

```
npm install
npm run generate-data
npm run dev
```

Open:

```
http://localhost:3000
```

---

#  Performance Metrics

Typical performance results:

| Metric            | Result         |
| ----------------- | -------------- |
| Initial render    | < 100 ms       |
| Scroll FPS        | 55–60 FPS      |
| DOM rows rendered | ~30–50         |
| Dataset size      | 1,000,000 rows |

---

#  Key Performance Techniques

### Virtual Scrolling

Only visible rows are rendered.

### requestAnimationFrame

Scroll updates are synced with the browser render cycle.

### GPU-Accelerated Positioning

Using:

```
transform: translateY()
```

instead of `top`.

### Debounced Filtering

Filtering waits before executing to avoid repeated heavy computations.

### Fixed Row Height

Allows instant index calculations.

---

# 🧪 Debug Panel

A floating debug panel displays:

* FPS
* DOM rows rendered
* Scroll position
* Total dataset size

This helps verify that virtualization works correctly.

---

#  Environment Variables

See `.env.example` for configuration.

Example:

```
VITE_ROW_HEIGHT=40
VITE_BUFFER_ROWS=10
VITE_TRANSACTIONS_PATH=/transactions.json
```

---

#  Technologies Used

* React
* JavaScript
* CSS
* Vite
* Docker
* Nginx

---

#  License

- MIT License

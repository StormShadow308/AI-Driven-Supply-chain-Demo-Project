# chainsight-supply-chain-analytics

A full-stack web application for supply chain and Amazon review analytics. This project provides a user-friendly interface built with React and TypeScript for visualizing insights from your data. The powerful Python Flask backend handles data processing, including CSV uploads for sales and review data. It performs comprehensive analysis such as sentiment analysis, topic modeling, keyword extraction, and review summarization, with optional LLM (Ollama) integration for advanced natural language querying and enhanced analytical capabilities. Visualize trends, understand customer feedback, and gain actionable insights from your supply chain and review datasets.

## Features

- **Data Upload:** Upload CSV files containing sales or Amazon review data.
- **Comprehensive Analysis:**
  - Sentiment Analysis (VADER & optional LLM)
  - Topic Modeling
  - Keyword & Key Phrase Extraction
  - Review Summarization (Statistical & optional LLM)
  - Summary Statistics
- **Interactive Visualizations:** Bar charts, histograms, word clouds, pie charts.
- **LLM Integration:** Utilize Ollama (if available) for natural language querying and enhanced analysis.
- **Firebase Integration:** User authentication and potentially other backend services.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Chart.js, Lucide React Icons
- **Backend:** Python, Flask
- **Database/Auth:** Firebase
- **LLM (Optional):** Ollama

## Project Structure

```
/
├── api/                  # Backend Flask application
│   ├── app.py            # Main Flask app file
│   └── requirements.txt  # Backend dependencies
├── project/              # Frontend React application
│   ├── src/              # Frontend source code
│   └── package.json      # Frontend dependencies and scripts
├── src/                  # Common source files (if any, structure seems mixed)
└── README.md             # This file
```

_(Note: Project structure based on initial information, might need refinement)_

## Setup and Installation

### Backend (API)

1.  **Navigate to the API directory:**
    ```bash
    cd api
    ```
2.  **Install dependencies:**
    _(Ensure you have Python and pip installed)_
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run the Flask server:**
    ```bash
    python app.py
    ```
    The API will be running at `http://localhost:5000` by default.

### Frontend (Project)

1.  **Navigate to the project directory:**
    ```bash
    cd project
    ```
2.  **Install dependencies:**
    _(Ensure you have Node.js and npm/yarn installed)_
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The frontend application will be accessible, usually at `http://localhost:5173` (Vite's default).

## Usage

1.  Ensure both the backend API and frontend development server are running.
2.  Open the frontend application in your browser (e.g., `http://localhost:5173`).
3.  Use the interface to:
    - Upload your sales or review CSV files.
    - Explore the generated analyses and visualizations.
    - Use the natural language query features (if LLM is configured).

_(Refer to `api/README.md` for details on required CSV formats and specific API endpoints if needed.)_

## Data Format

The application accepts three types of CSV data:

### Sales Data

CSV with columns:

- `transaction_id`
- `timestamp`
- `customer_id`
- `product_id`
- `product_name`
- `category`
- `quantity`
- `price`
- `discount`
- `payment_method`
- `customer_age`
- `customer_gender`
- `customer_location`
- `total_amount`

### Inventory Data

CSV with columns:

- `date`
- `store_id`
- `product_id`
- `category`
- `region`
- `inventory_level`
- `units_sold`
- `units_ordered`
- `demand_forecast`
- `price`
- `discount`
- `weather_condition`
- `holiday`
- `competitor_price`
- `seasonality`

### Review Data

CSV with columns:

- `asin`
- `review_text`
- `overall`
- `category`
- `summary`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

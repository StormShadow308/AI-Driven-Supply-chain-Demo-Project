# Software Manual: Supply Chain Insights Dashboard

This document provides a comprehensive overview of the Supply Chain Insights Dashboard application, covering its architecture, technology stack, setup, usage, and maintenance.

## 1. Project Overview

### Purpose and High-Level Goals

The Supply Chain Insights Dashboard aims to provide users with a powerful tool to upload, analyze, and visualize supply chain data, specifically focusing on sales and product review information. The primary goal is to empower businesses to gain actionable insights from their data, identify trends, understand customer sentiment, and make informed decisions regarding their supply chain operations and product strategies.

### Key Features

-   **Data Upload:** Supports uploading sales and review data in CSV and potentially other formats (Excel).
-   **Sales Analysis:** Comprehensive analysis of sales data, including trends, grouping by features (e.g., product, region), and AI-driven insights via natural language queries.
-   **Review Analysis:** In-depth analysis of customer reviews, including sentiment analysis, topic modeling, word clouds, rating distribution, and AI-driven summaries and querying.
-   **Data Visualization:** Interactive charts and graphs to visualize sales trends, review sentiment, topic distributions, and other key metrics.
-   **AI-Powered Insights:** Utilizes custom Python scripts leveraging libraries like NLTK, Scikit-learn, etc., for both sales and review data to answer user queries and provide deeper analysis.
-   **Comparison View:** Allows comparing different datasets or analysis results.

### Target Users

-   Supply Chain Managers
-   Business Analysts
-   Product Managers
-   Data Scientists
-   Executives seeking high-level performance overviews

## 2. Architecture & Components

The application follows a client-server architecture:

-   **Frontend (Client):** A web-based user interface built with React and TypeScript.
-   **Backend (Server):** A Python API built with Flask, responsible for data processing, analysis, and serving data to the frontend.

### System Diagram (Conceptual)

```
+---------------------+        +-----------------------+        +----------------------+
|   React Frontend    | <----->|     Flask Backend API   | <----->|      Data Files      |
| (src/, public/)     |        |       (api/)          |        | (uploads/, .csv, etc)|
+---------------------+        +-----------------------+        +----------------------+
        |                                |                                |
        | User Interactions              | API Requests/Responses         | Data Storage/Retrieval |
        | (Uploads, Queries)           | (JSON)                         |                      |
        |                                |                                |
        |                                +-------+ AI/NLP Logic +-----+   |
        |                                | (NLTK, Scikit-learn, etc.) |   |
        |                                +----------------------------+   |
```

### Component Interaction

1.  **User Interaction:** The user interacts with the React frontend in their browser.
2.  **Data Upload:** The user uploads CSV files (sales, reviews) via the frontend UI.
3.  **API Request (Upload):** The frontend sends the file(s) to the Flask backend API (`/api/upload`).
4.  **Backend Processing (Upload):** The Flask backend saves the uploaded files to the `uploads/` directory.
5.  **API Request (Analysis):** The user initiates an analysis (e.g., views sales analytics, queries an AI agent) through the frontend.
The frontend sends a request to the relevant backend API endpoint (e.g., `/api/analyze/sales`, `/api/query/reviews`).
6.  **Backend Processing (Analysis):**
    -   The Flask backend loads the relevant data file(s) using Pandas.
    -   It performs the requested analysis (e.g., trend calculation, sentiment analysis, topic modeling) using libraries like Pandas, NumPy, NLTK, Scikit-learn, etc.
    -   For AI queries, it utilizes custom logic within the agent scripts (`sales_AI_Agent.py`, `review_AI_Agent.py`) employing libraries like NLTK, Scikit-learn, etc.
    -   It generates results, which might include JSON data, analysis summaries, or paths to generated visualizations (like word clouds saved as images).
7.  **API Response:** The backend sends the analysis results back to the frontend in JSON format.
8.  **Frontend Display:** The React frontend receives the JSON data and uses components (like charts from Recharts, tables) to display the insights to the user.

## 3. Technology Stack

### Frontend

-   **Language:** TypeScript
-   **Framework:** React
-   **UI Library:** Shadcn/ui (built on Radix UI and Tailwind CSS) - Provides reusable, accessible UI components.
-   **State Management:** React Context API (`AppStateContext`)
-   **Routing:** React Router (`react-router-dom`)
-   **Data Fetching:** Axios, React Query (`@tanstack/react-query`) - For making API calls and managing server state.
-   **Charting:** Recharts - For creating interactive data visualizations.
-   **Build Tool:** Vite - Fast frontend build tool and development server.
-   **Linting:** ESLint

### Backend

-   **Language:** Python
-   **Framework:** Flask - Lightweight web framework for building the API.
-   **Data Handling:** Pandas, NumPy - Core libraries for data manipulation and numerical operations.
-   **AI/NLP:**
    -   NLTK, Scikit-learn, spaCy, TextBlob, Gensim: Libraries for various NLP tasks (sentiment, topic modeling, word extraction, query understanding).
    -   NLTK, Scikit-learn, spaCy, TextBlob, Gensim: Libraries for various NLP tasks (sentiment, topic modeling, word extraction).
-   **Web Server Gateway Interface (WSGI):** Werkzeug (Flask dependency)
-   **API Communication:** Flask-CORS - Handles Cross-Origin Resource Sharing for the frontend.
-   **Visualization (Backend Generation):** Matplotlib, Seaborn, WordCloud - Used to generate static images (e.g., word clouds, plots) saved on the server.
-   **Environment Variables:** `python-dotenv` - Manages environment variables (like API keys) via `.env` file.

### Infrastructure & Development

-   **Package Managers:** npm (frontend), pip (backend)
-   **Version Control:** Git (implied by `.gitignore`)
-   **Development Server:** Vite (frontend), Flask development server (backend)

## 4. Code Flow & Execution

*(Placeholder - More detailed sequence diagrams for key workflows like 'Upload and Analyze Sales Data' or 'Query Review Agent' can be added here.)*

**General Request Flow (Example: Sales Analysis)**

1.  **Frontend:** User navigates to the Sales Analytics page.
2.  **Frontend:** `SalesAnalytics.tsx` component mounts.
3.  **Frontend:** `useEffect` hook triggers an API call (using Axios/React Query) to a backend endpoint like `/api/analyze/sales/{file_id}`.
4.  **Backend:** Flask route (`@app.route('/api/analyze/sales/<file_id>')`) in `app.py` receives the request.
5.  **Backend:** The corresponding handler function is invoked.
6.  **Backend:** Loads the specified sales data file (`uploads/sales/{file_id}.csv`) using `pandas.read_csv()` (via `load_data` in `sales_AI_Agent.py`).
7.  **Backend:** Calls analysis functions (e.g., `analyze_comprehensive_sales`, `analyze_sales_trend`) from `sales_AI_Agent.py`.
8.  **Backend:** These functions use Pandas/NumPy to calculate metrics, trends, etc.
9.  **Backend:** Results are aggregated into a Python dictionary/list.
10. **Backend:** The dictionary is converted to JSON using `jsonify()` (with the custom `NumpyEncoder`) and returned as the HTTP response.
10. **Backend:** The dictionary is converted to JSON using `jsonify()` (with the custom `NumpyEncoder`) and returned as the HTTP response.
11. **Frontend:** Axios/React Query receives the JSON response.
12. **Frontend:** The data is stored in the component's state.
13. **Frontend:** React re-renders the `SalesAnalytics.tsx` component, passing the data to visualization components (e.g., Recharts charts, data tables) for display.

## 4.1 Detailed Agent Workflows

This section provides a more granular view of the internal processing steps for the Sales and Review AI agents.

### 4.1.1 Sales AI Agent Workflow

The Sales AI Agent handles both comprehensive analysis requests and natural language queries related to sales data.

**A. Comprehensive Analysis (`/api/analyze/sales/<file_id>`)**

```
+---------------------------+
| Frontend Request          |
| (Analyze Sales)           |
+-------------+-------------+
              |
              v
+-------------+-------------+
| Flask Backend (`app.py`)  |
| Route: /api/analyze/sales |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 1. Load Data            |
|    `sales_AI_Agent.load_data(file_path)` |
|    (Reads CSV using Pandas)|
+-------------+-------------+
              |
              v
+-------------+-------------+
| 2. Preprocess Data      |
|    `sales_AI_Agent.process_dataframe()` |
|    (Handles Timestamps,   |
|     Missing Values)       |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 3. Perform Analysis     |
|    `sales_AI_Agent.analyze_comprehensive_sales()` |
|    (Calculates Trends,    |
|     Totals, Top Products, |
|     etc. using Pandas)    |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 4. Format Results       |
|    (Aggregates into Dict)|
+-------------+-------------+
              |
              v
+-------------+-------------+
| Flask Backend (`app.py`)  |
| Return JSON Response      |
+-------------+-------------+
              |
              v
+---------------------------+
| Frontend Display          |
| (Charts, Tables)          |
+---------------------------+
```

**B. Natural Language Query (`/api/query/sales/<file_id>`)**

```
+---------------------------+
| Frontend Request          |
| (User Query)              |
+-------------+-------------+
              |
              v
+-------------+-------------+
| Flask Backend (`app.py`)  |
| Route: /api/query/sales   |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 1. Load Data (if needed)|
|    `sales_AI_Agent.load_data(file_path)` |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 2. Initialize Agent     |
|    `sales_AI_Agent.initialize_agent()` |
|    (Sets up ReActAgent   |
|     with tools like       |
|     `analyze_sales_trend`,|
|     `get_top_products`,   |
|     `predict_sales`, etc.)|
+-------------+-------------+
              |
              v
+-------------+-------------+
| 3. Process Query        |
|    `agent.chat(user_query)`|
|    (LLM uses tools based |
|     on query to get data)|
+-------------+-------------+
              |
              v
+-------------+-------------+
| 4. Generate Response    |
|    (Agent synthesizes    |
|     tool results into     |
|     natural language)     |
+-------------+-------------+
              |
              v
+-------------+-------------+
| Flask Backend (`app.py`)  |
| Return JSON Response      |
+-------------+-------------+
              |
              v
+---------------------------+
| Frontend Display          |
| (Text Response)           |
+---------------------------+
```

### 4.1.2 Review AI Agent Workflow

The Review AI Agent handles comprehensive analysis, visual generation, and natural language queries for product review data.

**A. Comprehensive Analysis (`/api/analyze/reviews/<file_id>`)**

```
+---------------------------+
| Frontend Request          |
| (Analyze Reviews)         |
+-------------+-------------+
              |
              v
+-------------+-------------+
| Flask Backend (`app.py`)  |
| Route: /api/analyze/reviews|
+-------------+-------------+
              |
              v
+-------------+-------------+
| 1. Load Data            |
|    `review_AI_Agent.load_user_data(file_path)`|
|    (Reads CSV using Pandas)|
+-------------+-------------+
              |
              v
+-------------+-------------+
| 2. Perform Analysis     |
|    `review_AI_Agent.analyze_comprehensive_reviews()` |
|    (Calls functions for   |
|     Sentiment, Topics,    |
|     Keywords, Summary etc.)|
|    (Uses NLTK, Scikit-learn)|
+-------------+-------------+
              |
              v
+-------------+-------------+
| 3. Generate Visuals     |
|    (Calls functions in    |
|     `review_visual_insights.py` |
|     e.g., generate_word_cloud)|
|    (Saves images/data)   |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 4. Format Results       |
|    (Aggregates into Dict)|
+-------------+-------------+
              |
              v
+-------------+-------------+
| Flask Backend (`app.py`)  |
| Return JSON Response      |
+-------------+-------------+
              |
              v
+---------------------------+
| Frontend Display          |
| (Charts, Tables, Text)    |
+---------------------------+
```

**B. Natural Language Query (`/api/query/reviews/<file_id>`)**

```
+---------------------------+
| Frontend Request          |
| (User Query)              |
+-------------+-------------+
              |
              v
+-------------+-------------+
| Flask Backend (`app.py`)  |
| Route: /api/query/reviews |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 1. Load Data (if needed)|
|    `review_AI_Agent.load_user_data(file_path)` |
+-------------+-------------+
              |
              v
+-------------+-------------+
| 2. Initialize Agent     |
|    `review_AI_Agent.initialize_agent()` |
|    (Sets up ReActAgent   |
|     with tools like       |
|     `summary_statistics`, |
|     `sentiment_analysis`, |
|     `topic_modeling`, etc.)|
+-------------+-------------+
              |
              v
+-------------+-------------+
| 3. Process Query        |
|    `agent.chat(user_query)`|
|    (LLM uses tools based |
|     on query to get data)|
+-------------+-------------+
              |
              v
+-------------+-------------+
| 4. Generate Response    |
|    (Agent synthesizes    |
|     tool results into     |
|     natural language)     |
+-------------+-------------+
              |
              v
+-------------+-------------+
| Flask Backend (`app.py`)  |
| Return JSON Response      |
+-------------+-------------+
              |
              v
+---------------------------+
| Frontend Display          |
| (Text Response)           |
+---------------------------+
```

**C. Visual Insight Generation (e.g., `/api/reviews/visuals/<file_id>/wordcloud`)**

This follows a similar flow to Comprehensive Analysis but calls specific functions from `review_visual_insights.py` based on the endpoint (e.g., `generate_word_cloud`, `plot_sentiment_distribution`) and often returns image URLs or chart data directly.

## 5. Design Decisions & Rationale

*(Placeholder - This section requires deeper analysis or input from the original developers.)*

-   **Client-Server Architecture:** Standard for web applications, separating UI concerns (React) from business logic/data processing (Flask). Allows independent scaling and development.
-   **RESTful API:** Flask provides a straightforward way to create REST endpoints for communication between frontend and backend.
-   **React for Frontend:** A popular and powerful library for building interactive UIs with a component-based approach.
-   **TypeScript for Frontend:** Adds static typing to JavaScript, improving code maintainability and reducing runtime errors.
-   **Python/Flask for Backend:** Python's strong data science ecosystem (Pandas, NumPy, Scikit-learn, NLTK) makes it ideal for the analysis tasks. Flask is a simple, flexible framework to build the API around these libraries.
-   **Direct Python Implementation for AI/NLP:** Using libraries like NLTK, Scikit-learn directly provides fine-grained control over the analysis process and avoids external dependencies for core logic.
-   **Pandas DataFrames:** Efficient in-memory representation for tabular data, suitable for the scale of data handled by CSV uploads.
-   **Trade-offs:**
    -   *In-Memory Processing:* Current design seems to load and process data in memory using Pandas. This is fast for moderately sized files but may not scale to extremely large datasets without modifications (e.g., using chunking, Dask, or a database backend).
    -   *Stateless API:* The Flask API appears largely stateless (processing based on uploaded files), which is good for scalability but relies on the filesystem for state (uploaded files, analysis outputs).
    -   *Custom Implementation Complexity:* Building and maintaining custom NLP/AI logic requires specific expertise compared to using higher-level frameworks.

## 6. Setup & Deployment

### Prerequisites

-   **Node.js and npm:** For the frontend (check `package.json` for potential version specifics, but generally a recent LTS version).
-   **Python and pip:** For the backend (check Python version compatibility if specified, e.g., Python 3.8+).
-   **Git:** For cloning the repository.
# (No external API keys required for core analysis features)

### Backend Setup

1.  **Navigate to the API directory:**
    ```bash
    cd api
    ```
2.  **(Recommended) Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment Variables:** Create a `.env` file in the `api` directory (see Section 7).
5.  **Run the backend server:**
    ```bash
    flask run
    ```
    (By default, it usually runs on `http://127.0.0.1:5000`) 

### Frontend Setup

1.  **Navigate to the project root directory:**
    ```bash
    cd .. 
    ```
    (Assuming you are in the `api` directory from the previous step)
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    (This will typically start the frontend on `http://localhost:8080` as configured in `vite.config.ts`)

### Building for Production

1.  **Build the frontend:**
    ```bash
    npm run build
    ```
    This creates a `dist/` directory with optimized static assets.
2.  **Deploy Backend:** Deploy the Flask application using a production-ready WSGI server (like Gunicorn or Waitress) behind a reverse proxy (like Nginx or Apache).
3.  **Deploy Frontend:** Serve the static files from the `dist/` directory using a web server (like Nginx, Apache, or a cloud storage service like S3 with CloudFront).

### Containerization (Example using Docker - *Not explicitly configured in project*) 

*(Placeholder - Dockerfiles would need to be created.)*

-   A `Dockerfile` for the backend could be based on a Python image, copy `api/`, install `requirements.txt`, and expose the Flask port.
-   A `Dockerfile` for the frontend could use a multi-stage build: Node image to build the React app, then Nginx image to serve the static files from the `dist` folder.
-   `docker-compose.yml` could orchestrate running both frontend and backend containers.

## 7. Configuration & Environment

### Backend (`api/.env`)

The backend uses a `.env` file in the `api` directory to manage sensitive information and configuration.

**Example `.env` content:**

```dotenv
# Flask Configuration (Optional - Flask has defaults)
# FLASK_APP=app.py
# FLASK_ENV=development

# OpenAI API Key (Required for AI features)
OPENAI_API_KEY="your_openai_api_key_here"

# Default dataset path (if needed, though seems hardcoded in app.py currently)
# DEFAULT_REVIEWS_DATASET="path/to/your/default/reviews"
```

**Secrets Management:**

-   **NEVER** commit the `.env` file directly to version control (ensure `.env` is listed in `.gitignore`).
-   Use environment variables provided by the deployment environment (e.g., Heroku config vars, AWS Secrets Manager, Kubernetes Secrets) for production deployments.

### Frontend

The frontend configuration is primarily handled within `vite.config.ts` (e.g., development server port, aliases) and potentially environment variables prefixed with `VITE_` (if used, though none seem apparent currently).

## 8. API Reference / CLI Commands

### Backend API Endpoints (`api/app.py`)

*(Summary based on observed routes - may be incomplete)*

-   `POST /api/upload`: Uploads files (sales, reviews). Expects multipart/form-data.
-   `GET /api/files`: Lists uploaded files.
-   `GET /api/files/<file_id>`: Gets details/metadata for a specific file.
-   `DELETE /api/files/<file_id>`: Deletes a specific file.
-   `POST /api/analyze/sales/<file_id>`: Performs comprehensive sales analysis on the specified file.
-   `POST /api/analyze/reviews/<file_id>`: Performs comprehensive review analysis on the specified file.
-   `POST /api/query/sales/<file_id>`: Sends a natural language query to the Sales AI Agent for the specified file.
-   `POST /api/query/reviews/<file_id>`: Sends a natural language query to the Review AI Agent for the specified file.
-   `GET /api/reviews/visuals/<file_id>`: Gets all available visual insights for review data.
-   `GET /api/reviews/visuals/<file_id>/sentiment`: Gets sentiment distribution chart data.
-   `GET /api/reviews/visuals/<file_id>/rating`: Gets rating distribution chart data.
-   `GET /api/reviews/visuals/<file_id>/topics`: Gets topic distribution chart data.
-   `GET /api/reviews/visuals/<file_id>/sentiment_by_category`: Gets sentiment by category chart data.
-   `GET /api/reviews/visuals/<file_id>/wordcloud`: Gets the word cloud image URL.
-   `GET /api/reviews/visuals/<file_id>/rating_trend`: Gets rating trend chart data.
-   `GET /uploads/sales_analysis_output/<filename>`: Serves generated analysis output files (e.g., images).

*(Request/Response schemas need further definition based on code implementation.)*

### Frontend CLI Commands (`package.json`)

-   `npm run dev`: Starts the Vite development server for the frontend.
-   `npm run build`: Creates a production build of the frontend.
-   `npm run build:dev`: Creates a development build (likely with more debugging info).
-   `npm run lint`: Runs ESLint to check code quality.
-   `npm run preview`: Starts a local server to preview the production build.

## 9. Usage Guide

*(Placeholder - Requires more detailed steps based on UI flow)*

1.  **Start Servers:** Ensure both the backend Flask server (`flask run` in `api/`) and the frontend Vite server (`npm run dev` in the root) are running.
2.  **Access UI:** Open your web browser and navigate to the frontend URL (e.g., `http://localhost:8080`).
3.  **Upload Data:** Navigate to the 'Upload' section. Select the type of data (Sales or Reviews) and choose the corresponding CSV file.
4.  **Analyze Data:**
    -   Navigate to 'Sales Analytics' or 'Reviews Analysis' sections.
    -   Select the uploaded file you wish to analyze.
    -   The dashboard will display various charts, tables, and insights.
5.  **Use AI Agents:**
    -   Go to the relevant analysis page (Sales or Reviews).
    -   Find the query input box for the analysis.
    -   Type your question about the data (e.g., "What were the total sales last month?", "What are the main complaints about product X?").
    -   Submit the query and view the generated response/analysis.
6.  **Troubleshooting:**
    -   **CORS Errors:** Ensure the Flask backend (`app.py`) has CORS enabled correctly (`CORS(app)`).
    -   **File Not Found:** Verify that the backend server has the correct paths to the `uploads` directory and that file IDs match.
    -   **Analysis Errors:** Check the backend console logs for errors originating from the analysis scripts (e.g., `sales_AI_Agent.py`, `review_AI_Agent.py`) or the NLP libraries used.
    -   **Frontend Errors:** Check the browser's developer console for JavaScript errors.
    -   **Backend Errors:** Check the terminal where `flask run` was executed for Python tracebacks.

## 10. Testing & Quality Assurance

-   **Linting:** ESLint (`eslint.config.js`, `npm run lint`) is configured for the frontend to enforce code style and catch potential issues.
-   **Unit/Integration/E2E Tests:** *(Status Unknown)* No specific test files (e.g., using Jest, Pytest, Cypress) are immediately apparent in the file structure provided. Implementing a test suite would be a valuable addition.
    -   **Backend:** Pytest could be used to test Flask routes, data processing functions, and agent logic (potentially mocking external API calls).
    -   **Frontend:** Jest/React Testing Library could test individual components, and Cypress/Playwright could handle end-to-end testing of user flows.

## 11. Maintenance & Extensibility

-   **Coding Conventions:** Follow standard conventions for TypeScript/React (frontend) and Python/Flask (backend). Adhere to ESLint rules for the frontend.
-   **Adding Features:**
    -   *New Analysis:* Add new functions to the relevant backend agent file (`sales_AI_Agent.py` or `review_AI_Agent.py`), create a new Flask route in `app.py` to expose it, and build a corresponding UI component in the React frontend to call the API and display results.
    -   *New Data Source:* Modify backend file loading logic (`load_data`, `load_user_data`) to handle new formats. Update frontend upload component if needed.
-   **Debugging:** Utilize browser developer tools (Console, Network tabs) for frontend issues and Python debugger/print statements/logging for backend issues. Check logs from both servers.

## 12. Glossary & References

### Glossary

-   **AI/NLP Logic:** Custom Python code within the backend that processes natural language queries and performs analysis tasks (e.g., sentiment, topic modeling) using libraries like NLTK, Scikit-learn.
-   **ASIN (Amazon Standard Identification Number):** A unique identifier for products on Amazon (relevant for review data).
-   **LangChain:** A framework for developing applications powered by language models.
-   **Pandas:** A Python library for data manipulation and analysis.
-   **Flask:** A micro web framework for Python used to build the backend API.
-   **React:** A JavaScript library for building user interfaces.
-   **Shadcn/ui:** A UI component library for React.
-   **Vite:** A frontend build tool and development server.
-   **Sentiment Analysis:** Determining the emotional tone (positive, negative, neutral) behind text.
-   **Topic Modeling:** Discovering abstract topics that occur in a collection of documents.

### References

-   *(Placeholder: Link to Design Documents, Issue Tracker, etc.)*
-   [Flask Documentation](https://flask.palletsprojects.com/)
-   [React Documentation](https://react.dev/)
-   [Pandas Documentation](https://pandas.pydata.org/docs/)
-   [NLTK Documentation](https://www.nltk.org/)
-   [Scikit-learn Documentation](https://scikit-learn.org/stable/)
-   [Shadcn/ui Documentation](https://ui.shadcn.com/)
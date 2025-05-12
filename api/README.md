# Supply Chain and Review Insights API

This Python Flask API processes and analyzes both supply chain data and Amazon review data for business analytics.

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
python app.py
```

The server will run on http://localhost:5000 by default.

## API Endpoints

### General Endpoints

- `GET /api/health`: API health check
- `GET /api/departments`: Get list of departments with available data

### File Upload and Management

- `POST /api/upload`: Upload and analyze CSV files (sales or reviews)
- `POST /api/analyze/multiple`: Upload and analyze multiple CSV files

### Review Analysis Endpoints

- `GET /api/load-default-reviews`: Load the default Amazon reviews dataset
- `GET /api/summary`: Get summary statistics for the loaded review dataset
- `GET /api/sentiment`: Get sentiment analysis results
- `GET /api/topics`: Get topic modeling results (query params: `num_topics`, `num_words`)
- `GET /api/keywords`: Get common words and key phrases (query params: `sentiment`, `max_words`)
- `GET /api/summarize`: Get a summary of reviews (query params: `asin`, `use_llm`)
- `GET /api/visualizations/<type>`: Get visualization data (types: `bar`, `histogram`, `wordcloud`, `pie`)
- `POST /api/query`: Process natural language queries about the data
- `POST /api/review-agent/query`: Query the review agent with complex questions

### Sales Analysis Endpoints

- `POST /api/sales-agent/query`: Query the sales agent with complex questions
- Various other sales analysis endpoints

## CSV Data Formats

The API supports two main types of data:

### Sales Data

Required columns: `transaction_id`, `timestamp`, `customer_id`, etc.

### Review Data

Required columns:

- `asin`: Product identifier
- `reviewText`: Full review text
- `overall`: Rating (1-5 stars)
- `summary`: Brief review summary
- `category`: Product category (optional)

## Review Analysis Features

The API provides comprehensive analysis of Amazon review data:

1. **Data Loading**:

   - Load from uploaded files or the default dataset path
   - Handles large datasets via chunking and sampling

2. **Analysis Functions**:

   - Summary statistics (review counts, average ratings, etc.)
   - Sentiment analysis using VADER and/or LLM
   - Topic modeling to identify common themes
   - Keyword extraction and key phrase identification
   - Review summarization (statistical or LLM-based)

3. **Visualizations**:

   - Bar charts of review counts by category
   - Histograms of rating distributions
   - Word clouds for positive/negative reviews
   - Pie charts of sentiment distribution

4. **LLM Integration**:
   - Uses Ollama (if available) for enhanced analysis
   - Natural language querying about the dataset
   - Summarization of review content

## Example Usage

```bash
# Upload a sales data CSV file
curl -X POST -F "file=@sales_data.csv" -F "department=electronics" http://localhost:5000/api/upload

# Load default Amazon reviews dataset
curl -X GET http://localhost:5000/api/load-default-reviews

# Get sentiment analysis results
curl -X GET http://localhost:5000/api/sentiment

# Generate a word cloud for positive reviews
curl -X GET http://localhost:5000/api/visualizations/wordcloud?sentiment=positive

# Ask a question about the reviews
curl -X POST -H "Content-Type: application/json" -d '{"query":"What are the main topics in negative reviews?"}' http://localhost:5000/api/review-agent/query
```

## Default Dataset Path

The default Amazon reviews dataset is expected to be located at:
`D:\OneDrive - Higher Education Commission\FYP-Dataset\Sentiment Analysis`

You can modify this path in the code if needed.

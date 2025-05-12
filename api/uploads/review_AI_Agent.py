import pandas as pd
import os
import sys
import requests
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64
import json
from llama_index.core.tools import FunctionTool
from llama_index.llms.ollama import Ollama
from llama_index.core.agent import ReActAgent
from wordcloud import WordCloud, STOPWORDS
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer
import re
from collections import Counter
import traceback

# Download NLTK resources if not already available
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('vader_lexicon')

# Global variable to store DataFrame
df = None
DEFAULT_DATASET_PATH = r"D:\OneDrive - Higher Education Commission\FYP-Dataset\Sentiment Analysis"

# Function to load and concatenate data from multiple CSV files
def load_user_data(file_paths=None):
    """
    Loads data from file paths or default dataset directory and concatenates them into a single DataFrame.

    Args:
        file_paths (list, optional): List of file paths to load. If None, loads from default dataset path.

    Returns:
        pd.DataFrame: Concatenated DataFrame of all CSV data.
    """
    global df
    
    if file_paths is None:
        # Use default dataset path if no file paths provided
        directory = DEFAULT_DATASET_PATH
        if not os.path.exists(directory):
            raise ValueError(f"Default dataset directory not found: {directory}")
            
        print(f"Loading data from default directory: {directory}")
        csv_files = [os.path.join(directory, f) for f in os.listdir(directory) if f.endswith('.csv')]
    else:
        # Use provided file paths directly
        csv_files = [f for f in file_paths if isinstance(f, str) and f.endswith('.csv')]
        if not csv_files:
            print(f"Warning: No valid CSV files found in provided paths: {file_paths}")
            raise ValueError("No valid CSV files found in the provided paths.")
        print(f"Loading data from {len(csv_files)} provided file paths")
        
    if not csv_files:
        raise ValueError("No CSV files found in the specified location.")
    
    # Process files in chunks to handle large datasets
    all_dfs = []
    for file_path in csv_files:
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                print(f"Warning: File does not exist: {file_path}")
                continue
                
            print(f"Attempting to load file: {file_path}")
            # Use chunking for large files
            chunks = []
            for chunk in pd.read_csv(file_path, chunksize=10000):
                chunks.append(chunk)
            file_df = pd.concat(chunks, ignore_index=True)
            all_dfs.append(file_df)
            print(f"Successfully loaded {file_path} with {len(file_df)} rows and {len(file_df.columns)} columns")
        except Exception as e:
            print(f"Error loading {file_path}: {str(e)}")
            continue
    
    if not all_dfs:
        raise ValueError("Failed to load any valid CSV files.")
    
    df = pd.concat(all_dfs, ignore_index=True)
    
    # Print available columns for debugging
    print(f"Available columns: {df.columns.tolist()}")
    
    # Check for required review columns
    required_cols = ['asin', 'reviewText', 'overall', 'summary']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")
    
    # Add category column if missing
    if 'category' not in df.columns and 'product_category' in df.columns:
        df['category'] = df['product_category']
    
    # Convert review data types if needed
    if 'overall' in df.columns:
        df['overall'] = pd.to_numeric(df['overall'], errors='coerce')
    
    # NO SAMPLING - We work with the complete dataset
    # Previously: if len(df) > 100000: df = df.sample(n=100000)
    
    return df

# Alias for compatibility with existing code
load_data = load_user_data

# Function to set the dataframe directly
def set_dataframe(dataframe):
    """
    Sets the dataframe directly instead of loading from files.

    Args:
        dataframe (pd.DataFrame): The dataframe to use for analysis.

    Returns:
        pd.DataFrame: The processed dataframe.
    """
    global df
    
    df = dataframe.copy()
    return df

# Check if Ollama is running
def is_ollama_running():
    """
    Checks if the Ollama server is running locally.

    Returns:
        bool: True if Ollama is running, False otherwise.
    """
    try:
        response = requests.get("http://localhost:11434/api/version", timeout=2)
        return response.status_code == 200
    except requests.RequestException:
        return False

# Define analysis tools - these functions will use the global dataframe
def summary_statistics():
    """
    Calculates summary statistics for the review dataset.

    Returns:
        dict: Dictionary containing summary statistics suitable for JSON serialization.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    # Basic summary statistics
    total_reviews = len(df)
    unique_products = df['asin'].nunique()
    avg_rating = df['overall'].mean()
    rating_distribution = df['overall'].value_counts().sort_index().to_dict()
    
    # Reviews per category
    if 'category' in df.columns:
        reviews_per_category = df['category'].value_counts().to_dict()
    else:
        reviews_per_category = {"Unknown": total_reviews}
    
    # Top products by review count
    top_products = df.groupby('asin').size().sort_values(ascending=False).head(10).to_dict()
    
    # Statistics as JSON-serializable dictionary
    stats = {
        "total_reviews": total_reviews,
        "unique_products": unique_products,
        "average_rating": float(avg_rating),
        "rating_distribution": rating_distribution,
        "reviews_per_category": reviews_per_category,
        "top_products_by_review_count": top_products
    }
    
    return stats

# Helper function to convert numpy types for JSON serialization
def convert_numpy_types(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (pd.Timestamp, pd.Period)):
        return str(obj)
    return obj

def get_asin_summary():
    """
    Calculates summary statistics (review count, average rating) for each ASIN.

    Returns:
        list: A list of dictionaries, each containing 'asin', 'review_count', and 'average_rating'.
              Returns an empty list if data is not available or columns are missing.
    """
    global df
    
    if df is None or len(df) == 0:
        print("Warning: DataFrame is empty or not loaded in get_asin_summary.")
        return []
        
    required_cols = ['asin', 'overall']
    if not all(col in df.columns for col in required_cols):
        print(f"Warning: Missing required columns for ASIN summary: {required_cols}. Available: {df.columns.tolist()}")
        return []
        
    try:
        # Ensure 'overall' is numeric
        df['overall'] = pd.to_numeric(df['overall'], errors='coerce')
        df_filtered = df.dropna(subset=['asin', 'overall']) # Drop rows where asin or overall is NaN
        
        # Group by ASIN and calculate count and mean rating
        asin_summary = df_filtered.groupby('asin').agg(
            review_count=('overall', 'count'),
            average_rating=('overall', 'mean')
        ).reset_index()
        
        # Rename columns for clarity
        asin_summary.rename(columns={'asin': 'asin', 'review_count': 'reviewCount', 'average_rating': 'averageRating'}, inplace=True)

        # Convert to list of dictionaries and handle numpy types
        summary_list = asin_summary.apply(lambda row: {k: convert_numpy_types(v) for k, v in row.items()}, axis=1).tolist()
        
        return summary_list
        
    except Exception as e:
        print(f"Error calculating ASIN summary: {str(e)}")
        traceback.print_exc()
        return []

def analyze_sentiment(text=None, method='vader'):
    """
    Analyzes sentiment of reviews using VADER sentiment analysis or custom text.

    Args:
        text (str, optional): Specific text to analyze. If None, analyzes all reviews.
        method (str): Sentiment analysis method to use ('vader' by default).

    Returns:
        dict: Dictionary with sentiment analysis results.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    if text:
        # Analyze sentiment for the provided text
        analyzer = SentimentIntensityAnalyzer()
        sentiment = analyzer.polarity_scores(text)
        # Determine overall sentiment label
        if sentiment['compound'] >= 0.05:
            sentiment_label = 'positive'
        elif sentiment['compound'] <= -0.05:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
        return {
            'text': text,
            'sentiment': sentiment_label,
            'scores': sentiment
        }
    
    # Using the full dataset instead of sampling
    # Process in chunks if needed for very large datasets 
    analyzer = SentimentIntensityAnalyzer()
    
    df['sentiment_score'] = df['reviewText'].apply(
        lambda text: analyzer.polarity_scores(str(text))['compound'] 
        if isinstance(text, str) and text else 0
    )
    
    # Get sentiment categories
    df['sentiment_category'] = df['sentiment_score'].apply(
        lambda score: 'positive' if score >= 0.05 else ('negative' if score <= -0.05 else 'neutral')
    )
    
    # Calculate sentiment distribution
    sentiment_dist = df['sentiment_category'].value_counts().to_dict()
    sentiment_pct = (df['sentiment_category'].value_counts(normalize=True) * 100).to_dict()
    
    # Get rating distribution
    rating_dist = df['overall'].value_counts().sort_index().to_dict()
    
    # Correlation between rating and sentiment
    corr = df[['overall', 'sentiment_score']].corr().iloc[0, 1]

    # Get representative reviews - not random samples
    positive_reviews = df[df['sentiment_score'] >= 0.5].sort_values('sentiment_score', ascending=False).head(3)
    negative_reviews = df[df['sentiment_score'] <= -0.5].sort_values('sentiment_score').head(3)
    
    # Create review examples
    pos_examples = [{"text": row['reviewText'], "summary": row['summary']} for _, row in positive_reviews.iterrows()]
    neg_examples = [{"text": row['reviewText'], "summary": row['summary']} for _, row in negative_reviews.iterrows()]
    
    return {
        "sentiment_distribution": sentiment_dist,
        "sentiment_percentage": sentiment_pct,
        "rating_distribution": rating_dist,
        "sentiment_rating_correlation": float(corr),
        "examples_positive": pos_examples,
        "examples_negative": neg_examples
    }

def perform_topic_modeling(num_topics=5, num_words=10):
    """
    Performs topic modeling on review texts using LDA.

    Args:
        num_topics (int): Number of topics to extract.
        num_words (int): Number of words per topic to return.

    Returns:
        dict: Dictionary with topics and related words.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
        
    # Process the entire dataset without sampling
    # For extremely large datasets (10M+ reviews), implement chunking
    print(f"Performing topic modeling on dataset with {len(df)} reviews")
        
    # Clean and prepare text data
    # Use only non-empty review texts
    texts = df['reviewText'].dropna().astype(str).tolist()
    
    # Create document-term matrix
    stop_words = set(stopwords.words('english'))
    vectorizer = CountVectorizer(
        max_df=0.95, 
        min_df=2,
        stop_words=stop_words,
        max_features=10000  # Limit features for memory efficiency
    )
    
    try:
        dtm = vectorizer.fit_transform(texts)
        feature_names = vectorizer.get_feature_names_out()
    except Exception as e:
        print(f"Error creating document-term matrix: {str(e)}")
        return {"error": f"Failed to create document-term matrix: {str(e)}"}
    
    # Apply LDA
    try:
        lda = LatentDirichletAllocation(
            n_components=num_topics,
            random_state=42,
            n_jobs=-1  # Use all available cores
        )
        lda.fit(dtm)
    except Exception as e:
        print(f"Error in LDA modeling: {str(e)}")
        return {"error": f"Topic modeling failed: {str(e)}"}
    
    # Extract topics
    topics = []
    for topic_idx, topic in enumerate(lda.components_):
        top_words_idx = topic.argsort()[:-num_words-1:-1]
        top_words = [feature_names[i] for i in top_words_idx]
        topics.append({
            "id": topic_idx,
            "words": top_words,
            "weight": float(topic.sum() / lda.components_.sum())  # Topic importance
        })
    
    return {
        "num_topics": num_topics,
        "topics": topics
    }

def extract_common_words(sentiment='all', max_words=50):
    """
    Extracts most common words from review texts, optionally filtered by sentiment.

    Args:
        sentiment (str): Filter by sentiment ('all', 'positive', 'negative', 'neutral').
        max_words (int): Maximum number of words to return.

    Returns:
        dict: Dictionary with word frequencies.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    # Process the entire dataset without sampling
    print(f"Extracting common words from dataset with {len(df)} reviews")
    
    # If needed, calculate sentiment scores first
    if sentiment != 'all' and 'sentiment_score' not in df.columns:
        analyzer = SentimentIntensityAnalyzer()
        df['sentiment_score'] = df['reviewText'].apply(
            lambda text: analyzer.polarity_scores(str(text))['compound'] 
            if isinstance(text, str) and text else 0
        )
    
    # Filter by sentiment if requested
    if sentiment == 'positive':
        filtered_df = df[df['sentiment_score'] >= 0.05]
    elif sentiment == 'negative':
        filtered_df = df[df['sentiment_score'] <= -0.05]
    elif sentiment == 'neutral':
        filtered_df = df[(df['sentiment_score'] > -0.05) & (df['sentiment_score'] < 0.05)]
    else:
        filtered_df = df
    
    if len(filtered_df) == 0:
        return {"error": f"No reviews found with sentiment: {sentiment}"}
    
    # Combine all review texts
    text = ' '.join(filtered_df['reviewText'].dropna().astype(str))
    
    # Tokenize and clean
    stop_words = set(stopwords.words('english'))
    custom_stopwords = {'product', 'item', 'amazon', 'one', 'buy', 'purchase', 'use', 'get', 'would', 'could', 'will'}
    stop_words = stop_words.union(custom_stopwords)
    
    # Remove special characters and convert to lowercase
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    words = word_tokenize(text)
    
    # Filter words
    filtered_words = [word for word in words 
                      if word.isalpha() and len(word) > 2 
                      and word not in stop_words]
    
    # Get word frequency
    word_freq = Counter(filtered_words)
    top_words = word_freq.most_common(max_words)
    
    # Format for return
    result = {
        "sentiment_filter": sentiment,
        "word_count": {word: count for word, count in top_words}
    }
    
    return result

def summarize_reviews(asin=None, use_llm=True):
    """
    Generates a summary of review insights.
    
    Args:
        asin (str, optional): Product ID to filter by
        use_llm (bool): Whether to use an LLM for summary generation
        
    Returns:
        dict: Summary of review insights
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    # Filter by product ID if specified
    if asin:
        product_df = df[df['asin'] == asin]
        if len(product_df) == 0:
            return {"error": f"No reviews found for product ID: {asin}"}
    else:
        product_df = df
    
    # Process the entire dataset without sampling
    print(f"Summarizing {len(product_df)} reviews")
    
    # Try LLM approach if requested
    if use_llm and is_ollama_running():
        try:
            # Limit to a reasonable number for LLM processing
            review_sample = product_df['reviewText'].dropna().sample(min(100, len(product_df))).tolist()
            reviews_text = "\n".join(review_sample)
            
            prompt = f"""Analyze these {len(review_sample)} product reviews and provide:
            1. Overall customer sentiment
            2. Key strengths mentioned
            3. Common issues or complaints
            4. Any suggestions for improvement
            
            Reviews:
            {reviews_text}
            
            Provide a concise summary addressing the points above. Be specific about what customers like and dislike.
            """
            
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "llama2",
                    "prompt": prompt,
                    "stream": False
                }
            )
            
            if response.status_code == 200:
                summary = response.json().get("response", "").strip()
                return {
                    "summary": summary,
                    "method": "llm"
                }
        except Exception as e:
            print(f"LLM summarization failed: {str(e)}")
            # Fall back to statistical approach
    
    # Statistical approach as fallback
    try:
        # Calculate average rating
        avg_rating = product_df['overall'].mean()
        
        # Get sentiment
        sentiment_scores = analyze_sentiment(product_df)
        sentiment = "positive" if sentiment_scores["average_sentiment"] > 0.05 else \
                   "negative" if sentiment_scores["average_sentiment"] < -0.05 else "neutral"
        
        # Get common words
        common_words = extract_common_words(sentiment='all', max_words=20)
        
        # Create a statistical summary
        top_words = list(common_words['word_count'].keys())[:10]
        
        summary = f"Average rating: {avg_rating:.1f}/5. "
        
        # Add review count breakdown
        reviews_count = len(product_df)
        positive_count = len(product_df[product_df['overall'] >= 4])
        negative_count = len(product_df[product_df['overall'] <= 2])
        neutral_count = reviews_count - positive_count - negative_count
        
        summary += f"Based on {reviews_count} reviews: "
        summary += f"{positive_count} positive, {negative_count} negative, {neutral_count} neutral. "
            
        summary += f"Overall sentiment: {sentiment}. "
        summary += f"Common words: {', '.join(top_words)}."
        
        return {
            "average_rating": float(avg_rating),
            "review_count": int(reviews_count),
            "sentiment": sentiment,
            "sentiment_score": float(sentiment_scores["average_sentiment"]),
            "summary": summary,
            "common_words": top_words,
            "method": "statistical"
        }
    except Exception as e:
        return {"error": f"Failed to generate summary: {str(e)}"}

def analyze_rating_distribution():
    """
    Analyzes the distribution of ratings across the dataset.
    
    Returns:
        dict: Rating distribution data for visualization.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    # Calculate basic distribution
    rating_counts = df['overall'].value_counts().sort_index()
    
    # Convert to data for visualization
    data = {
        "labels": [str(int(rating)) for rating in rating_counts.index],
        "values": rating_counts.values.tolist(),
        "title": "Distribution of Ratings",
        "description": "Number of reviews for each star rating"
    }
    
    return data

def analyze_category_distribution():
    """
    Analyzes the distribution of reviews across product categories.
    
    Returns:
        dict: Category distribution data for visualization.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    if 'category' not in df.columns:
        return {
            "error": "Category column not found in dataset",
            "available_columns": df.columns.tolist()
        }
    
    # Get top 10 categories by review count
    category_counts = df['category'].value_counts().head(10)
    
    # Convert to data for visualization
    data = {
        "labels": category_counts.index.tolist(),
        "values": category_counts.values.tolist(),
        "title": "Reviews by Product Category",
        "description": "Number of reviews for each product category"
    }
    
    return data

def generate_wordcloud_image(sentiment='all'):
    """
    Generates a word cloud for reviews with specified sentiment.
    
    Args:
        sentiment (str): Filter by sentiment ('all', 'positive', 'negative', 'neutral')
        
    Returns:
        str: Base64-encoded image of the word cloud.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    # Filter by sentiment if specified
    if sentiment != 'all':
        if sentiment == 'positive':
            filtered_df = df[df['overall'] >= 4]
        elif sentiment == 'negative':
            filtered_df = df[df['overall'] <= 2]
        elif sentiment == 'neutral':
            filtered_df = df[(df['overall'] > 2) & (df['overall'] < 4)]
        else:
            filtered_df = df
    else:
        filtered_df = df
    
    # Sample data if needed
    sample_size = min(5000, len(filtered_df))
    sample_df = filtered_df.sample(n=sample_size, random_state=42) if len(filtered_df) > sample_size else filtered_df
    
    # Combine all review text
    text = ' '.join(sample_df['reviewText'].dropna().astype(str))
    
    # Configure stop words
    stop_words = set(STOPWORDS)
    stop_words.update(['product', 'amazon', 'review', 'star', 'item'])
    
    # Generate word cloud
    wordcloud = WordCloud(
        width=800, 
        height=400, 
        background_color='white', 
        stopwords=stop_words, 
        max_words=100,
        collocations=False
    ).generate(text)
    
    # Convert to image
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    
    # Save to bytesIO and convert to base64
    img_data = BytesIO()
    plt.savefig(img_data, format='png')
    img_data.seek(0)
    base64_img = base64.b64encode(img_data.read()).decode('utf-8')
    plt.close()
    
    return {
        "sentiment": sentiment,
        "image": f"data:image/png;base64,{base64_img}"
    }

def generate_sentiment_pie_chart():
    """
    Generates a pie chart showing the distribution of sentiments.
    
    Returns:
        dict: Pie chart data and base64-encoded image.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    # Categorize ratings into sentiments
    df['sentiment'] = pd.cut(
        df['overall'],
        bins=[0, 2, 3.5, 5],
        labels=['Negative', 'Neutral', 'Positive']
    )
    
    sentiment_counts = df['sentiment'].value_counts()
    
    # Create pie chart
    plt.figure(figsize=(8, 8))
    plt.pie(
        sentiment_counts.values,
        labels=sentiment_counts.index,
        autopct='%1.1f%%',
        colors=['#ff9999', '#ffe680', '#99ff99'],
        startangle=90
    )
    plt.title('Sentiment Distribution', fontsize=14)
    
    # Save to bytesIO and convert to base64
    img_data = BytesIO()
    plt.savefig(img_data, format='png')
    img_data.seek(0)
    base64_img = base64.b64encode(img_data.read()).decode('utf-8')
    plt.close()
    
    # Prepare data for Chart.js format
    data = {
        "type": "pie",
        "data": {
            "labels": sentiment_counts.index.tolist(),
            "values": sentiment_counts.values.tolist()
        },
        "title": "Sentiment Distribution",
        "description": "Distribution of reviews by sentiment category",
        "image": f"data:image/png;base64,{base64_img}"
    }
    
    return data

def group_by_feature(feature, aggregate_col, aggregate_func='mean'):
    """
    Groups the data by a specified feature and calculates an aggregate on another column.

    Args:
        feature (str): Column name to group by (e.g., 'category', 'asin').
        aggregate_col (str): Column name to aggregate (e.g., 'overall').
        aggregate_func (str): Aggregation function (e.g., 'mean', 'count').

    Returns:
        pandas.Series: Grouped data as a pandas Series.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    if feature not in df.columns or aggregate_col not in df.columns:
        print(f"Invalid feature or aggregate column. Available columns: {df.columns.tolist()}")
        return pd.Series()
    
    grouped = df.groupby(feature)[aggregate_col].agg(aggregate_func)
    return grouped  # Return the actual pandas Series object

def analyze_comprehensive_reviews():
    """
    Performs a comprehensive analysis of the reviews data using LLM where available.
    Generates both textual and data-driven insights dynamically.

    Returns:
        str: Detailed markdown-formatted analysis of the review data.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    # Gather comprehensive statistics about the dataset
    num_reviews = len(df)
    num_products = df['asin'].nunique()
    avg_rating = df['overall'].mean()
    rating_dist = df['overall'].value_counts().sort_index().to_dict()
    
    # Get category data if available
    categories_data = {}
    if 'category' in df.columns:
        categories_data = df['category'].value_counts().head(10).to_dict()
    
    # Calculate sentiment distribution
    sentiment_data = {}
    try:
        sentiment_results = analyze_sentiment()
        sentiment_data = sentiment_results.get('distribution', {})
    except Exception as e:
        print(f"Error analyzing sentiment: {str(e)}")
    
    # Try to use LLM for comprehensive analysis
    if is_ollama_running():
        try:
            # Create rich context for the LLM
            context = f"""
            You're an expert in analyzing customer reviews data. You are analyzing a real dataset of Amazon product reviews with:
            - {num_reviews:,} reviews
            - {num_products:,} unique products
            - Average rating: {avg_rating:.2f}/5 stars
            - Rating distribution: {', '.join([f"{rating} stars: {count:,}" for rating, count in rating_dist.items()])}
            
            {f"- Top categories: {', '.join([f'{cat} ({count:,})' for cat, count in categories_data.items()])}" if categories_data else ""}
            
            {f"- Sentiment: {sentiment_data.get('positive', 0)*100:.1f}% positive, {sentiment_data.get('neutral', 0)*100:.1f}% neutral, {sentiment_data.get('negative', 0)*100:.1f}% negative" if sentiment_data else ""}
            
            Provide a comprehensive analysis of this dataset in markdown format. Include:
            1. Overview and key statistics
            2. Rating distribution analysis and insights
            3. Category breakdown and analysis (if available)
            4. Sentiment analysis and key trends
            5. Actionable recommendations based on the data
            
            Focus ONLY on the actual data provided. Be specific and data-driven in your analysis.
            """
            
            # Sample some reviews for context
            sample_reviews = df.sample(min(10, len(df)))
            reviews_text = "\nSample reviews from the dataset:\n"
            for _, review in sample_reviews.iterrows():
                if 'reviewText' in review and isinstance(review['reviewText'], str) and 'summary' in review:
                    short_text = review['reviewText'][:100] + "..." if len(review['reviewText']) > 100 else review['reviewText']
                    reviews_text += f"- Product {review['asin']}: \"{review['summary']}\" (Rating: {review['overall']})\n  \"{short_text}\"\n"
            
            # Get the LLM to analyze the data
            llm = Ollama(model="llama3", request_timeout=60.0)
            response = llm.complete(f"{context}{reviews_text}")
            
            # If we got a meaningful response, return it
            if response and response.text and len(response.text.strip()) > 100:
                return response.text.strip()
        except Exception as e:
            print(f"LLM analysis failed: {str(e)}")
            # Fall back to template-based analysis
    
    # If LLM failed or is not available, use template-based analysis
    analysis = "## Review Data Analysis\n\n"
    analysis += f"Total number of reviews: {num_reviews:,}\n"
    analysis += f"Number of unique products: {num_products:,}\n"
    analysis += f"Average overall rating: {avg_rating:.2f}/5\n\n"
    
    # Rating distribution
    analysis += "### Rating Distribution\n\n"
    for rating, count in rating_dist.items():
        percentage = (count / num_reviews) * 100
        analysis += f"- {rating} stars: {count:,} reviews ({percentage:.1f}%)\n"
    analysis += "\n"
    
    # Add insights based on rating distribution
    if avg_rating >= 4.0:
        analysis += "The products in this dataset have very positive reviews overall, indicating high customer satisfaction.\n\n"
    elif avg_rating >= 3.0:
        analysis += "The products in this dataset have moderately positive reviews, suggesting room for improvement.\n\n"
    else:
        analysis += "The products in this dataset have relatively low ratings, indicating significant customer dissatisfaction.\n\n"
    
    # Top categories by number of reviews
    if 'category' in df.columns:
        category_counts = df['category'].value_counts().head(5)
        analysis += "### Top 5 Categories by Number of Reviews\n\n"
        for category, count in category_counts.items():
            percentage = (count / num_reviews) * 100
            analysis += f"- {category}: {count:,} reviews ({percentage:.1f}%)\n"
        analysis += "\n"
    
    # Sentiment analysis
    if sentiment_data:
        analysis += "### Sentiment Distribution\n\n"
        analysis += f"- Positive: {sentiment_data.get('positive', 0)*100:.1f}%\n"
        analysis += f"- Neutral: {sentiment_data.get('neutral', 0)*100:.1f}%\n"
        analysis += f"- Negative: {sentiment_data.get('negative', 0)*100:.1f}%\n\n"
        
        # Add insights based on sentiment
        pos_pct = sentiment_data.get('positive', 0)*100
        neg_pct = sentiment_data.get('negative', 0)*100
        
        if pos_pct > 70:
            analysis += "The sentiment is predominantly positive, indicating strong customer satisfaction.\n\n"
        elif pos_pct > neg_pct:
            analysis += "The sentiment is more positive than negative, but there's room for improvement.\n\n"
        elif neg_pct > pos_pct:
            analysis += "The sentiment is more negative than positive, suggesting significant issues to address.\n\n"
    
    # Topic modeling
    try:
        topics = perform_topic_modeling(num_topics=3, num_words=5)
        analysis += "### Key Topics in Reviews\n\n"
        for topic in topics['topics']:
            analysis += f"- Topic {topic['id']+1}: {', '.join(topic['words'])}\n"
        analysis += "\n"
    except Exception as e:
        print(f"Topic modeling failed: {str(e)}")
    
    # Sample reviews
    analysis += "### Sample Reviews\n\n"
    sample_reviews = df.sample(min(3, len(df)))
    for _, review in sample_reviews.iterrows():
        analysis += f"- **Product {review['asin']}**: {review['summary']} (Rating: {review['overall']})\n"
    
    # Add recommendations
    analysis += "\n### Recommendations\n\n"
    
    # Generate data-driven recommendations
    if avg_rating < 3.5:
        analysis += "- Focus on product quality improvement based on negative review themes\n"
        analysis += "- Address common customer complaints highlighted in low-rated reviews\n"
    
    if 'category' in df.columns:
        low_rated_categories = df.groupby('category')['overall'].mean().sort_values().head(2)
        if not low_rated_categories.empty:
            analysis += f"- Investigate quality issues in the {', '.join(low_rated_categories.index.tolist())} categories\n"
    
    if sentiment_data and sentiment_data.get('negative', 0) > 0.2:
        analysis += "- Implement a customer feedback program to address the high proportion of negative sentiment\n"
    
    return analysis

def get_product_info():
    """
    Extracts product information including average ratings and sample summaries.

    Returns:
        dict: Dictionary with product information suitable for JSON serialization.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload a valid dataset for analysis.")
    
    product_data = df.groupby('asin').agg({
        'overall': ['mean', 'count'],
        'summary': lambda x: list(x)[:3],  # Up to 3 sample summaries
        'category': 'first'
    }).reset_index()
    
    product_data.columns = ['asin', 'avg_rating', 'review_count', 'sample_summaries', 'category']
    products = product_data.to_dict('records')
    return {"products": products}

# Enhance process_query_directly to handle review-related queries
def process_query_directly(query):
    """
    Process a natural language query directly without using an LLM.

    Args:
        query (str): The query to process.

    Returns:
        str: The response to the query.
    """
    global df
    
    if df is None or len(df) == 0:
        return "No data is available. Please upload a valid dataset for analysis."
    
    query = query.lower()
    
    if "overview" in query or "summary" in query or "analysis" in query:
        return analyze_comprehensive_reviews()
    
    elif "average rating" in query and "category" in query:
        categories = df['category'].unique()
        for cat in categories:
            if cat.lower() in query:
                avg_rating = df[df['category'] == cat]['overall'].mean()
                return f"Average rating for {cat}: {avg_rating:.2f}"
        return "Please specify a valid category."
    
    elif "product info" in query or "products" in query or "top products" in query:
        product_info = get_product_info()
        products = sorted(product_info["products"], key=lambda x: x['review_count'], reverse=True)[:5]
        result = "Top 5 products by number of reviews:\n\n"
        for product in products:
            result += f"- **{product['asin']}** ({product['category']}): {product['review_count']} reviews, Avg Rating {product['avg_rating']:.2f}\n"
        return result
    
    elif "average rating by category" in query:
        avg_ratings = group_by_feature('category', 'overall', 'mean')
        result = "Average ratings by category:\n\n"
        for cat, rating in avg_ratings.items():
            result += f"- {cat}: {rating:.2f}\n"
        return result
    
    elif "statistics" in query:
        stats = summary_statistics()
        return json.dumps(stats, indent=2)
    
    elif "topics" in query or "themes" in query:
        topics = perform_topic_modeling()
        result = "Main topics in reviews:\n\n"
        for topic in topics['topics']:
            result += f"- Topic {topic['id']+1}: {', '.join(topic['words'])}\n"
        return result
    
    elif "sentiment" in query:
        sentiment_data = analyze_sentiment()
        result = "Sentiment analysis results:\n\n"
        result += f"- Positive: {sentiment_data['distribution']['positive']*100:.1f}%\n"
        result += f"- Neutral: {sentiment_data['distribution']['neutral']*100:.1f}%\n"
        result += f"- Negative: {sentiment_data['distribution']['negative']*100:.1f}%\n"
        return result
    
    else:
        # Try to use LLM if available
        if is_ollama_running():
            try:
                # First provide context summary about the data
                context = f"""
                Dataset information:
                - {len(df)} reviews
                - {df['asin'].nunique()} unique products
                - Average rating: {df['overall'].mean():.2f}/5
                """
                
                llm = Ollama(model="llama3", request_timeout=30.0)
                response = llm.complete(
                    f"{context}\n\nPlease answer this query about the Amazon product reviews dataset: {query}"
                )
                return response.text.strip()
            except Exception as e:
                return f"Sorry, I don't understand that query and the LLM is not available. Error: {str(e)}"
        
        return "Sorry, I don't understand that query. Try asking for an overview, product info, sentiment analysis, or topics."

# Create tools for the ReAct agent
summary_tool = FunctionTool.from_defaults(
    fn=summary_statistics,
    name="summary_statistics",
    description="Calculates summary statistics for the review dataset including total reviews, average rating, and review count per category"
)

sentiment_tool = FunctionTool.from_defaults(
    fn=analyze_sentiment,
    name="analyze_sentiment",
    description="Analyzes the sentiment of the review text using VADER sentiment analysis"
)

topic_tool = FunctionTool.from_defaults(
    fn=perform_topic_modeling,
    name="perform_topic_modeling",
    description="Performs topic modeling on review text to identify common themes"
)

wordcloud_tool = FunctionTool.from_defaults(
    fn=generate_wordcloud_image,
    name="generate_wordcloud",
    description="Generates a word cloud visualization from review text"
)

keywords_tool = FunctionTool.from_defaults(
    fn=extract_common_words,
    name="extract_common_words",
    description="Extracts common words and key phrases from review text"
)

summarize_tool = FunctionTool.from_defaults(
    fn=summarize_reviews,
    name="summarize_reviews",
    description="Summarizes reviews for a product or all reviews using statistical methods or LLM"
)

# Create the ReAct agent for more complex queries
def create_review_agent():
    """
    Creates a ReAct agent with tools for analyzing reviews.
    
    Returns:
        ReActAgent: Configured agent if Ollama is running, None otherwise.
    """
    if not is_ollama_running():
        return None
    
    try:
        llm = Ollama(model="llama2:13b", request_timeout=30.0)
        
        tools = [
            summary_tool,
            sentiment_tool,
            topic_tool,
            wordcloud_tool,
            keywords_tool,
            summarize_tool
        ]
        
        agent = ReActAgent.from_tools(
            tools,
            llm=llm,
            verbose=True
        )
        
        return agent
    except Exception as e:
        print(f"Failed to create agent: {str(e)}")
        return None

# Function to handle review agent queries with a more complex approach
def review_agent_query(query):
    """
    Process a query using the ReAct agent if available, fall back to process_query_directly.
    Provides real-time analysis of review data using LLM.
    
    Args:
        query (str): The query to process.
        
    Returns:
        str: The response to the query.
    """
    global df
    
    if df is None or len(df) == 0:
        return "No data is available. Please upload a valid dataset for analysis."
    
    # Extract key dataset statistics for context
    num_reviews = len(df)
    num_products = df['asin'].nunique()
    avg_rating = df['overall'].mean()
    rating_dist = df['overall'].value_counts().sort_index().to_dict()
    
    # Get category information if available
    categories = []
    if 'category' in df.columns:
        categories = df['category'].value_counts().head(5).to_dict()
    
    # Try to use the ReAct agent first for complex reasoning
    agent = create_review_agent()
    
    if agent:
        try:
            # Create rich context about the dataset for the agent
            context = f"""
            You are analyzing an Amazon product reviews dataset with {num_reviews:,} reviews across {num_products:,} products.
            The average rating is {avg_rating:.2f}/5 stars.
            
            Rating distribution:
            {', '.join([f"{rating} stars: {count:,} reviews" for rating, count in rating_dist.items()])}
            
            {"Top categories: " + ', '.join([f"{cat} ({count:,} reviews)" for cat, count in categories.items()]) if categories else ""}
            
            Base your analysis ONLY on the actual dataset statistics provided above and use the available tools to perform real-time analysis.
            DO NOT make up data or provide generic answers not based on the actual dataset.
            Always prioritize insights based on the data over generic information.
            
            The user has asked: {query}
            """
            
            # Use the agent to process the query with rich context
            response = agent.query(context)
            return response.response
        except Exception as e:
            print(f"Agent query failed: {str(e)}")
            # Fall back to LLM directly if agent fails
            try:
                if is_ollama_running():
                    # Create context for direct LLM query
                    llm_context = f"""
                    You are an AI review analyst assistant. You're analyzing a dataset of Amazon product reviews with the following statistics:
                    - {num_reviews:,} reviews
                    - {num_products:,} unique products
                    - Average rating: {avg_rating:.2f}/5 stars
                    - Rating distribution: {', '.join([f"{rating} stars: {count:,}" for rating, count in rating_dist.items()])}
                    {"- Top categories: " + ', '.join([f"{cat} ({count:,})" for cat, count in categories.items()]) if categories else ""}
                    
                    Based ONLY on this real dataset, answer the following query. Do not make up information not based on this specific dataset.
                    """
                    
                    # Sample a few reviews to give the LLM context
                    sample_reviews = df.sample(min(3, len(df)))
                    reviews_context = "\nSample reviews from the dataset:\n"
                    for _, review in sample_reviews.iterrows():
                        reviews_context += f"- Product {review['asin']}: \"{review['summary']}\" (Rating: {review['overall']})\n"
                    
                    llm = Ollama(model="llama3", request_timeout=30.0)
                    response = llm.complete(f"{llm_context}{reviews_context}\n\nUser query: {query}")
                    return response.text.strip()
                else:
                    # Fall back to direct processing as last resort
                    return process_query_directly(query)
            except Exception as llm_error:
                print(f"LLM direct query failed: {str(llm_error)}")
                # Final fallback to direct processing
                return process_query_directly(query)
    else:
        # Try direct LLM if ReAct agent isn't available
        try:
            if is_ollama_running():
                # Create context for LLM query
                context = f"""
                You are an AI review analyst assistant analyzing a dataset of {num_reviews:,} Amazon product reviews across {num_products:,} products.
                The average rating is {avg_rating:.2f}/5 stars.
                Rating distribution: {', '.join([f"{rating} stars: {count:,}" for rating, count in rating_dist.items()])}
                {"Top categories: " + ', '.join([f"{cat} ({count:,})" for cat, count in categories.items()]) if categories else ""}
                
                Answer the following question based ONLY on this specific dataset. Be specific and data-driven in your response.
                """
                
                # Sample reviews for context
                sample_reviews = df.sample(min(5, len(df)))
                reviews_text = "\nSample reviews:\n"
                for _, review in sample_reviews.iterrows():
                    if 'reviewText' in review and isinstance(review['reviewText'], str):
                        reviews_text += f"- \"{review['summary']}\" (Rating: {review['overall']})\n"
                
                llm = Ollama(model="llama3", request_timeout=30.0)
                response = llm.complete(f"{context}{reviews_text}\n\nUser query: {query}")
                return response.text.strip()
        except Exception as e:
            print(f"LLM query failed: {str(e)}")
        
        # Use direct processing if all else fails
        return process_query_directly(query)

def analyze_review_sentiments(product_id=None):
    """
    Analyzes sentiment distribution across reviews for a product or all products
    
    Args:
        product_id (str, optional): Product ID to filter by
        
    Returns:
        dict: Sentiment analysis results
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No review data available. Please load data first.")
        
    # Filter by product ID if provided
    if product_id:
        filtered_df = df[df['asin'] == product_id]
        if len(filtered_df) == 0:
            return {"error": f"No reviews found for product ID: {product_id}"}
    else:
        filtered_df = df
    
    # Use the entire dataset for sentiment analysis
    result = analyze_sentiment(filtered_df)
    
    # Calculate additional sentiment metrics
    sentiment_counts = {
        "positive": len(filtered_df[filtered_df['sentiment_score'] > 0.05]),
        "neutral": len(filtered_df[(filtered_df['sentiment_score'] >= -0.05) & (filtered_df['sentiment_score'] <= 0.05)]),
        "negative": len(filtered_df[filtered_df['sentiment_score'] < -0.05])
    }
    
    # Calculate percentages
    total_reviews = len(filtered_df)
    sentiment_percentages = {
        "positive_pct": round(sentiment_counts["positive"] / total_reviews * 100, 1),
        "neutral_pct": round(sentiment_counts["neutral"] / total_reviews * 100, 1),
        "negative_pct": round(sentiment_counts["negative"] / total_reviews * 100, 1)
    }
    
    # Merge all results
    return {
        **result,
        "sentiment_counts": sentiment_counts,
        "sentiment_percentages": sentiment_percentages,
        "total_reviews": total_reviews
    }
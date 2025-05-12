"""
Review Visual Insights Module

This module provides AI-driven visualization functions specifically for review data analysis.
It works with the review_AI_Agent to generate meaningful visual insights from review data.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64
import traceback
from wordcloud import WordCloud, STOPWORDS
from sklearn.feature_extraction.text import CountVectorizer
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import re
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import Counter
import nltk

# Ensure NLTK resources are available
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Reference to the dataframe - will be set by the review_AI_Agent
df = None

def convert_numpy_types(obj):
    """
    Recursively converts NumPy types to Python native types for JSON serialization
    
    Args:
        obj: The object to convert
        
    Returns:
        The object with NumPy types converted to Python native types
    """
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return [convert_numpy_types(x) for x in obj.tolist()]
    elif isinstance(obj, list):
        return [convert_numpy_types(x) for x in obj]
    elif isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, pd.Series):
        return [convert_numpy_types(x) for x in obj.tolist()]
    elif isinstance(obj, pd.DataFrame):
        return obj.to_dict('records')
    elif isinstance(obj, (pd.Timestamp, pd.Period)):
        return str(obj)
    else:
        return obj

def set_dataframe(dataframe):
    """Set the dataframe for this module"""
    global df
    df = dataframe.copy()
    return df

def get_sentiment_distribution():
    """
    Calculate sentiment distribution using star ratings and return data for visualization
    
    Returns:
        dict: Chart data with labels, values, and metadata
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data available for analysis")
    
    if 'overall' not in df.columns:
        raise ValueError("Review rating column 'overall' not found")
    
    # Map ratings to sentiment categories
    sentiment_map = {
        1: 'Negative',
        2: 'Negative',
        3: 'Neutral',
        4: 'Positive',
        5: 'Positive'
    }
    
    # Calculate sentiment counts
    df_copy = df.copy()
    df_copy['sentiment'] = df_copy['overall'].map(lambda x: sentiment_map.get(x, 'Neutral'))
    sentiment_counts = df_copy['sentiment'].value_counts()
    
    # Create visualization data - convert numpy types to native Python
    chart_data = {
        'labels': sentiment_counts.index.tolist(),
        'values': [int(val) for val in sentiment_counts.values],  # Convert np.int64 to Python int
        'title': 'Review Sentiment Distribution',
        'description': 'Distribution of reviews by sentiment category based on star ratings',
        'type': 'pie',
        'colors': ['#4CAF50', '#FFC107', '#F44336']  # Positive, Neutral, Negative
    }
    
    return chart_data

def get_rating_distribution():
    """
    Calculate rating distribution and return data for visualization
    
    Returns:
        dict: Chart data with labels, values, and metadata
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data available for analysis")
    
    if 'overall' not in df.columns:
        raise ValueError("Review rating column 'overall' not found")
    
    # Calculate rating counts
    rating_counts = df['overall'].value_counts().sort_index()
    
    # Create visualization data - convert numpy types to native Python
    chart_data = {
        'labels': [f"{int(rating) if float(rating).is_integer() else float(rating)} Stars" for rating in rating_counts.index],
        'values': [int(val) for val in rating_counts.values],  # Convert np.int64 to Python int
        'title': 'Review Rating Distribution',
        'description': 'Number of reviews by star rating',
        'type': 'bar',
        'colors': ['#FFC107']  # Star color
    }
    
    return chart_data

def get_topic_distribution(num_topics=5):
    """
    Calculate topic distribution using NLP and return data for visualization
    
    Args:
        num_topics (int): Number of topics to extract
        
    Returns:
        dict: Chart data with labels, values, and metadata
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data available for analysis")
    
    if 'reviewText' not in df.columns:
        raise ValueError("Review text column 'reviewText' not found")
    
    # Get a sample of reviews for analysis
    sample_size = min(10000, len(df))
    reviews_sample = df.sample(n=sample_size, random_state=42)
    
    # Preprocess review text
    stop_words = set(stopwords.words('english'))
    stop_words.update(['product', 'amazon', 'review', 'star', 'item'])
    
    processed_reviews = []
    for text in reviews_sample['reviewText']:
        if isinstance(text, str):
            # Convert to lowercase and remove special characters
            text = re.sub(r'[^\w\s]', '', text.lower())
            # Tokenize
            tokens = word_tokenize(text)
            # Remove stopwords
            tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
            processed_reviews.append(' '.join(tokens))
    
    # Extract top terms using CountVectorizer
    vectorizer = CountVectorizer(max_features=100, stop_words='english', ngram_range=(1, 2))
    X = vectorizer.fit_transform(processed_reviews)
    
    # Get feature names
    feature_names = vectorizer.get_feature_names_out()
    
    # Calculate term frequencies
    term_freq = np.sum(X.toarray(), axis=0)
    
    # Get top terms
    top_indices = term_freq.argsort()[-num_topics:][::-1]
    top_terms = [feature_names[i] for i in top_indices]
    top_freqs = [int(term_freq[i]) for i in top_indices]  # Convert np.int64 to Python int
    
    # Create visualization data
    chart_data = {
        'labels': top_terms,
        'values': top_freqs,
        'title': 'Common Topics in Reviews',
        'description': 'Most frequently mentioned topics across all reviews',
        'type': 'bar',
        'colors': ['#3F51B5']  # Topic color
    }
    
    return chart_data

def get_sentiment_by_category():
    """
    Calculate sentiment breakdown by category and return data for visualization
    
    Returns:
        dict: Chart data with labels, values, and metadata
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data available for analysis")
    
    if 'overall' not in df.columns:
        raise ValueError("Review rating column 'overall' not found")
    
    if 'category' not in df.columns:
        raise ValueError("Category column not found")
    
    # Map ratings to sentiment categories
    df_copy = df.copy()
    df_copy['sentiment'] = pd.cut(
        df_copy['overall'],
        bins=[0, 2, 3.5, 5],
        labels=['Negative', 'Neutral', 'Positive']
    )
    
    # Group by category and sentiment, then count
    category_sentiment = df_copy.groupby(['category', 'sentiment']).size().unstack(fill_value=0)
    
    # Select top categories by review count
    top_categories = df_copy['category'].value_counts().head(10).index
    category_sentiment = category_sentiment.loc[top_categories]
    
    # Convert to list format for visualization
    chart_data = []
    for category in category_sentiment.index:
        for sentiment in ['Positive', 'Neutral', 'Negative']:
            if sentiment in category_sentiment.columns:
                count = int(category_sentiment.loc[category, sentiment])  # Convert np.int64 to Python int
                chart_data.append({
                    'category': str(category),  # Ensure category is a string
                    'sentiment': sentiment,
                    'count': count
                })
    
    # Create visualization data in grouped format
    result = {
        'data': chart_data,
        'keys': ['Positive', 'Neutral', 'Negative'],
        'title': 'Sentiment by Product Category',
        'description': 'Breakdown of positive, neutral and negative reviews by product category',
        'type': 'grouped-bar',
        'colors': ['#4CAF50', '#FFC107', '#F44336']  # Positive, Neutral, Negative
    }
    
    return result

def get_word_cloud(sentiment='positive'):
    """
    Generate word cloud data for specified sentiment
    
    Args:
        sentiment (str): 'positive', 'negative', or 'neutral'
        
    Returns:
        dict: Base64 encoded image data and metadata
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data available for analysis")
    
    if 'reviewText' not in df.columns:
        raise ValueError("Review text column 'reviewText' not found")
    
    if 'overall' not in df.columns:
        raise ValueError("Review rating column 'overall' not found")
    
    # Filter by sentiment
    df_copy = df.copy()
    if sentiment == 'positive':
        filtered_df = df_copy[df_copy['overall'] >= 4]
    elif sentiment == 'negative':
        filtered_df = df_copy[df_copy['overall'] <= 2]
    elif sentiment == 'neutral':
        filtered_df = df_copy[(df_copy['overall'] > 2) & (df_copy['overall'] < 4)]
    else:
        filtered_df = df_copy  # All reviews
    
    # Get sample for processing
    sample_size = min(5000, len(filtered_df))
    sample_df = filtered_df.sample(n=sample_size, random_state=42) if len(filtered_df) > sample_size else filtered_df
    
    # Combine all review text
    text = ' '.join(sample_df['reviewText'].dropna().astype(str))
    
    # Configure stop words
    stop_words = set(STOPWORDS)
    stop_words.update(['product', 'amazon', 'review', 'star', 'item', 'one', 'would', 'could', 'also'])
    
    # Generate word cloud with appropriate colors
    if sentiment == 'positive':
        colormap = 'Greens'
    elif sentiment == 'negative':
        colormap = 'Reds'
    else:
        colormap = 'Blues'
    
    wordcloud = WordCloud(
        width=800, 
        height=400, 
        background_color='white', 
        stopwords=stop_words, 
        max_words=100,
        colormap=colormap,
        collocations=False
    ).generate(text)
    
    # Convert to image
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title(f'{sentiment.capitalize()} Review Word Cloud', fontsize=16)
    
    # Save to bytesIO and convert to base64
    img_data = BytesIO()
    plt.savefig(img_data, format='png', dpi=150, bbox_inches='tight')
    img_data.seek(0)
    base64_img = base64.b64encode(img_data.read()).decode('utf-8')
    plt.close()
    
    return {
        'image': f"data:image/png;base64,{base64_img}",
        'sentiment': sentiment,
        'title': f'{sentiment.capitalize()} Review Word Cloud',
        'description': f'Most common words in {sentiment} reviews'
    }

def get_rating_trend():
    """
    Calculate rating trend over time and return data for visualization
    
    Returns:
        dict: Chart data with labels, values, and metadata
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data available for analysis")
    
    if 'overall' not in df.columns:
        raise ValueError("Review rating column 'overall' not found")
    
    # Check for date column
    date_column = None
    if 'reviewTime' in df.columns:
        date_column = 'reviewTime'
    elif 'unixReviewTime' in df.columns:
        date_column = 'unixReviewTime'
    
    if date_column is None:
        raise ValueError("No date column found in review data")
    
    # Process date
    df_copy = df.copy()
    if date_column == 'reviewTime':
        df_copy['review_date'] = pd.to_datetime(df_copy[date_column], errors='coerce')
    else:
        df_copy['review_date'] = pd.to_datetime(df_copy[date_column], unit='s', errors='coerce')
    
    # Remove invalid dates
    df_copy = df_copy.dropna(subset=['review_date'])
    
    if len(df_copy) == 0:
        raise ValueError("No valid dates in review data")
    
    # Group by month and calculate average rating
    df_copy['month'] = df_copy['review_date'].dt.to_period('M')
    monthly_ratings = df_copy.groupby('month')['overall'].mean()
    
    # Format months as strings
    months = [str(month) for month in monthly_ratings.index]
    
    # Convert numpy values to Python native types
    monthly_values = [float(val) for val in monthly_ratings.values]  # Convert np.float64 to Python float
    
    # Create visualization data
    chart_data = {
        'labels': months,
        'values': monthly_values,
        'title': 'Average Rating Over Time',
        'description': 'Trend of average review ratings by month',
        'type': 'line',
        'colors': ['#FF9800']  # Orange for rating trend
    }
    
    return chart_data

def get_all_visual_insights():
    """
    Generate a complete set of visual insights for review data
    
    Returns:
        dict: All visualization data
    """
    insights = {}
    
    try:
        insights['sentiment_distribution'] = get_sentiment_distribution()
    except Exception as e:
        print(f"Error generating sentiment distribution: {str(e)}")
    
    try:
        insights['rating_distribution'] = get_rating_distribution()
    except Exception as e:
        print(f"Error generating rating distribution: {str(e)}")
    
    try:
        insights['topic_distribution'] = get_topic_distribution()
    except Exception as e:
        print(f"Error generating topic distribution: {str(e)}")
        
    try:
        insights['sentiment_by_category'] = get_sentiment_by_category()
    except Exception as e:
        print(f"Error generating sentiment by category: {str(e)}")
    
    try:
        insights['positive_wordcloud'] = get_word_cloud('positive')
    except Exception as e:
        print(f"Error generating positive word cloud: {str(e)}")
    
    try:
        insights['negative_wordcloud'] = get_word_cloud('negative')
    except Exception as e:
        print(f"Error generating negative word cloud: {str(e)}")
    
    try:
        insights['rating_trend'] = get_rating_trend()
    except Exception as e:
        print(f"Error generating rating trend: {str(e)}")
    
    # Add ASIN summary for scatter plot
    try:
        insights['asin_summary'] = get_asin_summary_viz()
    except Exception as e:
        print(f"Error generating ASIN summary: {str(e)}")

    # Convert any remaining NumPy types to Python native types for JSON serialization
    return convert_numpy_types(insights)

def get_asin_summary_viz():
    """
    Calculates summary statistics (review count, average rating) for each ASIN 
    and formats it for visualization.

    Returns:
        dict: A dictionary containing the ASIN summary data list under the 'data' key,
              along with title, description, and type for visualization.
              Returns an empty dict if data is not available or columns are missing.
    """
    global df
    
    if df is None or len(df) == 0:
        print("Warning: DataFrame is empty or not loaded in get_asin_summary_viz.")
        return {}
        
    required_cols = ['asin', 'overall']
    if not all(col in df.columns for col in required_cols):
        print(f"Warning: Missing required columns for ASIN summary viz: {required_cols}. Available: {df.columns.tolist()}")
        return {}
        
    try:
        # Ensure 'overall' is numeric
        df_copy = df.copy()
        df_copy['overall'] = pd.to_numeric(df_copy['overall'], errors='coerce')
        df_filtered = df_copy.dropna(subset=['asin', 'overall']) # Drop rows where asin or overall is NaN
        
        # Group by ASIN and calculate count and mean rating
        asin_summary = df_filtered.groupby('asin').agg(
            review_count=('overall', 'count'),
            average_rating=('overall', 'mean')
        ).reset_index()
        
        # Rename columns for frontend consistency
        asin_summary.rename(columns={'asin': 'asin', 'review_count': 'reviewCount', 'average_rating': 'averageRating'}, inplace=True)

        # Convert to list of dictionaries (handling numpy types is done by the caller)
        summary_list = asin_summary.to_dict('records')
        
        # Limit the number of ASINs for performance if necessary (e.g., top 500 by review count)
        if len(summary_list) > 500:
             summary_list = sorted(summary_list, key=lambda x: x['reviewCount'], reverse=True)[:500]

        return {
            'data': summary_list,
            'title': 'ASIN Performance Scatter Plot',
            'description': 'Review count vs. Average rating for each product (ASIN)',
            'type': 'scatter' # Indicate chart type for frontend
        }
        
    except Exception as e:
        print(f"Error calculating ASIN summary viz: {str(e)}")
        traceback.print_exc()
        return {} 
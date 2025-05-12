import pandas as pd
import os
import sys
import requests
from llama_index.core.tools import FunctionTool
from llama_index.llms.ollama import Ollama
from llama_index.core.agent import ReActAgent
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import numpy as np

# Global variable to store DataFrame
df = None
model = None

# Function to load and concatenate data from multiple CSV files
def load_data(directory_or_files):
    """
    Loads CSV data from either:
    1. A directory containing CSV files
    2. A list of specific CSV file paths
    
    Args:
        directory_or_files (str or list): Either a path to directory containing CSV files 
                                         or a list of specific CSV file paths.
    
    Returns:
        pd.DataFrame: Concatenated DataFrame of all CSV data.
    """
    global df, model
    
    dfs = []
    
    # Check if input is a list of file paths or a directory
    if isinstance(directory_or_files, list):
        # It's a list of file paths
        csv_files = [f for f in directory_or_files if f.endswith('.csv')]
        if not csv_files:
            raise ValueError("No CSV files found in the provided file list.")
        
        print(f"Loading {len(csv_files)} CSV files directly from provided paths")
        for file_path in csv_files:
            try:
                file_df = pd.read_csv(file_path)
                dfs.append(file_df)
            except Exception as e:
                print(f"Error reading file {file_path}: {str(e)}")
    else:
        # It's a directory path
        if not os.path.isdir(directory_or_files):
            raise ValueError(f"The provided path '{directory_or_files}' is not a valid directory.")
            
        csv_files = [f for f in os.listdir(directory_or_files) if f.endswith('.csv')]
        if not csv_files:
            raise ValueError("No CSV files found in the specified directory.")
        
        for file_name in csv_files:
            try:
                file_path = os.path.join(directory_or_files, file_name)
                file_df = pd.read_csv(file_path)
                dfs.append(file_df)
            except Exception as e:
                print(f"Error reading file {file_name}: {str(e)}")
    
    if not dfs:
        raise ValueError("Failed to load any valid CSV data.")
        
    df = pd.concat(dfs, ignore_index=True)
    
    # Print available columns for debugging
    print(f"Available columns: {df.columns.tolist()}")
    
    # Check for required numerical columns
    required_numerical = ['quantity', 'price', 'discount', 'total_amount']
    missing_numerical = [col for col in required_numerical if col not in df.columns]
    if missing_numerical:
        raise ValueError(f"Missing required numerical columns: {missing_numerical}")
    
    # Check for time-related columns with more flexibility
    has_timestamp = 'timestamp' in df.columns
    has_transaction_timestamp = 'transaction_timestamp' in df.columns
    has_transaction = 'transaction' in df.columns
    
    if not (has_timestamp or has_transaction_timestamp):
        # If neither standard timestamp column exists, look for any column with 'date' or 'time' in the name
        time_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        if time_cols:
            print(f"Using {time_cols[0]} as the timestamp column")
            # Rename the first matching column to 'timestamp'
            df = df.rename(columns={time_cols[0]: 'timestamp'})
            has_timestamp = True
        else:
            print("Warning: No timestamp column found. Time-based analysis will be limited.")
    
    # Parse timestamp and extract year
    process_dataframe(df)
    
    # Train model
    train_prediction_model()
    
    return df

# Function to set the dataframe directly
def set_dataframe(dataframe):
    """
    Sets the dataframe directly instead of loading from files.
    
    Args:
        dataframe (pd.DataFrame): The dataframe to use for analysis.
    
    Returns:
        pd.DataFrame: The processed dataframe.
    """
    global df, model
    
    df = dataframe.copy()
    
    # Process the dataframe
    process_dataframe(df)
    
    # Train model
    train_prediction_model()
    
    return df

# Process the dataframe (timestamp conversion, etc.)
def process_dataframe(dataframe):
    """
    Process a dataframe to prepare it for analysis.
    
    Args:
        dataframe (pd.DataFrame): The dataframe to process.
    """
    global df
    
    # Parse timestamp and extract year - handle with more flexibility
    if 'transaction_timestamp' in dataframe.columns:
        # Case: Combined column
        dataframe['transaction_timestamp'] = pd.to_datetime(dataframe['transaction_timestamp'], errors='coerce')
        dataframe['year'] = dataframe['transaction_timestamp'].dt.year
    elif 'timestamp' in dataframe.columns:
        # Case: Only timestamp column
        dataframe['timestamp'] = pd.to_datetime(dataframe['timestamp'], errors='coerce')
        dataframe['year'] = dataframe['timestamp'].dt.year
    else:
        # Fallback: No time column available
        dataframe['year'] = 2023  # Default year
        print("Warning: No valid timestamp column found. Using default year value.")

    # Handle missing values in key numerical columns only
    # Check if these columns exist first
    numerical_cols = ['quantity', 'price', 'discount', 'total_amount']
    existing_cols = [col for col in numerical_cols if col in dataframe.columns]
    
    if existing_cols:
        dataframe.dropna(subset=existing_cols, inplace=True)

# Train the prediction model
def train_prediction_model():
    """
    Train the prediction model based on the current dataframe.
    """
    global df, model
    
    if df is None or len(df) == 0:
        print("Warning: No data available for training model")
        return
        
    # Check if necessary columns exist
    required_cols = ['quantity', 'price', 'discount', 'total_amount']
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        print(f"Warning: Cannot train prediction model, missing columns: {missing_cols}")
        return
    
    # Train a prediction model using numerical features to predict 'total_amount'
    X = df[['quantity', 'price', 'discount']]  # Features for prediction
    y = df['total_amount']  # Target variable
    
    # Split data for training
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Create and train the model
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    print("Prediction model trained successfully")

# Check if Ollama is running
def is_ollama_running():
    try:
        response = requests.get("http://localhost:11434/api/version", timeout=2)
        return response.status_code == 200
    except requests.RequestException:
        return False

# Initialize with sample data if no data is loaded yet
def initialize_with_sample_data():
    """
    DEPRECATED: Synthetic data generation is completely disabled.
    This function will always raise an error as synthetic data is not allowed per company policy.
    All analyses must use actual customer data that has been properly uploaded.
    """
    global df, model
    
    if df is None:
        print("ERROR: No data loaded and synthetic data generation is disabled")
        raise ValueError("No data is available. Please upload real data for analysis. Synthetic data generation is not allowed per company policy.")

# Define analysis tools - these functions will use the global dataframe
def summary_statistics():
    """
    Calculates summary statistics for numerical columns in the DataFrame.
    
    Returns:
        pandas.DataFrame: Summary statistics as a DataFrame.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload real data for analysis.")
        
    numerical_cols = df.select_dtypes(include=['float64', 'int64']).columns
    stats = df[numerical_cols].describe()
    return stats  # Return the actual DataFrame

def group_by_feature(feature, aggregate_col, aggregate_func='mean'):
    """
    Groups the data by a specified feature and calculates an aggregate on another column.
    
    Args:
        feature (str): Column name to group by.
        aggregate_col (str): Column name to aggregate.
        aggregate_func (str): Aggregation function (e.g., 'mean', 'sum').
    
    Returns:
        pandas.Series: Grouped data as a pandas Series.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload real data for analysis.")
        
    if feature not in df.columns or aggregate_col not in df.columns:
        print(f"Invalid feature or aggregate column. Available columns: {df.columns.tolist()}")
        # Return an empty Series if the columns don't exist
        return pd.Series()
        
    grouped = df.groupby(feature)[aggregate_col].agg(aggregate_func)
    return grouped  # Return the actual pandas Series object

def predict_total(c_quantity, price, discount):
    """
    Predicts the total sales amount based on quantity, price, and discount.
    
    Args:
        c_quantity (int): Quantity of items.
        price (float): Price per item.
        discount (float): Discount percentage as a decimal.
    
    Returns:
        float: Predicted total sales amount.
    """
    global model, df
    
    if model is None:
        if df is None or len(df) == 0:
            raise ValueError("No data is available. Please upload real data for analysis.")
        else:
            train_prediction_model()
            
    if model is None:
        return "Prediction model not available"
        
    input_data = pd.DataFrame([[float(c_quantity), float(price), float(discount)]], 
                             columns=['quantity', 'price', 'discount'])
    prediction = model.predict(input_data)
    return float(prediction[0])

def analyze_sales_trend():
    """
    Analyzes the sales trend over time based on the timestamp column.
    
    Returns:
        dict: Dictionary with 'labels' and 'values' for chart visualization.
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload real data for analysis.")
    
    # Ensure result is a dictionary with labels and values
    result = {
        'labels': [],
        'values': []
    }
    
    # Determine time column
    time_col = None
    for col in ['transaction_timestamp', 'timestamp']:
        if col in df.columns:
            time_col = col
            break
    
    # If we don't have a time column, return empty result
    if not time_col:
        return result
    
    # Convert to datetime
    df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
    
    # Group by month-year and sum total_amount
    df['month_year'] = df[time_col].dt.strftime('%Y-%m')
    monthly_sales = df.groupby('month_year')['total_amount'].sum().reset_index()
    
    # Sort by month-year
    monthly_sales = monthly_sales.sort_values('month_year')
    
    # Extract labels and values for chart visualization
    result['labels'] = monthly_sales['month_year'].tolist()
    result['values'] = monthly_sales['total_amount'].tolist()
    
    return result

def analyze_comprehensive_sales(query_type='overview'):
    """
    Performs a comprehensive analysis of sales data based on the query type.
    
    Args:
        query_type (str): Type of analysis to perform ('overview', 'categories', 'trends', 
                         'demographics', 'recommendations', etc.)
    
    Returns:
        str: Detailed markdown-formatted analysis
    """
    global df
    
    if df is None or len(df) == 0:
        raise ValueError("No data is available. Please upload real data for analysis.")
    
    # Extract key metrics
    total_sales = df['total_amount'].sum()
    avg_order_value = df['total_amount'].mean()
    transaction_count = len(df)
    
    # Initialize response
    analysis = ""
    
    # Perform different analyses based on query type
    if query_type == 'overview' or query_type == 'complete':
        # General overview with all key metrics
        analysis += f"## Sales Data Overview\n\n"
        analysis += f"The dataset contains **{transaction_count:,}** transactions with a total sales value of **${total_sales:,.2f}**. "
        analysis += f"The average order value is **${avg_order_value:.2f}**.\n\n"
        
        # Add category analysis
        if 'product_category' in df.columns:
            analysis += "## Product Category Analysis\n\n"
            cat_sales = df.groupby('product_category')['total_amount'].agg(['sum', 'count']).reset_index()
            cat_sales = cat_sales.sort_values('sum', ascending=False)
            
            # Calculate percentages
            cat_sales['percent'] = (cat_sales['sum'] / total_sales * 100)
            
            # Top categories
            top_cats = cat_sales.head(3)
            analysis += "### Top Categories by Revenue\n\n"
            for _, row in top_cats.iterrows():
                analysis += f"- **{row['product_category']}**: ${row['sum']:,.2f} ({row['percent']:.1f}% of total revenue) from {row['count']:,} transactions\n"
            
            analysis += "\n"
        
        # Add time-based analysis
        if 'timestamp' in df.columns:
            analysis += "## Sales Trends\n\n"
            
            # Convert to datetime to ensure proper analysis
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Monthly trend
            df['month_year'] = df['timestamp'].dt.strftime('%Y-%m')
            monthly_sales = df.groupby('month_year')['total_amount'].sum().reset_index()
            
            # Calculate month-over-month growth
            if len(monthly_sales) > 1:
                current = monthly_sales.iloc[-1]['total_amount']
                previous = monthly_sales.iloc[-2]['total_amount']
                growth = ((current - previous) / previous) * 100 if previous > 0 else 0
                
                growth_text = "increased" if growth > 0 else "decreased"
                analysis += f"Month-over-month sales have **{growth_text} by {abs(growth):.1f}%** "
                analysis += f"(${current:,.2f} vs ${previous:,.2f}).\n\n"
            
            # Day of week analysis
            df['day_of_week'] = df['timestamp'].dt.day_name()
            dow_sales = df.groupby('day_of_week')['total_amount'].sum().reindex([
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
            ])
            best_day = dow_sales.idxmax()
            worst_day = dow_sales.idxmin()
            
            analysis += f"Best performing day is **{best_day}** (${dow_sales[best_day]:,.2f}), while "
            analysis += f"**{worst_day}** (${dow_sales[worst_day]:,.2f}) has the lowest sales.\n\n"
        
        # Customer demographics
        if 'customer_age' in df.columns and 'customer_gender' in df.columns:
            analysis += "## Customer Demographics\n\n"
            
            # Age group analysis
            df['age_group'] = pd.cut(
                df['customer_age'], 
                bins=[0, 18, 25, 35, 50, 65, 120],
                labels=['Under 18', '18-24', '25-34', '35-49', '50-64', '65+']
            )
            age_sales = df.groupby('age_group')['total_amount'].sum().reset_index()
            top_age = age_sales.loc[age_sales['total_amount'].idxmax()]
            
            analysis += f"The **{top_age['age_group']}** age group drives the most revenue "
            analysis += f"(${top_age['total_amount']:,.2f}).\n\n"
            
            # Gender analysis
            gender_sales = df.groupby('customer_gender')['total_amount'].sum().reset_index()
            gender_sales['percent'] = (gender_sales['total_amount'] / total_sales * 100)
            
            analysis += "### Gender Distribution\n\n"
            for _, row in gender_sales.iterrows():
                analysis += f"- **{row['customer_gender']}**: ${row['total_amount']:,.2f} ({row['percent']:.1f}%)\n"
            
            analysis += "\n"
        
        # Add recommendations section
        analysis += "## Recommendations\n\n"
        analysis += "Based on the analysis, consider implementing the following strategies:\n\n"
        
        if 'product_category' in df.columns:
            top_cat = cat_sales.iloc[0]['product_category']
            analysis += f"1. **Focus on {top_cat}**: Invest more marketing budget in your top-performing category\n"
            
            # If we have subcategories
            if 'product_subcategory' in df.columns:
                subcat_sales = df.groupby(['product_category', 'product_subcategory'])['total_amount'].sum().reset_index()
                subcat_sales = subcat_sales.sort_values('total_amount', ascending=False)
                top_subcat = subcat_sales.iloc[0]
                
                analysis += f"2. **Promote {top_subcat['product_subcategory']}**: This subcategory in {top_subcat['product_category']} "
                analysis += f"generates ${top_subcat['total_amount']:,.2f} in revenue\n"
            else:
                analysis += f"2. **Bundle products**: Create product bundles with items from {top_cat} to increase average order value\n"
        
        if 'customer_age' in df.columns and 'customer_gender' in df.columns:
            analysis += f"3. **Target {top_age['age_group']} demographic**: This is your highest-value customer segment\n"
        
        if 'timestamp' in df.columns:
            analysis += f"4. **Optimize for {best_day}**: Schedule promotions and email campaigns for your highest-performing day\n"
        
        analysis += f"5. **Increase average order value**: Current AOV is ${avg_order_value:.2f} - implement cross-selling strategies to grow this metric\n"
    
    elif query_type == 'categories':
        # Detailed category analysis
        if 'product_category' in df.columns:
            analysis += "## Product Category Analysis\n\n"
            
            # Basic category stats
            cat_sales = df.groupby('product_category').agg({
                'total_amount': ['sum', 'mean'],
                'transaction_id': 'count'
            }).reset_index()
            
            cat_sales.columns = ['product_category', 'total_revenue', 'avg_order_value', 'transaction_count']
            cat_sales = cat_sales.sort_values('total_revenue', ascending=False)
            
            # Calculate market share
            cat_sales['market_share'] = cat_sales['total_revenue'] / cat_sales['total_revenue'].sum() * 100
            
            # Create the category breakdown table
            analysis += "### Category Revenue Breakdown\n\n"
            analysis += "| Category | Revenue | Market Share | Transactions | Avg Order Value |\n"
            analysis += "|----------|---------|--------------|--------------|----------------|\n"
            
            for _, row in cat_sales.iterrows():
                analysis += f"| {row['product_category']} | ${row['total_revenue']:,.2f} | {row['market_share']:.1f}% | "
                analysis += f"{row['transaction_count']:,} | ${row['avg_order_value']:.2f} |\n"
            
            analysis += "\n"
            
            # Top-performing category deep dive
            top_cat = cat_sales.iloc[0]['product_category']
            top_cat_data = df[df['product_category'] == top_cat]
            
            analysis += f"### Deep Dive: {top_cat}\n\n"
            
            # Customer demographics for top category
            if 'customer_age' in df.columns:
                top_cat_age = pd.cut(
                    top_cat_data['customer_age'], 
                    bins=[0, 18, 25, 35, 50, 65, 120],
                    labels=['Under 18', '18-24', '25-34', '35-49', '50-64', '65+']
                )
                age_dist = top_cat_age.value_counts(normalize=True) * 100
                
                analysis += "#### Customer Age Distribution\n\n"
                for age_group, percentage in age_dist.items():
                    analysis += f"- {age_group}: {percentage:.1f}%\n"
                
                analysis += "\n"
            
            # Subcategory analysis if available
            if 'product_subcategory' in df.columns:
                subcat_sales = top_cat_data.groupby('product_subcategory')['total_amount'].sum().reset_index()
                subcat_sales = subcat_sales.sort_values('total_amount', ascending=False)
                
                analysis += "#### Top Subcategories\n\n"
                for _, row in subcat_sales.head(5).iterrows():
                    subcat_percent = row['total_amount'] / top_cat_data['total_amount'].sum() * 100
                    analysis += f"- {row['product_subcategory']}: ${row['total_amount']:,.2f} ({subcat_percent:.1f}% of category revenue)\n"
            
            # Key insights for category improvement
            analysis += "\n### Category Insights\n\n"
            analysis += f"1. **{top_cat} dominates sales** with {cat_sales.iloc[0]['market_share']:.1f}% market share\n"
            
            if len(cat_sales) > 2:
                lowest_cat = cat_sales.iloc[-1]['product_category']
                lowest_share = cat_sales.iloc[-1]['market_share']
                analysis += f"2. **{lowest_cat} underperforms** with only {lowest_share:.1f}% market share\n"
            
            # Add category-specific recommendations
            analysis += "\n### Category Recommendations\n\n"
            analysis += f"1. Continue to capitalize on {top_cat}'s strong performance\n"
            
            if len(cat_sales) > 2:
                analysis += f"2. Evaluate the product mix and marketing for {lowest_cat}\n"
            
            analysis += f"3. Consider phasing out or revitalizing categories with less than 5% market share\n"
            analysis += f"4. Explore cross-category promotions to increase exposure for lower-performing categories\n"
    
    elif query_type == 'trends':
        # Time-based trend analysis
        if 'timestamp' in df.columns:
            # Convert timestamp to datetime
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            analysis += "## Sales Trend Analysis\n\n"
            
            # Time-based aggregations
            df['year'] = df['timestamp'].dt.year
            df['month'] = df['timestamp'].dt.month
            df['day'] = df['timestamp'].dt.day
            df['day_of_week'] = df['timestamp'].dt.day_name()
            df['hour'] = df['timestamp'].dt.hour
            df['month_year'] = df['timestamp'].dt.strftime('%Y-%m')
            
            # Monthly trend
            monthly_sales = df.groupby('month_year')['total_amount'].sum().reset_index()
            
            analysis += "### Monthly Sales Trend\n\n"
            analysis += "| Month | Revenue | Month-over-Month Change |\n"
            analysis += "|-------|---------|------------------------|\n"
            
            prev_month_sales = None
            for i, row in monthly_sales.iterrows():
                if i > 0:
                    mom_change = ((row['total_amount'] - prev_month_sales) / prev_month_sales) * 100
                    mom_symbol = "📈" if mom_change > 0 else "📉"
                    analysis += f"| {row['month_year']} | ${row['total_amount']:,.2f} | {mom_symbol} {mom_change:.1f}% |\n"
                else:
                    analysis += f"| {row['month_year']} | ${row['total_amount']:,.2f} | - |\n"
                
                prev_month_sales = row['total_amount']
            
            analysis += "\n"
            
            # Day of week analysis
            dow_sales = df.groupby('day_of_week')['total_amount'].agg(['sum', 'mean']).reset_index()
            dow_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            dow_sales['day_of_week'] = pd.Categorical(dow_sales['day_of_week'], categories=dow_order, ordered=True)
            dow_sales = dow_sales.sort_values('day_of_week')
            
            analysis += "### Day of Week Analysis\n\n"
            analysis += "| Day | Total Revenue | Average Daily Revenue |\n"
            analysis += "|-----|---------------|----------------------|\n"
            
            for _, row in dow_sales.iterrows():
                analysis += f"| {row['day_of_week']} | ${row['sum']:,.2f} | ${row['mean']:,.2f} |\n"
            
            analysis += "\n"
            
            # Seasonality detection
            if len(monthly_sales) >= 12:  # Need at least a year of data
                df['month_num'] = df['timestamp'].dt.month
                monthly_avg = df.groupby('month_num')['total_amount'].mean().reset_index()
                
                high_season_months = monthly_avg.nlargest(3, 'total_amount')['month_num'].tolist()
                low_season_months = monthly_avg.nsmallest(3, 'total_amount')['month_num'].tolist()
                
                month_names = {
                    1: 'January', 2: 'February', 3: 'March', 4: 'April', 
                    5: 'May', 6: 'June', 7: 'July', 8: 'August',
                    9: 'September', 10: 'October', 11: 'November', 12: 'December'
                }
                
                high_season = ', '.join([month_names[m] for m in high_season_months])
                low_season = ', '.join([month_names[m] for m in low_season_months])
                
                analysis += "### Seasonality Patterns\n\n"
                analysis += f"- **Peak season months**: {high_season}\n"
                analysis += f"- **Low season months**: {low_season}\n\n"
            
            # Growth analysis and forecasting
            if len(monthly_sales) > 2:
                # Calculate overall growth rate
                first_month = monthly_sales.iloc[0]['total_amount']
                last_month = monthly_sales.iloc[-1]['total_amount']
                num_months = len(monthly_sales) - 1
                
                monthly_growth_rate = ((last_month / first_month) ** (1/num_months)) - 1
                annual_growth_rate = ((1 + monthly_growth_rate) ** 12) - 1
                
                analysis += "### Growth Analysis\n\n"
                analysis += f"- Monthly growth rate: {monthly_growth_rate * 100:.2f}%\n"
                analysis += f"- Annualized growth rate: {annual_growth_rate * 100:.2f}%\n\n"
                
                # Simple forecast for next 3 months
                next_month_forecast = last_month * (1 + monthly_growth_rate)
                three_month_forecast = last_month * ((1 + monthly_growth_rate) ** 3)
                
                analysis += "### Sales Forecast\n\n"
                analysis += f"- Next month forecast: ${next_month_forecast:,.2f}\n"
                analysis += f"- Three month forecast: ${three_month_forecast:,.2f}\n\n"
            
            # Trend-based recommendations
            analysis += "### Trend-Based Recommendations\n\n"
            
            if len(monthly_sales) > 2:
                if monthly_growth_rate > 0:
                    analysis += f"1. **Capitalize on growth**: Reinvest {(monthly_growth_rate * 100):.1f}% of revenue into marketing to maintain momentum\n"
                else:
                    analysis += "1. **Address declining sales**: Investigate root causes and implement recovery strategies\n"
            
            best_day = dow_sales.loc[dow_sales['sum'].idxmax()]['day_of_week']
            worst_day = dow_sales.loc[dow_sales['sum'].idxmin()]['day_of_week']
            
            analysis += f"2. **Optimize for {best_day}**: Schedule key promotional activities on your highest-performing day\n"
            analysis += f"3. **Boost {worst_day} performance**: Create special offers or loyalty programs specific to your lowest-performing day\n"
            
            if len(monthly_sales) >= 12:
                analysis += f"4. **Prepare for seasonality**: Increase inventory and marketing budget before {high_season}\n"
                analysis += f"5. **Plan for low season**: Develop strategies to boost sales during {low_season}\n"
        else:
            analysis += "## Trend Analysis\n\n"
            analysis += "Unable to perform trend analysis because the timestamp column is missing from the data.\n"
    
    elif query_type == 'demographics':
        # Customer demographics analysis
        if 'customer_age' in df.columns or 'customer_gender' in df.columns or 'customer_location' in df.columns:
            analysis += "## Customer Demographics Analysis\n\n"
            
            # Age analysis
            if 'customer_age' in df.columns:
                # Create age groups
                df['age_group'] = pd.cut(
                    df['customer_age'], 
                    bins=[0, 18, 25, 35, 50, 65, 120],
                    labels=['Under 18', '18-24', '25-34', '35-49', '50-64', '65+']
                )
                
                # Analyze by age group
                age_metrics = df.groupby('age_group').agg({
                    'total_amount': ['sum', 'mean'],
                    'transaction_id': 'count'
                }).reset_index()
                
                age_metrics.columns = ['age_group', 'total_revenue', 'avg_order_value', 'transaction_count']
                
                # Calculate percentage
                age_metrics['revenue_percent'] = age_metrics['total_revenue'] / age_metrics['total_revenue'].sum() * 100
                age_metrics['transaction_percent'] = age_metrics['transaction_count'] / age_metrics['transaction_count'].sum() * 100
                
                analysis += "### Customer Age Analysis\n\n"
                analysis += "| Age Group | Revenue | % of Revenue | Transactions | % of Transactions | AOV |\n"
                analysis += "|-----------|---------|--------------|--------------|-------------------|-----|\n"
                
                for _, row in age_metrics.iterrows():
                    analysis += f"| {row['age_group']} | ${row['total_revenue']:,.2f} | {row['revenue_percent']:.1f}% | "
                    analysis += f"{row['transaction_count']:,} | {row['transaction_percent']:.1f}% | ${row['avg_order_value']:.2f} |\n"
                
                # Identify highest value age group
                top_revenue_age = age_metrics.loc[age_metrics['total_revenue'].idxmax()]
                top_aov_age = age_metrics.loc[age_metrics['avg_order_value'].idxmax()]
                
                analysis += "\n"
                analysis += f"- The **{top_revenue_age['age_group']}** group generates the most revenue (${top_revenue_age['total_revenue']:,.2f})\n"
                analysis += f"- The **{top_aov_age['age_group']}** group has the highest average order value (${top_aov_age['avg_order_value']:.2f})\n\n"
            
            # Gender analysis
            if 'customer_gender' in df.columns:
                gender_metrics = df.groupby('customer_gender').agg({
                    'total_amount': ['sum', 'mean'],
                    'transaction_id': 'count'
                }).reset_index()
                
                gender_metrics.columns = ['gender', 'total_revenue', 'avg_order_value', 'transaction_count']
                
                # Calculate percentages
                gender_metrics['revenue_percent'] = gender_metrics['total_revenue'] / gender_metrics['total_revenue'].sum() * 100
                
                analysis += "### Gender Distribution\n\n"
                for _, row in gender_metrics.iterrows():
                    analysis += f"- **{row['gender']}**: ${row['total_revenue']:,.2f} ({row['revenue_percent']:.1f}% of revenue), "
                    analysis += f"Avg. Order: ${row['avg_order_value']:.2f}, Transactions: {row['transaction_count']:,}\n"
                
                analysis += "\n"
            
            # Location analysis
            if 'customer_location' in df.columns:
                location_metrics = df.groupby('customer_location').agg({
                    'total_amount': ['sum', 'mean'],
                    'transaction_id': 'count'
                }).reset_index()
                
                location_metrics.columns = ['location', 'total_revenue', 'avg_order_value', 'transaction_count']
                location_metrics = location_metrics.sort_values('total_revenue', ascending=False)
                
                # Calculate percentages
                location_metrics['revenue_percent'] = location_metrics['total_revenue'] / location_metrics['total_revenue'].sum() * 100
                
                analysis += "### Top Customer Locations\n\n"
                for _, row in location_metrics.head(5).iterrows():
                    analysis += f"- **{row['location']}**: ${row['total_revenue']:,.2f} ({row['revenue_percent']:.1f}% of revenue)\n"
                
                analysis += "\n"
            
            # Cross-analysis (Age + Gender if available)
            if 'customer_age' in df.columns and 'customer_gender' in df.columns:
                # Only do this for the top genders to avoid too much data
                top_genders = gender_metrics.head(2)['gender'].tolist()
                
                analysis += "### Age and Gender Segments\n\n"
                
                for gender in top_genders:
                    gender_df = df[df['customer_gender'] == gender]
                    
                    # Top age group for this gender
                    gender_age_revenue = gender_df.groupby('age_group')['total_amount'].sum()
                    top_age = gender_age_revenue.idxmax()
                    
                    analysis += f"- **{gender}**: Highest revenue from **{top_age}** age group (${gender_age_revenue[top_age]:,.2f})\n"
                
                analysis += "\n"
            
            # Demographic recommendations
            analysis += "### Demographic-Based Recommendations\n\n"
            
            if 'customer_age' in df.columns:
                analysis += f"1. **Target {top_revenue_age['age_group']} customers** with personalized marketing campaigns\n"
                analysis += f"2. **Increase AOV for {top_revenue_age['age_group']} customers** through targeted upselling\n"
            
            if 'customer_gender' in df.columns and len(gender_metrics) > 1:
                lowest_gender = gender_metrics.loc[gender_metrics['total_revenue'].idxmin()]['gender']
                analysis += f"3. **Develop products/campaigns for {lowest_gender} customers** to balance revenue distribution\n"
            
            if 'customer_location' in df.columns:
                top_location = location_metrics.iloc[0]['location']
                analysis += f"4. **Leverage success in {top_location}** by replicating strategies in similar markets\n"
                
                # If we have more than 5 locations
                if len(location_metrics) > 5:
                    bottom_locations = location_metrics.tail(len(location_metrics) - 5)
                    bottom_rev_pct = bottom_locations['total_revenue'].sum() / location_metrics['total_revenue'].sum() * 100
                    analysis += f"5. **Evaluate underperforming locations** - {len(bottom_locations)} locations only contribute {bottom_rev_pct:.1f}% of revenue\n"
        else:
            analysis += "## Customer Demographics Analysis\n\n"
            analysis += "Unable to perform demographics analysis because required columns (customer_age, customer_gender, customer_location) are missing from the data.\n"
    
    elif query_type == 'recommendations':
        # Actionable recommendations based on data analysis
        analysis += "## Actionable Recommendations to Improve Sales\n\n"
        
        # Get some basic metrics for recommendations
        if 'product_category' in df.columns:
            cat_sales = df.groupby('product_category')['total_amount'].sum().reset_index()
            cat_sales = cat_sales.sort_values('total_amount', ascending=False)
            top_category = cat_sales.iloc[0]['product_category']
            
            if len(cat_sales) > 1:
                bottom_category = cat_sales.iloc[-1]['product_category']
        
        if 'customer_age' in df.columns:
            df['age_group'] = pd.cut(
                df['customer_age'], 
                bins=[0, 18, 25, 35, 50, 65, 120],
                labels=['Under 18', '18-24', '25-34', '35-49', '50-64', '65+']
            )
            age_sales = df.groupby('age_group')['total_amount'].sum().reset_index()
            top_age = age_sales.loc[age_sales['total_amount'].idxmax()]['age_group']
        
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['day_of_week'] = df['timestamp'].dt.day_name()
            dow_sales = df.groupby('day_of_week')['total_amount'].sum()
            best_day = dow_sales.idxmax()
        
        # Product recommendations
        analysis += "### Product and Category Strategy\n\n"
        
        if 'product_category' in df.columns:
            analysis += f"1. **Expand {top_category} offerings**: Since this is your top-performing category, invest in expanding product lines\n"
            
            if len(cat_sales) > 1:
                analysis += f"2. **Revitalize {bottom_category}**: Conduct customer research to understand why this category underperforms\n"
            
            # If we have product-level data
            if 'product_id' in df.columns:
                product_sales = df.groupby('product_id')['total_amount'].sum().reset_index()
                product_sales = product_sales.sort_values('total_amount', ascending=False)
                
                # Check for products that appear frequently together
                if len(df) > 1000:  # Only do this analysis for larger datasets
                    analysis += "3. **Implement product bundling**: Bundle your top-selling products with complementary items\n"
                    analysis += "4. **Optimize product placement**: Ensure your top 20% of products are prominently displayed\n"
        
        # Pricing and promotion recommendations
        analysis += "\n### Pricing and Promotion Strategy\n\n"
        
        if 'discount' in df.columns:
            # Analyze impact of discounts on sales
            df['has_discount'] = df['discount'] > 0
            discount_impact = df.groupby('has_discount').agg({
                'total_amount': ['mean', 'sum'],
                'transaction_id': 'count'
            })
            
            if True in discount_impact.index:
                discounted_aov = discount_impact.loc[True, ('total_amount', 'mean')]
                regular_aov = discount_impact.loc[False, ('total_amount', 'mean')] if False in discount_impact.index else 0
                
                if regular_aov > 0:
                    discount_effect = ((discounted_aov - regular_aov) / regular_aov) * 100
                    
                    if discount_effect > 0:
                        analysis += "1. **Continue discount strategy**: Your discounted items have a higher average order value\n"
                    else:
                        analysis += "1. **Rethink discount strategy**: Your discounts may be cannibalizing revenue\n"
        
        analysis += "2. **Implement dynamic pricing**: Adjust prices based on demand, time of day, or customer segments\n"
        analysis += "3. **Create loyalty program tiers**: Reward high-value customers with exclusive benefits\n"
        
        # Marketing recommendations
        analysis += "\n### Marketing and Customer Engagement\n\n"
        
        if 'customer_age' in df.columns:
            analysis += f"1. **Target {top_age} demographic**: Customize marketing campaigns for your highest-value age group\n"
        
        if 'timestamp' in df.columns:
            analysis += f"2. **Schedule campaigns on {best_day}**: Align email and social media campaigns with your best-performing day\n"
        
        analysis += "3. **Implement a win-back campaign**: Target customers who haven't purchased in 90+ days\n"
        analysis += "4. **Develop a referral program**: Incentivize existing customers to refer new customers\n"
        
        # Operations recommendations
        analysis += "\n### Operational Improvements\n\n"
        
        analysis += "1. **Optimize inventory management**: Ensure top-selling products are always in stock\n"
        analysis += "2. **Streamline checkout process**: Reduce cart abandonment by simplifying the buying experience\n"
        analysis += "3. **Improve customer service**: Implement a customer feedback system to identify pain points\n"
        analysis += "4. **Enhance data analytics**: Set up automatic alerts for sales anomalies and trends\n"
        
        # Implementation roadmap
        analysis += "\n### Implementation Roadmap\n\n"
        
        analysis += "**Immediate Actions (Next 30 Days):**\n"
        analysis += "- Audit current product offerings and identify gaps\n"
        analysis += "- Analyze customer feedback for quick wins\n"
        analysis += "- Implement one high-impact promotion\n\n"
        
        analysis += "**Short-Term (60-90 Days):**\n"
        analysis += "- Launch targeted marketing campaigns for key customer segments\n"
        analysis += "- Optimize pricing strategy based on data analysis\n"
        analysis += "- Improve inventory management for top-selling products\n\n"
        
        analysis += "**Long-Term (90+ Days):**\n"
        analysis += "- Develop and roll out customer loyalty program\n"
        analysis += "- Implement advanced analytics for predictive sales forecasting\n"
        analysis += "- Explore new markets or product categories based on customer data\n"
    
    return analysis

# Enhance process_query_directly to use the comprehensive analysis function
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
        return "No data is available. Please upload real data for analysis. Synthetic data generation is disabled."
        
    query = query.lower()
    
    # Map common query types to analysis functions
    if any(term in query for term in ["overview", "complete analysis", "comprehensive", "tell me about", "summary"]):
        return analyze_comprehensive_sales('overview')
    
    elif any(term in query for term in ["category", "categories", "product", "products", "top-selling", "best seller"]):
        return analyze_comprehensive_sales('categories')
    
    elif any(term in query for term in ["trend", "overtime", "over time", "pattern", "forecast", "predict"]):
        return analyze_comprehensive_sales('trends')
    
    elif any(term in query for term in ["demographic", "customer", "age", "gender", "location", "segment"]):
        return analyze_comprehensive_sales('demographics')
    
    elif any(term in query for term in ["recommend", "suggestion", "improve", "increase", "boost", "action", "actionable"]):
        return analyze_comprehensive_sales('recommendations')
    
    elif "summary" in query or "statistics" in query:
        return summary_statistics()
    
    elif "mean" in query or "average" in query:
        if "product" in query and "category" in query:
            return group_by_feature("product_category", "total_amount", "mean")
        else:
            return "Please specify which feature to group by and which column to aggregate."
    
    elif "predict" in query and "total" in query:
        # Extract values if they exist in the query
        # Example: "predict total for quantity 10, price 25.99, discount 0.15"
        import re
        
        qty, price, discount = 5, 100, 0.1  # Default values
        
        # Try to extract quantity
        qty_match = re.search(r'quantity\s+(\d+\.?\d*)', query)
        if qty_match:
            qty = float(qty_match.group(1))
            
        # Try to extract price
        price_match = re.search(r'price\s+(\d+\.?\d*)', query)
        if price_match:
            price = float(price_match.group(1))
            
        # Try to extract discount
        discount_match = re.search(r'discount\s+(\d+\.?\d*)', query)
        if discount_match:
            discount = float(discount_match.group(1))
            
        prediction = predict_total(qty, price, discount)
        return f"Predicted total sales for quantity {qty}, price {price}, discount {discount}: {prediction}"
    
    elif "trend" in query or "pattern" in query or "high" in query or "low" in query:
        return analyze_sales_trend()
    
    elif "sales" in query and "category" in query:
        return group_by_feature("product_category", "total_amount", "sum")
    
    else:
        # Fallback to general overview for unknown queries
        return analyze_comprehensive_sales('overview')

# Create tools for the agent
summary_tool = FunctionTool.from_defaults(
    fn=summary_statistics,
    name="summary_statistics",
    description="Calculates summary statistics for numerical columns"
)

group_tool = FunctionTool.from_defaults(
    fn=group_by_feature,
    name="group_by_feature",
    description="Groups by a feature and calculates aggregate of another column"
)

predict_tool = FunctionTool.from_defaults(
    fn=predict_total,
    name="predict_total",
    description="Predicts total sales based on quantity, price, and discount"
)

trend_tool = FunctionTool.from_defaults(
    fn=analyze_sales_trend,
    name="analyze_sales_trend",
    description="Analyzes the sales trend over time"
)

# Initialize the module with sample data if run directly
if __name__ == "__main__":
    # Example queries to demonstrate functionality
    queries = [
        "What are the summary statistics of the sales data?",
        "What is the average total sales by product category?",
        "Predict the total sales for a transaction with quantity 5, price 100, and discount 0.1.",
        "What is the sales trend over time?"
    ]
    
    # Note: Synthetic data generation is disabled per company policy
    # Real data must be loaded before running example queries
    if df is None or len(df) == 0:
        print("ERROR: No data available. Please load real data before running example queries.")
        print("Synthetic data generation is disabled per company policy.")
        sys.exit(1)
    
    # Check if Ollama is running
    if is_ollama_running():
        print("Ollama is running! Using AI agent for responses.")
        try:
            # Initialize the LLM and create the agent
            llm = Ollama(model="llama2:13b", request_timeout=30.0)
            agent = ReActAgent.from_tools(
                tools=[summary_tool, group_tool, predict_tool, trend_tool],
                llm=llm,
                verbose=True
            )
            
            # Example agent interaction
            for query in queries:
                print(f"\nQuery: {query}")
                response = agent.query(query)
                print(f"Agent response: {response}")
                
        except Exception as e:
            print(f"Error initializing AI agent: {str(e)}")
            print("Falling back to direct query processing")
            
            # Fallback to direct processing
            for query in queries:
                print(f"\nQuery: {query}")
                response = process_query_directly(query)
                print(f"Direct response: {response}")
    else:
        print("Ollama is not running. Using direct query processing.")
        
        # Direct processing
        for query in queries:
            print(f"\nQuery: {query}")
            response = process_query_directly(query)
            print(f"Direct response: {response}")
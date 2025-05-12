# This file makes the uploads directory a proper Python package 

def read_csv_robust(file_path):
    """
    Helper function to robustly read CSV files with various encodings and delimiters
    
    Args:
        file_path (str): Path to the CSV file
        
    Returns:
        pandas.DataFrame: DataFrame containing the CSV data
    """
    import pandas as pd
    import os
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Try different encodings and delimiters
    encodings = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']
    delimiters = [',', ';', '\t', '|']
    
    # Try different combinations
    for encoding in encodings:
        for delimiter in delimiters:
            try:
                df = pd.read_csv(file_path, encoding=encoding, sep=delimiter, engine='python')
                # Check if we got some data
                if not df.empty:
                    print(f"Successfully read file with encoding {encoding} and delimiter '{delimiter}'")
                    return df
            except Exception as e:
                continue
    
    # Last resort - try pandas auto-detection
    try:
        df = pd.read_csv(file_path, engine='python')
        if not df.empty:
            return df
    except:
        pass
    
    # If all attempts failed, try with minimal options
    try:
        df = pd.read_csv(file_path, encoding='utf-8', sep=',', error_bad_lines=False, warn_bad_lines=True)
        return df
    except:
        # Give up and raise an exception
        raise ValueError(f"Failed to read CSV file: {file_path}") 
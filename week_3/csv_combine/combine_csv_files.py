import csv
import os
from datetime import datetime
from pathlib import Path

# Define paths
sample_data_folder = Path('sample-data')
output_folder = Path('output')
output_file = output_folder / 'combined_output.csv'

# Create output folder if it doesn't exist
output_folder.mkdir(exist_ok=True)

# Dictionary to store unique rows by date
data_dict = {}

# Get all CSV files from sample-data folder
csv_files = list(sample_data_folder.glob('*.csv'))

if not csv_files:
    print(f"No CSV files found in {sample_data_folder} folder")
    exit(1)

print(f"Found {len(csv_files)} CSV file(s)")

# Read all CSV files
for file_path in csv_files:
    print(f"Reading {file_path.name}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        # Check first data row to see if it's an AMZN row or actual data
        rows = list(reader)
        
        for row in rows:
            date_str = row['date'].strip()
            
            # Skip empty dates or AMZN identifier rows
            if not date_str or date_str == 'AMZN':
                continue
            
            # Parse date - handle both formats
            # Format 1: "2012-05-21 00:00:00-04:00"
            # Format 2: "2012-05-21"
            try:
                if ' ' in date_str:
                    # Has timezone info, extract just the date part
                    date_obj = datetime.strptime(date_str.split()[0], '%Y-%m-%d')
                else:
                    # Just date
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                
                # Use date string in YYYY-MM-DD format as key
                date_key = date_obj.strftime('%Y-%m-%d')
                
                # Store row (will overwrite duplicates, keeping the last one)
                data_dict[date_key] = row
                
            except ValueError as e:
                print(f"Warning: Could not parse date '{date_str}' in {file_path.name}: {e}")
                continue

# Sort by date
sorted_dates = sorted(data_dict.keys())

# Write combined CSV with the schema format
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    
    # Write header row
    writer.writerow(['date', 'open', 'high', 'low', 'close', 'adj_close', 'volume'])
    
    # Write AMZN row (second row)
    writer.writerow(['', 'AMZN', 'AMZN', 'AMZN', 'AMZN', 'AMZN', 'AMZN'])
    
    # Write data rows
    for date_key in sorted_dates:
        row = data_dict[date_key]
        writer.writerow([
            date_key,
            row['open'],
            row['high'],
            row['low'],
            row['close'],
            row['adj_close'],
            row['volume']
        ])

# Count total rows (header + AMZN row + data rows)
total_rows = 2 + len(sorted_dates)

print(f"\nCombined CSV file created: {output_file}")
print(f"Total number of rows: {total_rows}")
print(f"  - Header row: 1")
print(f"  - AMZN row: 1")
print(f"  - Data rows: {len(sorted_dates)}")
if sorted_dates:
    print(f"Date range: {sorted_dates[0]} to {sorted_dates[-1]}")


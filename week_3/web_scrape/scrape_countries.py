"""
Web scraper for country data from scrapethissite.com
Extracts country information and creates CSV file with visualizations
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import matplotlib.pyplot as plt
import re
import os
from typing import List, Dict

# URL to scrape
URL = "https://www.scrapethissite.com/pages/simple/"

def scrape_country_data() -> List[Dict]:
    """
    Scrape country data from the website
    Returns a list of dictionaries containing country information
    """
    print(f"Fetching data from {URL}...")
    response = requests.get(URL)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.content, 'html.parser')
    countries = []
    
    # Find all country divs - each country is in a div with class "country"
    country_divs = soup.find_all('div', class_='country')
    
    for div in country_divs:
        # Extract country name (usually in h3 tag)
        h3 = div.find('h3')
        country_name = h3.get_text(strip=True) if h3 else None
        
        if not country_name:
            # Try finding country name in other ways
            country_name_elem = div.find('h3', class_='country-name')
            if country_name_elem:
                country_name = country_name_elem.get_text(strip=True)
        
        if not country_name:
            continue
        
        # Get all text from the div
        div_text = div.get_text()
        
        # Extract Capital - look for "Capital:" followed by text
        capital = None
        capital_match = re.search(r'Capital:\s*([^\n]+)', div_text)
        if capital_match:
            capital = capital_match.group(1).strip()
            # Remove any trailing ** or formatting
            capital = re.sub(r'\*\*', '', capital).strip()
        
        # Extract Population - look for "Population:" followed by numbers
        population = None
        pop_match = re.search(r'Population:\s*([^\n]+)', div_text)
        if pop_match:
            pop_str = pop_match.group(1).strip()
            # Remove formatting and commas
            pop_str = re.sub(r'[,\*\s]', '', pop_str)
            try:
                population = int(pop_str)
            except ValueError:
                pass
        
        # Extract Area - look for "Area" followed by numbers
        area = None
        area_match = re.search(r'Area.*?:\s*([^\n]+)', div_text)
        if area_match:
            area_str = area_match.group(1).strip()
            # Remove formatting, commas, and km2 text
            area_str = re.sub(r'[,\*\s\(\)km2]', '', area_str, flags=re.IGNORECASE).strip()
            try:
                if 'E' in area_str.upper():
                    area = float(area_str)
                else:
                    area = float(area_str)
            except ValueError:
                pass
        
        countries.append({
            'Country': country_name,
            'Capital': capital or 'N/A',
            'Population': population if population is not None else 0,
            'Area_km2': area if area is not None else 0
        })
    
    # If we didn't find countries using div.country, try alternative parsing
    if not countries:
        # Parse by looking for h3 tags followed by country info
        h3_tags = soup.find_all('h3')
        for h3 in h3_tags:
            country_name = h3.get_text(strip=True)
            if not country_name or len(country_name) < 2:
                continue
            
            # Get the parent container
            parent = h3.parent
            if not parent:
                continue
            
            # Extract from text content
            text = parent.get_text()
            
            # Extract Capital
            capital_match = re.search(r'Capital:\s*([^\n]+)', text)
            capital = capital_match.group(1).strip() if capital_match else None
            if capital:
                capital = re.sub(r'\*\*', '', capital).strip()
            
            # Extract Population
            pop_match = re.search(r'Population:\s*([^\n]+)', text)
            population = None
            if pop_match:
                pop_str = pop_match.group(1).strip()
                pop_str = re.sub(r'[,\*\s]', '', pop_str)
                try:
                    population = int(pop_str)
                except ValueError:
                    pass
            
            # Extract Area
            area_match = re.search(r'Area.*?:\s*([^\n]+)', text)
            area = None
            if area_match:
                area_str = area_match.group(1).strip()
                area_str = re.sub(r'[,\*\s\(\)km2]', '', area_str, flags=re.IGNORECASE).strip()
                try:
                    if 'E' in area_str.upper():
                        area = float(area_str)
                    else:
                        area = float(area_str)
                except ValueError:
                    pass
            
            # Only add if we have at least country name
            if country_name:
                countries.append({
                    'Country': country_name,
                    'Capital': capital or 'N/A',
                    'Population': population if population is not None else 0,
                    'Area_km2': area if area is not None else 0
                })
    
    print(f"Found {len(countries)} countries")
    return countries

def save_to_csv(countries: List[Dict], output_folder: str = 'web_scrape', filename: str = 'countries_data.csv'):
    """Save country data to CSV file"""
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    
    df = pd.DataFrame(countries)
    filepath = os.path.join(output_folder, filename)
    df.to_csv(filepath, index=False)
    print(f"Data saved to {filepath}")
    return df

def create_visualizations(df: pd.DataFrame, output_folder: str = 'web_scrape'):
    """Create executive pie charts and bar charts"""
    
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    
    # Clean data: ensure numeric columns are properly typed and remove invalid values
    df['Population'] = pd.to_numeric(df['Population'], errors='coerce').fillna(0)
    df['Area_km2'] = pd.to_numeric(df['Area_km2'], errors='coerce').fillna(0)
    
    # Set style for better-looking charts
    try:
        plt.style.use('seaborn-v0_8-darkgrid')
    except:
        try:
            plt.style.use('seaborn-darkgrid')
        except:
            plt.style.use('default')
    
    # 1. Pie Chart: Top 10 Countries by Population
    # Filter out zero/negative values for pie charts
    df_pop_valid = df[df['Population'] > 0].copy()
    if len(df_pop_valid) > 0:
        top_10_pop = df_pop_valid.nlargest(10, 'Population')
        if len(top_10_pop) > 0:
            fig, ax = plt.subplots(figsize=(12, 8))
            # Ensure all values are positive and valid
            pop_values = top_10_pop['Population'].values
            pop_values = pop_values[~pd.isna(pop_values)]
            pop_values = pop_values[pop_values > 0]
            
            if len(pop_values) > 0:
                labels = top_10_pop['Country'].values[:len(pop_values)]
                ax.pie(pop_values, labels=labels, autopct='%1.1f%%', startangle=90)
                ax.set_title('Top 10 Countries by Population', fontsize=16, fontweight='bold')
                plt.tight_layout()
                filepath = os.path.join(output_folder, 'pie_chart_top10_population.png')
                plt.savefig(filepath, dpi=300, bbox_inches='tight')
                print(f"Saved: {filepath}")
                plt.close()
    
    # 2. Bar Chart: Top 15 Countries by Population
    df_pop_valid = df[df['Population'] > 0].copy()
    if len(df_pop_valid) > 0:
        top_15_pop = df_pop_valid.nlargest(15, 'Population')
        if len(top_15_pop) > 0:
            fig, ax = plt.subplots(figsize=(14, 8))
            ax.barh(top_15_pop['Country'], top_15_pop['Population'], color='steelblue')
            ax.set_xlabel('Population', fontsize=12, fontweight='bold')
            ax.set_ylabel('Country', fontsize=12, fontweight='bold')
            ax.set_title('Top 15 Countries by Population', fontsize=16, fontweight='bold')
            ax.invert_yaxis()  # Largest at top
            plt.tight_layout()
            filepath = os.path.join(output_folder, 'bar_chart_top15_population.png')
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            print(f"Saved: {filepath}")
            plt.close()
    
    # 3. Pie Chart: Top 10 Countries by Area
    df_area_valid = df[df['Area_km2'] > 0].copy()
    if len(df_area_valid) > 0:
        top_10_area = df_area_valid.nlargest(10, 'Area_km2')
        if len(top_10_area) > 0:
            fig, ax = plt.subplots(figsize=(12, 8))
            # Ensure all values are positive and valid
            area_values = top_10_area['Area_km2'].values
            area_values = area_values[~pd.isna(area_values)]
            area_values = area_values[area_values > 0]
            
            if len(area_values) > 0:
                labels = top_10_area['Country'].values[:len(area_values)]
                ax.pie(area_values, labels=labels, autopct='%1.1f%%', startangle=90)
                ax.set_title('Top 10 Countries by Area (km²)', fontsize=16, fontweight='bold')
                plt.tight_layout()
                filepath = os.path.join(output_folder, 'pie_chart_top10_area.png')
                plt.savefig(filepath, dpi=300, bbox_inches='tight')
                print(f"Saved: {filepath}")
                plt.close()
    
    # 4. Bar Chart: Top 15 Countries by Area
    df_area_valid = df[df['Area_km2'] > 0].copy()
    if len(df_area_valid) > 0:
        top_15_area = df_area_valid.nlargest(15, 'Area_km2')
        if len(top_15_area) > 0:
            fig, ax = plt.subplots(figsize=(14, 8))
            ax.barh(top_15_area['Country'], top_15_area['Area_km2'], color='forestgreen')
            ax.set_xlabel('Area (km²)', fontsize=12, fontweight='bold')
            ax.set_ylabel('Country', fontsize=12, fontweight='bold')
            ax.set_title('Top 15 Countries by Area (km²)', fontsize=16, fontweight='bold')
            ax.invert_yaxis()
            plt.tight_layout()
            filepath = os.path.join(output_folder, 'bar_chart_top15_area.png')
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            print(f"Saved: {filepath}")
            plt.close()
    
    # 5. Bar Chart: Population Density
    # Calculate population density only for countries with valid area and population
    df_valid = df[(df['Area_km2'] > 0) & (df['Population'] > 0)].copy()
    if len(df_valid) > 0:
        df_valid['Population_Density'] = df_valid['Population'] / df_valid['Area_km2']
        top_15_density = df_valid.nlargest(15, 'Population_Density')
        if len(top_15_density) > 0:
            fig, ax = plt.subplots(figsize=(14, 8))
            ax.barh(top_15_density['Country'], top_15_density['Population_Density'], color='coral')
            ax.set_xlabel('Population Density (people/km²)', fontsize=12, fontweight='bold')
            ax.set_ylabel('Country', fontsize=12, fontweight='bold')
            ax.set_title('Top 15 Countries by Population Density', fontsize=16, fontweight='bold')
            ax.invert_yaxis()
            plt.tight_layout()
            filepath = os.path.join(output_folder, 'bar_chart_top15_density.png')
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            print(f"Saved: {filepath}")
            plt.close()

if __name__ == "__main__":
    try:
        # Scrape the data
        countries = scrape_country_data()
        
        if not countries:
            print("No data found. Please check the website structure.")
        else:
            # Define output folder
            output_folder = 'web_scrape'
            
            # Save to CSV
            df = save_to_csv(countries, output_folder)
            
            # Create visualizations
            print("\nCreating visualizations...")
            create_visualizations(df, output_folder)
            
            print("\n" + "="*50)
            print("SUCCESS!")
            print("="*50)
            print(f"✓ Scraped {len(countries)} countries")
            print(f"✓ Saved data to: {os.path.join(output_folder, 'countries_data.csv')}")
            print(f"✓ Created visualizations in {output_folder} folder:")
            print("  - pie_chart_top10_population.png")
            print("  - bar_chart_top15_population.png")
            print("  - pie_chart_top10_area.png")
            print("  - bar_chart_top15_area.png")
            print("  - bar_chart_top15_density.png")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


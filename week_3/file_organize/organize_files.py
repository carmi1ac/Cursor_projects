import os
import shutil
from pathlib import Path

# Define source and destination directories
source_dir = Path(r"C:\Users\Andrew C\Downloads\sample_data_file_organizer-20251209T145458Z-1-001\sample_data_file_organizer")
dest_base = Path(r"C:\Users\Andrew C\Desktop\Projects\Cursor\week_3\file_organize\files-organized")

# Define file type mappings
file_categories = {
    'pictures': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'],
    'audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'],
    'video': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v'],
    'documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx']
}

def organize_files():
    """Organize files from source directory into categorized subfolders."""
    
    # Create destination base directory if it doesn't exist
    dest_base.mkdir(parents=True, exist_ok=True)
    
    # Create subfolders for each category
    for category in file_categories.keys():
        category_path = dest_base / category
        category_path.mkdir(parents=True, exist_ok=True)
        print(f"Created/verified folder: {category_path}")
    
    # Track statistics
    stats = {category: 0 for category in file_categories.keys()}
    stats['other'] = 0
    
    # Process each file in the source directory
    if not source_dir.exists():
        print(f"Error: Source directory does not exist: {source_dir}")
        return
    
    files_processed = 0
    for file_path in source_dir.iterdir():
        if file_path.is_file():
            files_processed += 1
            file_ext = file_path.suffix.lower()
            
            # Find which category this file belongs to
            categorized = False
            for category, extensions in file_categories.items():
                if file_ext in extensions:
                    dest_path = dest_base / category / file_path.name
                    try:
                        shutil.copy2(file_path, dest_path)
                        stats[category] += 1
                        print(f"Copied {file_path.name} -> {category}/")
                        categorized = True
                        break
                    except Exception as e:
                        print(f"Error copying {file_path.name}: {e}")
            
            if not categorized:
                stats['other'] += 1
                print(f"Uncategorized file (skipped): {file_path.name}")
    
    # Print summary
    print("\n" + "="*50)
    print("File Organization Summary")
    print("="*50)
    print(f"Total files processed: {files_processed}")
    for category, count in stats.items():
        if count > 0:
            print(f"{category.capitalize()}: {count} files")
    print("="*50)

if __name__ == "__main__":
    print("Starting file organization...")
    print(f"Source: {source_dir}")
    print(f"Destination: {dest_base}\n")
    organize_files()
    print("\nFile organization complete!")


import pandas as pd
import os

def convert_ods_to_csv():
    # Get the directory where this script is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Input file is in the parent directory (EcoFarming root)
    input_file = os.path.join(base_dir, "..", "Indian Villages.ods")
    # Output file goes into the same directory as this script
    output_file = os.path.join(base_dir, "India_Locations.csv")
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    print(f"Reading ODS file from {input_file}...")
    try:
        df = pd.read_excel(input_file, engine="odf")
        
        print("Columns found:", df.columns.tolist())
        
        # Save to CSV
        df.to_csv(output_file, index=False)
        print(f"Successfully converted to {output_file}")
        
    except Exception as e:
        print(f"Error converting file: {e}")

if __name__ == "__main__":
    convert_ods_to_csv()

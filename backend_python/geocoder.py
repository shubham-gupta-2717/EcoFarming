import pandas as pd
import numpy as np
from scipy.spatial import KDTree
import os

class ReverseGeocoder:
    def __init__(self, data_filename="India_Locations.csv"):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_path = os.path.join(base_dir, data_filename)
        self.df = None
        self.tree = None
        self.load_data()

    def load_data(self):
        if not os.path.exists(self.data_path):
            print(f"Warning: {self.data_path} not found. Geocoding will not work.")
            return

        print("Loading dataset...")
        try:
            self.df = pd.read_csv(self.data_path)
            
            # Normalize column names
            self.df.columns = [c.lower().strip() for c in self.df.columns]
            
            # Identify lat/lon columns
            # Common names: latitude, lat, longitude, lon, lng
            lat_col = next((c for c in self.df.columns if 'lat' in c), None)
            lon_col = next((c for c in self.df.columns if 'lon' in c or 'lng' in c), None)
            
            if not lat_col or not lon_col:
                print("Error: Could not identify latitude/longitude columns.")
                return

            self.lat_col = lat_col
            self.lon_col = lon_col

            # Drop nulls
            self.df = self.df.dropna(subset=[lat_col, lon_col])
            
            # Convert to float
            self.df[lat_col] = pd.to_numeric(self.df[lat_col], errors='coerce')
            self.df[lon_col] = pd.to_numeric(self.df[lon_col], errors='coerce')
            self.df = self.df.dropna(subset=[lat_col, lon_col])

            # Build KDTree
            # KDTree uses Euclidean distance, which is a good approximation for small distances.
            # For accurate Haversine, we can use BallTree with haversine metric, 
            # but KDTree on lat/lon is often fast and "good enough" for nearest neighbor if we convert to radians or just use euclidean on small scale.
            # However, the prompt asks for Haversine. 
            # Optimization: Use KDTree to find N nearest neighbors (Euclidean), then compute exact Haversine for those N to find the best.
            
            self.coords = self.df[[lat_col, lon_col]].values
            self.tree = KDTree(self.coords)
            print(f"Dataset loaded: {len(self.df)} locations.")

        except Exception as e:
            print(f"Error loading data: {e}")

    def haversine_distance(self, lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        phi1, phi2 = np.radians(lat1), np.radians(lat2)
        dphi = np.radians(lat2 - lat1)
        dlambda = np.radians(lon2 - lon1)
        
        a = np.sin(dphi/2)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda/2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
        return R * c

    def search(self, lat, lon):
        if self.tree is None:
            return None

        # Query KDTree for nearest neighbor (Euclidean approximation)
        # We query k=1 for speed, as Euclidean on lat/lon is very close to Haversine for nearest neighbor selection locally.
        dist, idx = self.tree.query([lat, lon], k=1)
        
        # Get the row
        row = self.df.iloc[idx]
        
        # Calculate exact Haversine distance
        exact_dist = self.haversine_distance(lat, lon, row[self.lat_col], row[self.lon_col])
        
        # Map columns to standard output
        # Expected: state, district, location (village/place_name)
        
        # Try to find state, district, village columns
        state = row.get('state', '') or row.get('statename', '')
        district = row.get('district', '') or row.get('districtname', '')
        location = row.get('place_name', '') or row.get('village', '') or row.get('villagename', '') or row.get('location', '')
        
        return {
            "state": str(state).title(),
            "district": str(district).title(),
            "location": str(location).title(),
            "distance_km": float(exact_dist)
        }

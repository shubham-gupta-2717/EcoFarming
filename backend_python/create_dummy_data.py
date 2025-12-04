import pandas as pd
import os

data = [
    {"place_name": "New Delhi", "state": "Delhi", "district": "New Delhi", "latitude": 28.6139, "longitude": 77.2090},
    {"place_name": "Mumbai", "state": "Maharashtra", "district": "Mumbai City", "latitude": 19.0760, "longitude": 72.8777},
    {"place_name": "Bangalore", "state": "Karnataka", "district": "Bangalore Urban", "latitude": 12.9716, "longitude": 77.5946},
    {"place_name": "Chennai", "state": "Tamil Nadu", "district": "Chennai", "latitude": 13.0827, "longitude": 80.2707},
    {"place_name": "Kolkata", "state": "West Bengal", "district": "Kolkata", "latitude": 22.5726, "longitude": 88.3639},
    {"place_name": "Hyderabad", "state": "Telangana", "district": "Hyderabad", "latitude": 17.3850, "longitude": 78.4867},
    {"place_name": "Ahmedabad", "state": "Gujarat", "district": "Ahmedabad", "latitude": 23.0225, "longitude": 72.5714},
    {"place_name": "Pune", "state": "Maharashtra", "district": "Pune", "latitude": 18.5204, "longitude": 73.8567},
    {"place_name": "Jaipur", "state": "Rajasthan", "district": "Jaipur", "latitude": 26.9124, "longitude": 75.7873},
    {"place_name": "Lucknow", "state": "Uttar Pradesh", "district": "Lucknow", "latitude": 26.8467, "longitude": 80.9462}
]

df = pd.DataFrame(data)
base_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(base_dir, "India_Locations.csv")
df.to_csv(output_file, index=False)
print(f"Created dummy dataset at {output_file}")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from geocoder import ReverseGeocoder
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Geocoder
geocoder = ReverseGeocoder()

@app.get("/")
def read_root():
    return {"status": "online", "service": "EcoFarming Geocoder"}

@app.get("/reverse_geocode")
def reverse_geocode(lat: float, lon: float):
    if geocoder.tree is None:
        raise HTTPException(status_code=503, detail="Geocoder service not ready (dataset missing)")
    
    result = geocoder.search(lat, lon)
    
    if not result:
        raise HTTPException(status_code=404, detail="Location not found")
        
    # Generate human-friendly description
    description = f"You are currently near {result['location']}, {result['district']}, {result['state']}."
    
    return {
        **result,
        "description": description
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

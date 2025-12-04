# EcoFarming Reverse Geocoding Service

This service provides offline reverse geocoding using a local dataset.

## Setup

1.  Install Python 3.8+.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Service

Start the server:
```bash
python main.py
```
The service will run on `http://0.0.0.0:8000`.

## Updating the Dataset

The service expects a CSV file named `India_Locations.csv` in this directory.
The CSV must contain the following columns (case-insensitive):
*   `place_name` (or `village`, `location`)
*   `state`
*   `district`
*   `latitude` (or `lat`)
*   `longitude` (or `lon`)

To update the dataset:
1.  Place your new CSV file here.
2.  Rename it to `India_Locations.csv`.
3.  Restart the service.

## API Usage

**Endpoint:** `GET /reverse_geocode`

**Parameters:**
*   `lat`: Latitude (float)
*   `lon`: Longitude (float)

**Example:**
```
GET /reverse_geocode?lat=28.6139&lon=77.2090
```

**Response:**
```json
{
  "state": "Delhi",
  "district": "New Delhi",
  "location": "New Delhi",
  "distance_km": 0.0,
  "description": "You are currently near New Delhi, New Delhi, Delhi."
}
```

## Deployment

For production, use a process manager like Gunicorn or PM2.

**Using Gunicorn:**
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

/* eslint-disable max-len */
const OpenWeatherMapAppEn = {
  displayName: 'OpenWeatherMap',
  groups: ['Weather', 'Analytics & Reporting'],
  shortDesc: 'Access current weather data and forecasts for any location worldwide',
  longDesc: `Connect to OpenWeatherMap to retrieve real-time weather data and 5-day forecasts for any location on Earth. Get comprehensive weather information including temperature, humidity, wind speed, pressure, and weather conditions. Support for multiple location input methods (city name, coordinates, or zip code) and customizable units (metric, imperial, or standard). Ideal for weather-aware applications, travel planning, agricultural monitoring, and location-based services within your Qore workflows.`,
  connectionMessage: {
    title: 'Connect to OpenWeatherMap',
    content: `To connect to OpenWeatherMap, you will need your **API Key**.

## Getting Your API Key

1. Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/)
2. After signing in, go to your account → **My API keys**
3. You'll see a default API key, or click **Generate** to create a new one
4. Give your API key a descriptive name
5. Copy the API key

You can access the API keys page directly at [home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)

## Connection Details

### API Key
Your OpenWeatherMap API key that authenticates requests to the weather data APIs.

**Note:** New API keys may take a few hours to activate. The free tier includes access to current weather and 5-day forecasts with limited calls per minute. Paid plans offer additional features and higher rate limits.`,
  },
  actions: {
    get_current_weather: {
      displayName: 'Get Current Weather',
      shortDesc: 'Retrieve current weather data for a specific location',
      longDesc:
        'Get real-time weather information including temperature, humidity, wind speed, pressure, visibility, and weather conditions for any location worldwide. Supports lookup by city name, geographic coordinates, or zip/postal code.',
      options: {
        location_type: {
          displayName: 'Location Type',
          shortDesc: 'How to specify the location',
          longDesc:
            'Choose how you want to specify the location: by city name (e.g., "London,UK"), geographic coordinates (latitude/longitude), or zip/postal code.',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City name with optional country code',
          longDesc:
            'Enter the city name, optionally followed by a comma and the two-letter country code (e.g., "London,UK", "New York,US", "Paris,FR"). The country code helps disambiguate cities with the same name.',
        },
        lat: {
          displayName: 'Latitude',
          shortDesc: 'Geographic latitude coordinate',
          longDesc:
            'Enter the latitude coordinate of the location in decimal degrees (e.g., 51.5074 for London). Valid range is -90 to 90.',
        },
        lon: {
          displayName: 'Longitude',
          shortDesc: 'Geographic longitude coordinate',
          longDesc:
            'Enter the longitude coordinate of the location in decimal degrees (e.g., -0.1278 for London). Valid range is -180 to 180.',
        },
        zip: {
          displayName: 'Zip/Postal Code',
          shortDesc: 'Zip or postal code with optional country code',
          longDesc:
            'Enter the zip or postal code, optionally followed by a comma and the two-letter country code (e.g., "10001,US", "SW1A 1AA,GB"). Defaults to US if no country code is provided.',
        },
        units: {
          displayName: 'Units',
          shortDesc: 'Temperature and speed units',
          longDesc:
            'Choose the measurement system: Metric (Celsius, meters/second), Imperial (Fahrenheit, miles/hour), or Standard (Kelvin, meters/second).',
        },
        lang: {
          displayName: 'Language',
          shortDesc: 'Language for weather descriptions',
          longDesc:
            'Optional two-letter language code for weather condition descriptions (e.g., "en" for English, "es" for Spanish, "fr" for French, "de" for German).',
        },
      },
    },
    get_forecast: {
      displayName: 'Get Weather Forecast',
      shortDesc: 'Retrieve 5-day weather forecast with 3-hour intervals',
      longDesc:
        'Get a 5-day weather forecast with data points every 3 hours for any location worldwide. Each forecast item includes temperature, humidity, wind, precipitation probability, and weather conditions. Supports lookup by city name, geographic coordinates, or zip/postal code.',
      options: {
        location_type: {
          displayName: 'Location Type',
          shortDesc: 'How to specify the location',
          longDesc:
            'Choose how you want to specify the location: by city name (e.g., "London,UK"), geographic coordinates (latitude/longitude), or zip/postal code.',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City name with optional country code',
          longDesc:
            'Enter the city name, optionally followed by a comma and the two-letter country code (e.g., "London,UK", "New York,US", "Paris,FR"). The country code helps disambiguate cities with the same name.',
        },
        lat: {
          displayName: 'Latitude',
          shortDesc: 'Geographic latitude coordinate',
          longDesc:
            'Enter the latitude coordinate of the location in decimal degrees (e.g., 51.5074 for London). Valid range is -90 to 90.',
        },
        lon: {
          displayName: 'Longitude',
          shortDesc: 'Geographic longitude coordinate',
          longDesc:
            'Enter the longitude coordinate of the location in decimal degrees (e.g., -0.1278 for London). Valid range is -180 to 180.',
        },
        zip: {
          displayName: 'Zip/Postal Code',
          shortDesc: 'Zip or postal code with optional country code',
          longDesc:
            'Enter the zip or postal code, optionally followed by a comma and the two-letter country code (e.g., "10001,US", "SW1A 1AA,GB"). Defaults to US if no country code is provided.',
        },
        units: {
          displayName: 'Units',
          shortDesc: 'Temperature and speed units',
          longDesc:
            'Choose the measurement system: Metric (Celsius, meters/second), Imperial (Fahrenheit, miles/hour), or Standard (Kelvin, meters/second).',
        },
        lang: {
          displayName: 'Language',
          shortDesc: 'Language for weather descriptions',
          longDesc:
            'Optional two-letter language code for weather condition descriptions (e.g., "en" for English, "es" for Spanish, "fr" for French, "de" for German).',
        },
        cnt: {
          displayName: 'Count',
          shortDesc: 'Number of forecast items to return',
          longDesc:
            'Limit the number of 3-hour forecast items returned. Each day has up to 8 data points (every 3 hours). Maximum is 40 (5 days x 8 intervals).',
        },
      },
    },
  },
  triggers: {
    temperature_threshold: {
      displayName: 'Temperature Threshold',
      shortDesc: 'Trigger when temperature crosses a threshold',
      longDesc:
        'Monitor the temperature at a specific location and trigger when it crosses above or below a configured threshold value. Useful for temperature alerts, HVAC automation, and weather-dependent workflows.',
      options: {
        location_type: {
          displayName: 'Location Type',
          shortDesc: 'How to specify the location',
          longDesc:
            'Choose how you want to specify the location: by city name (e.g., "London,UK"), geographic coordinates (latitude/longitude), or zip/postal code.',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City name with optional country code',
          longDesc:
            'Enter the city name, optionally followed by a comma and the two-letter country code (e.g., "London,UK", "New York,US", "Paris,FR").',
        },
        lat: {
          displayName: 'Latitude',
          shortDesc: 'Geographic latitude coordinate',
          longDesc: 'Enter the latitude coordinate of the location in decimal degrees. Valid range is -90 to 90.',
        },
        lon: {
          displayName: 'Longitude',
          shortDesc: 'Geographic longitude coordinate',
          longDesc: 'Enter the longitude coordinate of the location in decimal degrees. Valid range is -180 to 180.',
        },
        zip: {
          displayName: 'Zip/Postal Code',
          shortDesc: 'Zip or postal code with optional country code',
          longDesc: 'Enter the zip or postal code, optionally followed by a comma and the two-letter country code.',
        },
        units: {
          displayName: 'Units',
          shortDesc: 'Temperature and speed units',
          longDesc: 'Choose the measurement system: Metric (Celsius), Imperial (Fahrenheit), or Standard (Kelvin).',
        },
        threshold_type: {
          displayName: 'Threshold Type',
          shortDesc: 'Direction of temperature crossing',
          longDesc:
            'Choose whether to trigger when temperature goes above or below the threshold value. "Goes Above" triggers when temperature rises past the threshold. "Goes Below" triggers when temperature drops below the threshold.',
        },
        threshold_value: {
          displayName: 'Threshold Value',
          shortDesc: 'Temperature threshold to monitor',
          longDesc:
            'Set the temperature value that will trigger the event when crossed. Use the same units as selected in the Units option (e.g., 0 for freezing point in Celsius, 32 in Fahrenheit).',
        },
      },
      event_info: {
        desc: 'Temperature threshold crossing event data',
      },
    },
    weather_condition_change: {
      displayName: 'Weather Condition Change',
      shortDesc: 'Trigger when weather conditions change',
      longDesc:
        'Monitor the weather conditions at a specific location and trigger when conditions change (e.g., from Clear to Rain, Clouds to Snow). Optionally filter for specific condition types.',
      options: {
        location_type: {
          displayName: 'Location Type',
          shortDesc: 'How to specify the location',
          longDesc:
            'Choose how you want to specify the location: by city name (e.g., "London,UK"), geographic coordinates (latitude/longitude), or zip/postal code.',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City name with optional country code',
          longDesc:
            'Enter the city name, optionally followed by a comma and the two-letter country code (e.g., "London,UK", "New York,US", "Paris,FR").',
        },
        lat: {
          displayName: 'Latitude',
          shortDesc: 'Geographic latitude coordinate',
          longDesc: 'Enter the latitude coordinate of the location in decimal degrees. Valid range is -90 to 90.',
        },
        lon: {
          displayName: 'Longitude',
          shortDesc: 'Geographic longitude coordinate',
          longDesc: 'Enter the longitude coordinate of the location in decimal degrees. Valid range is -180 to 180.',
        },
        zip: {
          displayName: 'Zip/Postal Code',
          shortDesc: 'Zip or postal code with optional country code',
          longDesc: 'Enter the zip or postal code, optionally followed by a comma and the two-letter country code.',
        },
        units: {
          displayName: 'Units',
          shortDesc: 'Temperature and speed units',
          longDesc: 'Choose the measurement system: Metric (Celsius), Imperial (Fahrenheit), or Standard (Kelvin).',
        },
        condition_filter: {
          displayName: 'Condition Filter',
          shortDesc: 'Filter for specific weather conditions',
          longDesc:
            'Optionally filter to only trigger when the new condition matches a specific type. Select "Any Change" to trigger on all condition changes, or select a specific condition like Rain, Snow, Clear, etc.',
        },
      },
      event_info: {
        desc: 'Weather condition change event data',
      },
    },
  },
};

export default OpenWeatherMapAppEn;

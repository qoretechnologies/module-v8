import { openWeatherMapClient } from '../client';
import { OpenWeatherMapError } from '../constants';
import { CurrentWeatherResponse } from '../response-types';

export interface LocationParams {
  location_type: string;
  city?: string;
  lat?: number;
  lon?: number;
  zip?: string;
}

/**
 * Build query parameters based on location type
 */
export const buildLocationParams = (location: LocationParams): Record<string, string | number> => {
  const params: Record<string, string | number> = {};

  switch (location.location_type) {
    case 'city_name':
      if (!location.city) {
        throw new OpenWeatherMapError('City name is required when location type is "City Name"');
      }
      params.q = location.city;
      break;

    case 'coordinates':
      if (location.lat === undefined || location.lon === undefined) {
        throw new OpenWeatherMapError(
          'Latitude and longitude are required when location type is "Coordinates"'
        );
      }
      params.lat = location.lat;
      params.lon = location.lon;
      break;

    case 'zip_code':
      if (!location.zip) {
        throw new OpenWeatherMapError(
          'Zip/postal code is required when location type is "Zip/Postal Code"'
        );
      }
      params.zip = location.zip;
      break;

    default:
      throw new OpenWeatherMapError(`Invalid location type: ${location.location_type}`);
  }

  return params;
};

/**
 * Fetch current weather data from OpenWeatherMap API
 * Shared helper used by both actions and triggers
 */
export const fetchCurrentWeather = async (
  token: string,
  location: LocationParams,
  units: string = 'metric',
  lang?: string
): Promise<CurrentWeatherResponse> => {
  const params: Record<string, string | number> = {
    ...buildLocationParams(location),
    units,
  };

  if (lang) {
    params.lang = lang;
  }

  try {
    const result = await openWeatherMapClient.get<CurrentWeatherResponse>('weather', {
      token,
      params,
    });

    return result;
  } catch (error) {
    throw new OpenWeatherMapError(`Failed to fetch current weather: ${error.message || error}`);
  }
};

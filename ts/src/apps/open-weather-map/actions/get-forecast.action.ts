import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { openWeatherMapClient } from '../client';
import {
  LOCATION_TYPE_OPTIONS,
  OPEN_WEATHER_MAP_APP_NAME,
  OpenWeatherMapError,
  UNITS_OPTIONS,
} from '../constants';
import { ForecastResponse, ForecastResponseType } from '../response-types';

const action = 'get_forecast';

const cityNameOptions = {
  city: {
    type: 'string',
    required: true,
    depends_on: ['location_type'],
  },
} satisfies TQoreOptions;

const coordinatesOptions = {
  lat: {
    type: 'number',
    required: true,
    depends_on: ['location_type'],
  },
  lon: {
    type: 'number',
    required: true,
    depends_on: ['location_type'],
  },
} satisfies TQoreOptions;

const zipCodeOptions = {
  zip: {
    type: 'string',
    required: true,
    depends_on: ['location_type'],
  },
} satisfies TQoreOptions;

const options = {
  location_type: {
    type: 'string',
    required: true,
    default_value: 'city_name',
    allowed_values: LOCATION_TYPE_OPTIONS,
    on_change: ['refetch'],
    get_dependent_options: (context) => {
      const locationType = context?.opts?.location_type;

      if (locationType === 'city_name') {
        return cityNameOptions;
      } else if (locationType === 'coordinates') {
        return coordinatesOptions;
      } else if (locationType === 'zip_code') {
        return zipCodeOptions;
      }

      return {};
    },
  },
  units: {
    type: 'string',
    required: false,
    default_value: 'metric',
    allowed_values: UNITS_OPTIONS,
  },
  lang: {
    type: 'string',
    required: false,
  },
  cnt: {
    type: 'number',
    required: false,
  },
} satisfies TQoreOptions;

const getForecast = QoreAppCreator.createLocalizedAction<
  typeof options &
    Partial<typeof cityNameOptions & typeof coordinatesOptions & typeof zipCodeOptions>
>({
  app: OPEN_WEATHER_MAP_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ForecastResponseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: OpenWeatherMapError,
    });

    const { location_type, city, lat, lon, zip, units = 'metric', lang, cnt } = obj || {};

    const params: Record<string, string | number> = {
      units,
    };

    if (lang) {
      params.lang = lang;
    }

    if (cnt) {
      params.cnt = cnt;
    }

    switch (location_type) {
      case 'city_name':
        if (!city) {
          throw new OpenWeatherMapError('City name is required when location type is "City Name"');
        }
        params.q = city;
        break;

      case 'coordinates':
        if (lat === undefined || lon === undefined) {
          throw new OpenWeatherMapError(
            'Latitude and longitude are required when location type is "Coordinates"'
          );
        }
        params.lat = lat;
        params.lon = lon;
        break;

      case 'zip_code':
        if (!zip) {
          throw new OpenWeatherMapError(
            'Zip/postal code is required when location type is "Zip/Postal Code"'
          );
        }
        params.zip = zip;
        break;

      default:
        throw new OpenWeatherMapError(`Invalid location type: ${location_type}`);
    }

    try {
      const result = await openWeatherMapClient.get<ForecastResponse>('forecast', {
        token,
        params,
      });

      return result;
    } catch (error) {
      throw new OpenWeatherMapError(`Failed to get weather forecast: ${error.message || error}`);
    }
  },
});

export default getForecast;

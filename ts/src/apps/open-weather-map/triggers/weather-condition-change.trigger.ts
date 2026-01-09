import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLLING_INTERVAL } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { delayOrCancel } from '../../../global/helpers/event-triggers';
import {
  LOCATION_TYPE_OPTIONS,
  OPEN_WEATHER_MAP_APP_NAME,
  OpenWeatherMapError,
  UNITS_OPTIONS,
} from '../constants';
import { fetchCurrentWeather } from '../helpers';

const action = 'weather_condition_change';

const CONDITION_FILTER_OPTIONS = [
  { value: 'any', display_name: 'Any Change' },
  { value: 'rain', display_name: 'Rain' },
  { value: 'snow', display_name: 'Snow' },
  { value: 'clear', display_name: 'Clear' },
  { value: 'clouds', display_name: 'Clouds' },
  { value: 'thunderstorm', display_name: 'Thunderstorm' },
  { value: 'drizzle', display_name: 'Drizzle' },
  { value: 'mist', display_name: 'Mist/Fog' },
];

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
  condition_filter: {
    type: 'string',
    required: false,
    default_value: 'any',
    allowed_values: CONDITION_FILTER_OPTIONS,
  },
} satisfies TQoreOptions;

const WeatherConditionChangeEventType = {
  type: 'hash',
  fields: {
    previous_condition: {
      type: 'string',
      short_desc: 'Previous weather condition',
    },
    new_condition: {
      type: 'string',
      short_desc: 'New weather condition',
    },
    name: {
      type: 'string',
      short_desc: 'Location name',
    },
    main: {
      type: {
        type: 'hash',
        fields: {
          temp: { type: 'number' },
          feels_like: { type: 'number' },
          temp_min: { type: 'number' },
          temp_max: { type: 'number' },
          pressure: { type: 'number' },
          humidity: { type: 'number' },
        },
      },
    },
    weather: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'number' },
            main: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
          },
        },
      },
    },
    dt: {
      type: 'number',
      short_desc: 'Unix timestamp of the data',
    },
  },
} satisfies TQoreResponseType;

const WeatherConditionChange = QoreAppCreator.createLocalizedTrigger<
  typeof options &
    Partial<typeof cityNameOptions & typeof coordinatesOptions & typeof zipCodeOptions>
>({
  app: OPEN_WEATHER_MAP_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: OpenWeatherMapError,
    });

    const {
      location_type = 'city_name',
      city,
      lat,
      lon,
      zip,
      units = 'metric',
      condition_filter = 'any',
    } = context?.opts || {};

    let previousCondition: string | null = null;

    while (!should_stop()) {
      try {
        const weather = await fetchCurrentWeather(
          token,
          { location_type, city, lat, lon, zip },
          units
        );

        const currentCondition = weather.weather[0]?.main;

        // Skip if no weather condition data available
        if (!currentCondition) {
          await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
          continue;
        }

        // Only fire on condition change (not on initial poll)
        if (previousCondition !== null && currentCondition !== previousCondition) {
          // Apply filter if specified
          const matchesFilter =
            condition_filter === 'any' ||
            currentCondition.toLowerCase() === condition_filter.toLowerCase();

          if (matchesFilter) {
            update({
              ...weather,
              previous_condition: previousCondition,
              new_condition: currentCondition,
            });
          }
        }

        previousCondition = currentCondition;
      } catch (error) {
        // Log error but continue polling
        console.error(`Error polling weather for condition change: ${error}`);
      }

      await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
    }
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: OpenWeatherMapError,
    });

    const { location_type = 'city_name', city, lat, lon, zip, units = 'metric' } = context?.opts || {};

    const weather = await fetchCurrentWeather(
      token,
      { location_type, city, lat, lon, zip },
      units
    );

    const currentCondition = weather.weather[0]?.main || 'Clear';

    return {
      ...weather,
      previous_condition: currentCondition === 'Clear' ? 'Clouds' : 'Clear',
      new_condition: currentCondition,
    };
  },
  event_info: {
    desc: 'Triggered when weather conditions change',
    type: WeatherConditionChangeEventType,
  },
});

export default WeatherConditionChange;

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

const action = 'temperature_threshold';

const THRESHOLD_TYPE_OPTIONS = [
  { value: 'above', display_name: 'Goes Above' },
  { value: 'below', display_name: 'Goes Below' },
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
  threshold_type: {
    type: 'string',
    required: true,
    default_value: 'above',
    allowed_values: THRESHOLD_TYPE_OPTIONS,
  },
  threshold_value: {
    type: 'number',
    required: true,
  },
} satisfies TQoreOptions;

const TemperatureThresholdEventType = {
  type: 'hash',
  fields: {
    threshold_crossed: {
      type: 'string',
      short_desc: 'Direction of threshold crossing (above or below)',
    },
    threshold_value: {
      type: 'number',
      short_desc: 'The configured threshold value',
    },
    current_temp: {
      type: 'number',
      short_desc: 'Current temperature when threshold was crossed',
    },
    previous_temp: {
      type: 'number',
      short_desc: 'Previous temperature before crossing',
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

const TemperatureThreshold = QoreAppCreator.createLocalizedTrigger<
  typeof options &
    Partial<typeof cityNameOptions & typeof coordinatesOptions & typeof zipCodeOptions>
>({
  app: OPEN_WEATHER_MAP_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, threshold_type, threshold_value } = getQoreContextRequiredValues({
      context,
      optionFields: ['threshold_type', 'threshold_value'],
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
    } = context?.opts || {};

    let previousTemp: number | null = null;
    let wasAboveThreshold: boolean | null = null;

    while (!should_stop()) {
      try {
        const weather = await fetchCurrentWeather(
          token,
          { location_type, city, lat, lon, zip },
          units
        );

        const currentTemp = weather.main.temp;
        const isAboveThreshold = currentTemp >= threshold_value;

        // Only fire on threshold crossing (not on initial poll)
        if (wasAboveThreshold !== null && previousTemp !== null) {
          const shouldFireAbove =
            threshold_type === 'above' && !wasAboveThreshold && isAboveThreshold;
          const shouldFireBelow =
            threshold_type === 'below' && wasAboveThreshold && !isAboveThreshold;

          if (shouldFireAbove || shouldFireBelow) {
            update({
              ...weather,
              threshold_crossed: shouldFireAbove ? 'above' : 'below',
              threshold_value,
              current_temp: currentTemp,
              previous_temp: previousTemp,
            });
          }
        }

        wasAboveThreshold = isAboveThreshold;
        previousTemp = currentTemp;
      } catch (error) {
        // Log error but continue polling
        console.error(`Error polling weather for temperature threshold: ${error}`);
      }

      await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
    }
  },
  get_example_event_data: async (context) => {
    const { token, threshold_type, threshold_value } = getQoreContextRequiredValues({
      context,
      optionFields: ['threshold_type', 'threshold_value'],
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
    } = context?.opts || {};

    const weather = await fetchCurrentWeather(
      token,
      { location_type, city, lat, lon, zip },
      units
    );

    return {
      ...weather,
      threshold_crossed: threshold_type,
      threshold_value,
      current_temp: weather.main.temp,
      previous_temp: weather.main.temp - 1,
    };
  },
  event_info: {
    desc: 'Triggered when temperature crosses the configured threshold',
    type: TemperatureThresholdEventType,
  },
});

export default TemperatureThreshold;

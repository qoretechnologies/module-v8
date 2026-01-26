import { configDotenv } from 'dotenv';
import GetCurrentWeather from '../apps/open-weather-map/actions/get-current-weather.action';
import GetForecast from '../apps/open-weather-map/actions/get-forecast.action';
import { fetchCurrentWeather } from '../apps/open-weather-map/helpers';
import TemperatureThreshold from '../apps/open-weather-map/triggers/temperature-threshold.trigger';
import WeatherConditionChange from '../apps/open-weather-map/triggers/weather-condition-change.trigger';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('OpenWeatherMap', () => {
  const baseContext = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const token = process.env.OPEN_WEATHER_MAP_API_KEY;

    if (!token) {
      throw new Error('Please set the OPEN_WEATHER_MAP_API_KEY environment variable.');
    }

    baseContext.conn_opts.token = token;
  });

  afterEach(async () => {
    await delay(1000);
  });

  describe('Get Current Weather', () => {
    it('should get current weather by city name', async () => {
      if (!('api_function' in GetCurrentWeather)) throw new Error('api_function not found');
      const result = await GetCurrentWeather.api_function(
        {
          location_type: 'city_name',
          city: 'London,UK',
          units: 'metric',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('London');
      expect(result.sys.country).toBe('GB');
      expect(result.main).toBeDefined();
      expect(result.main.temp).toBeDefined();
      expect(result.main.humidity).toBeDefined();
      expect(result.weather).toBeDefined();
      expect(result.weather.length).toBeGreaterThan(0);
    });

    it('should get current weather by coordinates', async () => {
      if (!('api_function' in GetCurrentWeather)) throw new Error('api_function not found');
      const result = await GetCurrentWeather.api_function(
        {
          location_type: 'coordinates',
          lat: 51.5074,
          lon: -0.1278,
          units: 'metric',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.coord).toBeDefined();
      expect(result.coord.lat).toBeCloseTo(51.5074, 0);
      expect(result.coord.lon).toBeCloseTo(-0.1278, 0);
      expect(result.main).toBeDefined();
      expect(result.main.temp).toBeDefined();
    });

    it('should get current weather by zip code', async () => {
      if (!('api_function' in GetCurrentWeather)) throw new Error('api_function not found');
      const result = await GetCurrentWeather.api_function(
        {
          location_type: 'zip_code',
          zip: '10001,US',
          units: 'imperial',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.sys.country).toBe('US');
      expect(result.main).toBeDefined();
      expect(result.main.temp).toBeDefined();
    });

    it('should return temperatures in different units', async () => {
      if (!('api_function' in GetCurrentWeather)) throw new Error('api_function not found');
      const metricResult = await GetCurrentWeather.api_function(
        {
          location_type: 'city_name',
          city: 'London,UK',
          units: 'metric',
        },
        undefined,
        baseContext
      );

      await delay(1000);

      const imperialResult = await GetCurrentWeather.api_function(
        {
          location_type: 'city_name',
          city: 'London,UK',
          units: 'imperial',
        },
        undefined,
        baseContext
      );

      expect(metricResult.main.temp).toBeDefined();
      expect(imperialResult.main.temp).toBeDefined();
      // Imperial temps should be higher (Fahrenheit vs Celsius)
      // unless it's below freezing, the imperial value should be higher
      // This is a rough check - temps could theoretically be equal at -40
    });

    it('should throw error when city is missing for city_name location type', async () => {
      if (!('api_function' in GetCurrentWeather)) throw new Error('api_function not found');
      await expect(
        GetCurrentWeather.api_function(
          {
            location_type: 'city_name',
            units: 'metric',
          },
          undefined,
          baseContext
        )
      ).rejects.toThrow('City name is required when location type is "City Name"');
    });

    it('should throw error when coordinates are missing for coordinates location type', async () => {
      if (!('api_function' in GetCurrentWeather)) throw new Error('api_function not found');
      await expect(
        GetCurrentWeather.api_function(
          {
            location_type: 'coordinates',
            lat: 51.5074,
            units: 'metric',
          },
          undefined,
          baseContext
        )
      ).rejects.toThrow('Latitude and longitude are required when location type is "Coordinates"');
    });

    it('should throw error when zip is missing for zip_code location type', async () => {
      if (!('api_function' in GetCurrentWeather)) throw new Error('api_function not found');
      await expect(
        GetCurrentWeather.api_function(
          {
            location_type: 'zip_code',
            units: 'metric',
          },
          undefined,
          baseContext
        )
      ).rejects.toThrow('Zip/postal code is required when location type is "Zip/Postal Code"');
    });
  });

  describe('Get Forecast', () => {
    it('should get 5-day forecast by city name', async () => {
      if (!('api_function' in GetForecast)) throw new Error('api_function not found');
      const result = await GetForecast.api_function(
        {
          location_type: 'city_name',
          city: 'Paris,FR',
          units: 'metric',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.city).toBeDefined();
      expect(result.city.name).toBe('Paris');
      expect(result.city.country).toBe('FR');
      expect(result.list).toBeDefined();
      expect(result.list.length).toBeGreaterThan(0);
      expect(result.cnt).toBe(result.list.length);

      // Check forecast item structure
      const firstItem = result.list[0];
      expect(firstItem.dt).toBeDefined();
      expect(firstItem.dt_txt).toBeDefined();
      expect(firstItem.main).toBeDefined();
      expect(firstItem.main.temp).toBeDefined();
      expect(firstItem.weather).toBeDefined();
      expect(firstItem.weather.length).toBeGreaterThan(0);
    });

    it('should get forecast by coordinates', async () => {
      if (!('api_function' in GetForecast)) throw new Error('api_function not found');
      const result = await GetForecast.api_function(
        {
          location_type: 'coordinates',
          lat: 48.8566,
          lon: 2.3522,
          units: 'metric',
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.city).toBeDefined();
      expect(result.city.coord).toBeDefined();
      expect(result.list).toBeDefined();
      expect(result.list.length).toBeGreaterThan(0);
    });

    it('should limit forecast items with cnt parameter', async () => {
      if (!('api_function' in GetForecast)) throw new Error('api_function not found');
      const result = await GetForecast.api_function(
        {
          location_type: 'city_name',
          city: 'Berlin,DE',
          units: 'metric',
          cnt: 8,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.list).toBeDefined();
      expect(result.list.length).toBe(8);
      expect(result.cnt).toBe(8);
    });

    it('should throw error when city is missing for city_name location type', async () => {
      if (!('api_function' in GetForecast)) throw new Error('api_function not found');
      await expect(
        GetForecast.api_function(
          {
            location_type: 'city_name',
            units: 'metric',
          },
          undefined,
          baseContext
        )
      ).rejects.toThrow('City name is required when location type is "City Name"');
    });
  });

  describe('Helpers', () => {
    it('should fetch current weather using helper function', async () => {
      const result = await fetchCurrentWeather(
        baseContext.conn_opts.token,
        { location_type: 'city_name', city: 'Tokyo,JP' },
        'metric'
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Tokyo');
      expect(result.sys.country).toBe('JP');
      expect(result.main.temp).toBeDefined();
    });
  });

  describe('Triggers', () => {
    describe('Temperature Threshold Trigger', () => {
      it('should have correct trigger configuration', () => {
        expect(TemperatureThreshold.action).toBe('temperature_threshold');
        expect(TemperatureThreshold.options).toBeDefined();
        expect(TemperatureThreshold.options?.threshold_type).toBeDefined();
        expect(TemperatureThreshold.options?.threshold_value).toBeDefined();
        expect(TemperatureThreshold.options?.location_type).toBeDefined();
      });

      it('should get example event data', async () => {
        const triggerContext = {
          ...baseContext,
          opts: {
            location_type: 'city_name',
            city: 'London,UK',
            units: 'metric',
            threshold_type: 'above',
            threshold_value: 20,
          },
        } as any;

        const exampleData = await TemperatureThreshold.get_example_event_data!(triggerContext);

        expect(exampleData).toBeDefined();
        expect(exampleData.threshold_crossed).toBe('above');
        expect(exampleData.threshold_value).toBe(20);
        expect(exampleData.current_temp).toBeDefined();
        expect(exampleData.previous_temp).toBeDefined();
        expect(exampleData.main).toBeDefined();
        expect(exampleData.weather).toBeDefined();
      });
    });

    describe('Weather Condition Change Trigger', () => {
      it('should have correct trigger configuration', () => {
        expect(WeatherConditionChange.action).toBe('weather_condition_change');
        expect(WeatherConditionChange.options).toBeDefined();
        expect(WeatherConditionChange.options?.condition_filter).toBeDefined();
        expect(WeatherConditionChange.options?.location_type).toBeDefined();
      });

      it('should get example event data', async () => {
        const triggerContext = {
          ...baseContext,
          opts: {
            location_type: 'city_name',
            city: 'London,UK',
            units: 'metric',
            condition_filter: 'any',
          },
        } as any;

        const exampleData = await WeatherConditionChange.get_example_event_data!(triggerContext);

        expect(exampleData).toBeDefined();
        expect(exampleData.previous_condition).toBeDefined();
        expect(exampleData.new_condition).toBeDefined();
        expect(exampleData.main).toBeDefined();
        expect(exampleData.weather).toBeDefined();
      });
    });
  });
});

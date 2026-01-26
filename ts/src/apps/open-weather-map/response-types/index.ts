/**
 * Weather condition details
 */
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

/**
 * Main weather parameters
 */
export interface MainWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

/**
 * Wind information
 */
export interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

/**
 * Cloud coverage
 */
export interface Clouds {
  all: number;
}

/**
 * Rain volume
 */
export interface Rain {
  '1h'?: number;
  '3h'?: number;
}

/**
 * Snow volume
 */
export interface Snow {
  '1h'?: number;
  '3h'?: number;
}

/**
 * System information
 */
export interface Sys {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

/**
 * Geographic coordinates
 */
export interface Coord {
  lon: number;
  lat: number;
}

/**
 * Current weather response from OpenWeatherMap API
 */
export interface CurrentWeatherResponse {
  coord: Coord;
  weather: WeatherCondition[];
  base: string;
  main: MainWeather;
  visibility: number;
  wind: Wind;
  clouds: Clouds;
  rain?: Rain;
  snow?: Snow;
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

/**
 * City information in forecast response
 */
export interface ForecastCity {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

/**
 * Individual forecast item (3-hour interval)
 */
export interface ForecastItem {
  dt: number;
  main: MainWeather;
  weather: WeatherCondition[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  rain?: Rain;
  snow?: Snow;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

/**
 * 5-day/3-hour forecast response from OpenWeatherMap API
 */
export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: ForecastCity;
}

/**
 * Qore response types for actions
 */
export const CurrentWeatherResponseType = {
  type: 'hash',
  fields: {
    coord: {
      type: {
        type: 'hash',
        fields: {
          lon: { type: 'number' },
          lat: { type: 'number' },
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
          sea_level: { type: 'number' },
          grnd_level: { type: 'number' },
        },
      },
    },
    visibility: { type: 'number' },
    wind: {
      type: {
        type: 'hash',
        fields: {
          speed: { type: 'number' },
          deg: { type: 'number' },
          gust: { type: 'number' },
        },
      },
    },
    clouds: {
      type: {
        type: 'hash',
        fields: {
          all: { type: 'number' },
        },
      },
    },
    dt: { type: 'number' },
    timezone: { type: 'number' },
    id: { type: 'number' },
    name: { type: 'string' },
    sys: {
      type: {
        type: 'hash',
        fields: {
          country: { type: 'string' },
          sunrise: { type: 'number' },
          sunset: { type: 'number' },
        },
      },
    },
  },
} as const;

export const ForecastResponseType = {
  type: 'hash',
  fields: {
    cnt: { type: 'number' },
    list: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            dt: { type: 'number' },
            dt_txt: { type: 'string' },
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
            wind: {
              type: {
                type: 'hash',
                fields: {
                  speed: { type: 'number' },
                  deg: { type: 'number' },
                  gust: { type: 'number' },
                },
              },
            },
            clouds: {
              type: {
                type: 'hash',
                fields: {
                  all: { type: 'number' },
                },
              },
            },
            visibility: { type: 'number' },
            pop: { type: 'number' },
          },
        },
      },
    },
    city: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'number' },
          name: { type: 'string' },
          country: { type: 'string' },
          population: { type: 'number' },
          timezone: { type: 'number' },
          sunrise: { type: 'number' },
          sunset: { type: 'number' },
          coord: {
            type: {
              type: 'hash',
              fields: {
                lon: { type: 'number' },
                lat: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
} as const;

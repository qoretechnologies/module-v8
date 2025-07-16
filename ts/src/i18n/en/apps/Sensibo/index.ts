/* eslint-disable max-len */
const SensiboAppEn = {
  displayName: 'Sensibo',
  shortDesc: 'Control your Sensibo devices',
  longDesc: 'Integrate with Sensibo to control your smart AC units and optimize your home climate.',
  actions: {
    change_device_property: {
      displayName: 'Change Device Property',
      shortDesc: 'Change a specific property of a Sensibo device',
      longDesc:
        'Update individual properties like power state, mode, fan level, temperature, or swing settings for a Sensibo device',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose property you want to change',
        },
        property: {
          displayName: 'Property',
          shortDesc: 'Select the property to change',
          longDesc:
            'Choose which device property you want to modify (on/off, mode, fan level, temperature, temperature unit, or swing)',
        },
        value: {
          displayName: 'Value',
          shortDesc: 'New value for the property',
          longDesc: 'Set the new value for the selected property',
        },
      },
    },
    create_schedule: {
      displayName: 'Create Schedule',
      shortDesc: 'Create a new schedule for a Sensibo device',
      longDesc:
        'Set up automated scheduling to control your Sensibo device at specific times and days',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device for which you want to create a schedule',
        },
        targetTimeLocale: {
          displayName: 'Target Time',
          shortDesc: 'Time when the schedule should trigger',
          longDesc: 'Specify the time when the scheduled action should be executed',
        },
        timezone: {
          displayName: 'Timezone',
          shortDesc: 'Timezone for the schedule',
          longDesc: 'Set the timezone for the scheduled action',
        },
        acState: {
          displayName: 'AC State',
          shortDesc: 'Desired AC settings',
          longDesc:
            'Configure the air conditioning settings that will be applied when the schedule triggers',
          type: {
            fields: {
              on: {
                displayName: 'Power State',
                shortDesc: 'Turn AC on or off',
                longDesc: 'Set whether the air conditioner should be turned on or off',
              },
              mode: {
                displayName: 'Mode',
                shortDesc: 'AC operating mode',
                longDesc: 'Set the air conditioner operating mode (cool, heat, fan, etc.)',
              },
              fanLevel: {
                displayName: 'Fan Level',
                shortDesc: 'Fan speed setting',
                longDesc: 'Configure the fan speed level',
              },
              targetTemperature: {
                displayName: 'Target Temperature',
                shortDesc: 'Desired temperature',
                longDesc: 'Set the target temperature for the air conditioner',
              },
              temperatureUnit: {
                displayName: 'Temperature Unit',
                shortDesc: 'Temperature measurement unit',
                longDesc: 'Choose between Celsius or Fahrenheit for temperature display',
              },
              swing: {
                displayName: 'Swing',
                shortDesc: 'Air flow direction',
                longDesc: 'Configure the air flow swing settings',
              },
            },
          },
        },
        recurOnDaysOfWeek: {
          displayName: 'Recurring Days',
          shortDesc: 'Days when schedule repeats',
          longDesc: 'Select which days of the week the schedule should repeat',
        },
      },
    },
    delete_device_timer: {
      displayName: 'Delete Device Timer',
      shortDesc: 'Remove the active timer from a Sensibo device',
      longDesc: 'Cancel any currently active timer that was set for the Sensibo device',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose timer you want to delete',
        },
      },
    },
    delete_schedule: {
      displayName: 'Delete Schedule',
      shortDesc: 'Remove a schedule from a Sensibo device',
      longDesc: 'Delete an existing schedule that was previously created for the Sensibo device',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose schedule you want to delete',
        },
        schedule: {
          displayName: 'Schedule',
          shortDesc: 'Schedule identifier',
          longDesc: 'Specify the schedule ID that you want to delete',
        },
      },
    },
    enable_climate_react: {
      displayName: 'Enable Climate React',
      shortDesc: 'Enable or disable Climate React feature',
      longDesc:
        'Turn on or off the Climate React smart automation feature that automatically adjusts your AC based on room conditions',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc:
            'Choose the Sensibo device for which you want to enable or disable Climate React',
        },
        enable: {
          displayName: 'Enable',
          shortDesc: 'Enable or disable Climate React',
          longDesc: 'Set whether Climate React should be enabled (true) or disabled (false)',
        },
      },
    },
    get_ac_states: {
      displayName: 'Get AC States',
      shortDesc: 'Retrieve AC state history',
      longDesc: 'Get the history of air conditioner state changes for a Sensibo device',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose AC state history you want to retrieve',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of records',
          longDesc: 'Specify the maximum number of AC state records to retrieve',
        },
      },
    },
    get_devices: {
      displayName: 'Get Devices',
      shortDesc: 'Retrieve all available Sensibo devices',
      longDesc: 'Get a list of all Sensibo devices associated with your account',
    },
    get_climate_react_settings: {
      displayName: 'Get Climate React Settings',
      shortDesc: 'Retrieve Climate React configuration',
      longDesc: 'Get the current Climate React smart automation settings for a Sensibo device',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose Climate React settings you want to retrieve',
        },
      },
    },
    get_current_timer: {
      displayName: 'Get Current Timer',
      shortDesc: 'Retrieve active timer information',
      longDesc: 'Get details about any currently active timer set for a Sensibo device',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose current timer you want to check',
        },
      },
    },
    get_device: {
      displayName: 'Get Device',
      shortDesc: 'Retrieve detailed device information',
      longDesc:
        'Get comprehensive information about a specific Sensibo device including current status and capabilities',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose detailed information you want to retrieve',
        },
      },
    },
    get_historical_measurements: {
      displayName: 'Get Historical Measurements',
      shortDesc: 'Retrieve sensor measurement history',
      longDesc:
        'Get historical temperature, humidity, and other sensor measurements from a Sensibo device',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose measurement history you want to retrieve',
        },
        days: {
          displayName: 'Days',
          shortDesc: 'Number of days to retrieve',
          longDesc: 'Specify how many days of historical measurements to retrieve',
        },
      },
    },
    get_schedule: {
      displayName: 'Get Schedule',
      shortDesc: 'Retrieve specific schedule details',
      longDesc:
        'Get detailed information about a specific schedule configured for a Sensibo device',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose schedule you want to retrieve',
        },
        schedule: {
          displayName: 'Schedule',
          shortDesc: 'Schedule identifier',
          longDesc: 'Specify the schedule ID that you want to retrieve details for',
        },
      },
    },
    get_schedules: {
      displayName: 'Get Schedules',
      shortDesc: 'Retrieve all device schedules',
      longDesc: 'Get a list of all schedules configured for a Sensibo device',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose schedules you want to retrieve',
        },
      },
    },
    set_climate_react_configuration: {
      displayName: 'Set Climate React Configuration',
      shortDesc: 'Configure Climate React automation settings',
      longDesc:
        'Set up detailed Climate React configuration including temperature thresholds and corresponding AC states',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device for which you want to configure Climate React',
        },
        enabled: {
          displayName: 'Enabled',
          shortDesc: 'Enable Climate React',
          longDesc: 'Set whether Climate React should be enabled',
        },
        lowTemperatureThreshold: {
          displayName: 'Low Temperature Threshold',
          shortDesc: 'Temperature trigger for low threshold',
          longDesc: 'Set the temperature below which the low temperature action will be triggered',
        },
        lowTemperatureState: {
          displayName: 'Low Temperature State',
          shortDesc: 'AC settings for low temperature',
          longDesc:
            'Configure the air conditioner settings to apply when temperature goes below the low threshold',
          type: {
            fields: {
              on: {
                displayName: 'Power State',
                shortDesc: 'Turn AC on or off',
                longDesc:
                  'Set whether the air conditioner should be turned on or off when low temperature is reached',
              },
            },
          },
        },
        highTemperatureThreshold: {
          displayName: 'High Temperature Threshold',
          shortDesc: 'Temperature trigger for high threshold',
          longDesc: 'Set the temperature above which the high temperature action will be triggered',
        },
        highTemperatureState: {
          displayName: 'High Temperature State',
          shortDesc: 'AC settings for high temperature',
          longDesc:
            'Configure the air conditioner settings to apply when temperature goes above the high threshold',
          type: {
            fields: {
              on: {
                displayName: 'Power State',
                shortDesc: 'Turn AC on or off',
                longDesc:
                  'Set whether the air conditioner should be turned on or off when high temperature is reached',
              },
              mode: {
                displayName: 'Mode',
                shortDesc: 'AC operating mode',
                longDesc: 'Set the air conditioner operating mode for high temperature conditions',
              },
            },
          },
        },
      },
    },
    set_device_state: {
      displayName: 'Set Device State',
      shortDesc: 'Configure complete device state',
      longDesc:
        'Set multiple air conditioner settings at once including power, mode, temperature, and fan settings',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose state you want to configure',
        },
        on: {
          displayName: 'Power State',
          shortDesc: 'Turn device on or off',
          longDesc: 'Set whether the air conditioner should be turned on or off',
        },
        mode: {
          displayName: 'Mode',
          shortDesc: 'AC operating mode',
          longDesc: 'Set the air conditioner operating mode (cool, heat, fan, etc.)',
        },
        fanLevel: {
          displayName: 'Fan Level',
          shortDesc: 'Fan speed setting',
          longDesc: 'Configure the fan speed level',
        },
        targetTemperature: {
          displayName: 'Target Temperature',
          shortDesc: 'Desired temperature',
          longDesc: 'Set the target temperature for the air conditioner',
        },
        temperatureUnit: {
          displayName: 'Temperature Unit',
          shortDesc: 'Temperature measurement unit',
          longDesc: 'Choose between Celsius or Fahrenheit for temperature display',
        },
        swing: {
          displayName: 'Swing',
          shortDesc: 'Air flow direction',
          longDesc: 'Configure the air flow swing settings',
        },
      },
    },
    set_device_timer: {
      displayName: 'Set Device Timer',
      shortDesc: 'Create a timer for device state change',
      longDesc: 'Set a timer that will change the device state after a specified number of minutes',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device for which you want to set a timer',
        },
        minutesFromNow: {
          displayName: 'Minutes From Now',
          shortDesc: 'Timer duration in minutes',
          longDesc: 'Specify how many minutes from now the timer should trigger',
        },
        acState: {
          displayName: 'AC State',
          shortDesc: 'AC settings for timer',
          longDesc:
            'Configure the air conditioner settings that will be applied when the timer expires',
          type: {
            fields: {
              on: {
                displayName: 'Power State',
                shortDesc: 'Turn AC on or off',
                longDesc:
                  'Set whether the air conditioner should be turned on or off when timer expires',
              },
              mode: {
                displayName: 'Mode',
                shortDesc: 'AC operating mode',
                longDesc: 'Set the air conditioner operating mode for when the timer expires',
              },
              fanLevel: {
                displayName: 'Fan Level',
                shortDesc: 'Fan speed setting',
                longDesc: 'Configure the fan speed level for when the timer expires',
              },
              targetTemperature: {
                displayName: 'Target Temperature',
                shortDesc: 'Desired temperature',
                longDesc: 'Set the target temperature for when the timer expires',
              },
              temperatureUnit: {
                displayName: 'Temperature Unit',
                shortDesc: 'Temperature measurement unit',
                longDesc: 'Choose between Celsius or Fahrenheit for temperature display',
              },
              swing: {
                displayName: 'Swing',
                shortDesc: 'Air flow direction',
                longDesc: 'Configure the air flow swing settings for when the timer expires',
              },
            },
          },
        },
      },
    },
    toggle_schedule: {
      displayName: 'Toggle Schedule',
      shortDesc: 'Enable or disable a schedule',
      longDesc: 'Turn an existing schedule on or off without deleting it',
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Select the Sensibo device',
          longDesc: 'Choose the Sensibo device whose schedule you want to toggle',
        },
        schedule: {
          displayName: 'Schedule',
          shortDesc: 'Schedule identifier',
          longDesc: 'Specify the schedule ID that you want to enable or disable',
        },
        isEnabled: {
          displayName: 'Is Enabled',
          shortDesc: 'Enable or disable the schedule',
          longDesc: 'Set whether the schedule should be enabled (true) or disabled (false)',
        },
      },
    },
  },
  triggers: {},
};

export default SensiboAppEn;

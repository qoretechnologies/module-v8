import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const ZoomTimezoneAllowedValues = [
  {
    value: 'Pacific/Midway',
    display_name: 'Midway Island, Samoa',
  },
  {
    value: 'Pacific/Pago_Pago',
    display_name: 'Pago Pago',
  },
  {
    value: 'Pacific/Honolulu',
    display_name: 'Hawaii',
  },
  {
    value: 'America/Anchorage',
    display_name: 'Alaska',
  },
  {
    value: 'America/Vancouver',
    display_name: 'Vancouver',
  },
  {
    value: 'America/Los_Angeles',
    display_name: 'Pacific Time (US and Canada)',
  },
  {
    value: 'America/Tijuana',
    display_name: 'Tijuana',
  },
  {
    value: 'America/Edmonton',
    display_name: 'Edmonton',
  },
  {
    value: 'America/Denver',
    display_name: 'Mountain Time (US and Canada)',
  },
  {
    value: 'America/Phoenix',
    display_name: 'Arizona',
  },
  {
    value: 'America/Mazatlan',
    display_name: 'Mazatlan',
  },
  {
    value: 'America/Winnipeg',
    display_name: 'Winnipeg',
  },
  {
    value: 'America/Regina',
    display_name: 'Saskatchewan',
  },
  {
    value: 'America/Chicago',
    display_name: 'Central Time (US and Canada)',
  },
  {
    value: 'America/Mexico_City',
    display_name: 'Mexico City',
  },
  {
    value: 'America/Guatemala',
    display_name: 'Guatemala',
  },
  {
    value: 'America/El_Salvador',
    display_name: 'El Salvador',
  },
  {
    value: 'America/Managua',
    display_name: 'Managua',
  },
  {
    value: 'America/Costa_Rica',
    display_name: 'Costa Rica',
  },
  {
    value: 'America/Montreal',
    display_name: 'Montreal',
  },
  {
    value: 'America/New_York',
    display_name: 'Eastern Time (US and Canada)',
  },
  {
    value: 'America/Indianapolis',
    display_name: 'Indiana (East)',
  },
  {
    value: 'America/Panama',
    display_name: 'Panama',
  },
  {
    value: 'America/Bogota',
    display_name: 'Bogota',
  },
  {
    value: 'America/Lima',
    display_name: 'Lima',
  },
  {
    value: 'America/Halifax',
    display_name: 'Halifax',
  },
  {
    value: 'America/Puerto_Rico',
    display_name: 'Puerto Rico',
  },
  {
    value: 'America/Caracas',
    display_name: 'Caracas',
  },
  {
    value: 'America/Santiago',
    display_name: 'Santiago',
  },
  {
    value: 'America/St_Johns',
    display_name: 'Newfoundland and Labrador',
  },
  {
    value: 'America/Montevideo',
    display_name: 'Montevideo',
  },
  {
    value: 'America/Araguaina',
    display_name: 'Brasilia',
  },
  {
    value: 'America/Argentina/Buenos_Aires',
    display_name: 'Buenos Aires, Georgetown',
  },
  {
    value: 'America/Godthab',
    display_name: 'Greenland',
  },
  {
    value: 'America/Sao_Paulo',
    display_name: 'Sao Paulo',
  },
  {
    value: 'Atlantic/Azores',
    display_name: 'Azores',
  },
  {
    value: 'Canada/Atlantic',
    display_name: 'Atlantic Time (Canada)',
  },
  {
    value: 'Atlantic/Cape_Verde',
    display_name: 'Cape Verde Islands',
  },
  {
    value: 'UTC',
    display_name: 'Universal Time UTC',
  },
  {
    value: 'Etc/Greenwich',
    display_name: 'Greenwich Mean Time',
  },
  {
    value: 'Europe/Belgrade',
    display_name: 'Belgrade, Bratislava, Ljubljana',
  },
  {
    value: 'CET',
    display_name: 'Sarajevo, Skopje, Zagreb',
  },
  {
    value: 'Atlantic/Reykjavik',
    display_name: 'Reykjavik',
  },
  {
    value: 'Europe/Dublin',
    display_name: 'Dublin',
  },
  {
    value: 'Europe/London',
    display_name: 'London',
  },
  {
    value: 'Europe/Lisbon',
    display_name: 'Lisbon',
  },
  {
    value: 'Africa/Casablanca',
    display_name: 'Casablanca',
  },
  {
    value: 'Africa/Nouakchott',
    display_name: 'Nouakchott',
  },
  {
    value: 'Europe/Oslo',
    display_name: 'Oslo',
  },
  {
    value: 'Europe/Copenhagen',
    display_name: 'Copenhagen',
  },
  {
    value: 'Europe/Brussels',
    display_name: 'Brussels',
  },
  {
    value: 'Europe/Berlin',
    display_name: 'Amsterdam, Berlin, Rome, Stockholm, Vienna',
  },
  {
    value: 'Europe/Helsinki',
    display_name: 'Helsinki',
  },
  {
    value: 'Europe/Amsterdam',
    display_name: 'Amsterdam',
  },
  {
    value: 'Europe/Rome',
    display_name: 'Rome',
  },
  {
    value: 'Europe/Stockholm',
    display_name: 'Stockholm',
  },
  {
    value: 'Europe/Vienna',
    display_name: 'Vienna',
  },
  {
    value: 'Europe/Luxembourg',
    display_name: 'Luxembourg',
  },
  {
    value: 'Europe/Paris',
    display_name: 'Paris',
  },
  {
    value: 'Europe/Zurich',
    display_name: 'Zurich',
  },
  {
    value: 'Europe/Madrid',
    display_name: 'Madrid',
  },
  {
    value: 'Africa/Bangui',
    display_name: 'West Central Africa',
  },
  {
    value: 'Africa/Algiers',
    display_name: 'Algiers',
  },
  {
    value: 'Africa/Tunis',
    display_name: 'Tunis',
  },
  {
    value: 'Africa/Harare',
    display_name: 'Harare, Pretoria',
  },
  {
    value: 'Africa/Nairobi',
    display_name: 'Nairobi',
  },
  {
    value: 'Europe/Warsaw',
    display_name: 'Warsaw',
  },
  {
    value: 'Europe/Prague',
    display_name: 'Prague Bratislava',
  },
  {
    value: 'Europe/Budapest',
    display_name: 'Budapest',
  },
  {
    value: 'Europe/Sofia',
    display_name: 'Sofia',
  },
  {
    value: 'Europe/Istanbul',
    display_name: 'Istanbul',
  },
  {
    value: 'Europe/Athens',
    display_name: 'Athens',
  },
  {
    value: 'Europe/Bucharest',
    display_name: 'Bucharest',
  },
  {
    value: 'Asia/Nicosia',
    display_name: 'Nicosia',
  },
  {
    value: 'Asia/Beirut',
    display_name: 'Beirut',
  },
  {
    value: 'Asia/Damascus',
    display_name: 'Damascus',
  },
  {
    value: 'Asia/Jerusalem',
    display_name: 'Jerusalem',
  },
  {
    value: 'Asia/Amman',
    display_name: 'Amman',
  },
  {
    value: 'Africa/Tripoli',
    display_name: 'Tripoli',
  },
  {
    value: 'Africa/Cairo',
    display_name: 'Cairo',
  },
  {
    value: 'Africa/Johannesburg',
    display_name: 'Johannesburg',
  },
  {
    value: 'Europe/Moscow',
    display_name: 'Moscow',
  },
  {
    value: 'Asia/Baghdad',
    display_name: 'Baghdad',
  },
  {
    value: 'Asia/Kuwait',
    display_name: 'Kuwait',
  },
  {
    value: 'Asia/Riyadh',
    display_name: 'Riyadh',
  },
  {
    value: 'Asia/Bahrain',
    display_name: 'Bahrain',
  },
  {
    value: 'Asia/Qatar',
    display_name: 'Qatar',
  },
  {
    value: 'Asia/Aden',
    display_name: 'Aden',
  },
  {
    value: 'Asia/Tehran',
    display_name: 'Tehran',
  },
  {
    value: 'Africa/Khartoum',
    display_name: 'Khartoum',
  },
  {
    value: 'Africa/Djibouti',
    display_name: 'Djibouti',
  },
  {
    value: 'Africa/Mogadishu',
    display_name: 'Mogadishu',
  },
  {
    value: 'Asia/Dubai',
    display_name: 'Dubai',
  },
  {
    value: 'Asia/Muscat',
    display_name: 'Muscat',
  },
  {
    value: 'Asia/Baku',
    display_name: 'Baku, Tbilisi, Yerevan',
  },
  {
    value: 'Asia/Kabul',
    display_name: 'Kabul',
  },
  {
    value: 'Asia/Yekaterinburg',
    display_name: 'Yekaterinburg',
  },
  {
    value: 'Asia/Tashkent',
    display_name: 'Islamabad, Karachi, Tashkent',
  },
  {
    value: 'Asia/Calcutta',
    display_name: 'India',
  },
  {
    value: 'Asia/Kathmandu',
    display_name: 'Kathmandu',
  },
  {
    value: 'Asia/Novosibirsk',
    display_name: 'Novosibirsk',
  },
  {
    value: 'Asia/Almaty',
    display_name: 'Almaty',
  },
  {
    value: 'Asia/Dacca',
    display_name: 'Dacca',
  },
  {
    value: 'Asia/Krasnoyarsk',
    display_name: 'Krasnoyarsk',
  },
  {
    value: 'Asia/Dhaka',
    display_name: 'Astana, Dhaka',
  },
  {
    value: 'Asia/Bangkok',
    display_name: 'Bangkok',
  },
  {
    value: 'Asia/Saigon',
    display_name: 'Vietnam',
  },
  {
    value: 'Asia/Jakarta',
    display_name: 'Jakarta',
  },
  {
    value: 'Asia/Irkutsk',
    display_name: 'Irkutsk, Ulaanbaatar',
  },
  {
    value: 'Asia/Shanghai',
    display_name: 'Beijing, Shanghai',
  },
  {
    value: 'Asia/Hong_Kong',
    display_name: 'Hong Kong',
  },
  {
    value: 'Asia/Taipei',
    display_name: 'Taipei',
  },
  {
    value: 'Asia/Kuala_Lumpur',
    display_name: 'Kuala Lumpur',
  },
  {
    value: 'Asia/Singapore',
    display_name: 'Singapore',
  },
  {
    value: 'Australia/Perth',
    display_name: 'Perth',
  },
  {
    value: 'Asia/Yakutsk',
    display_name: 'Yakutsk',
  },
  {
    value: 'Asia/Seoul',
    display_name: 'Seoul',
  },
  {
    value: 'Asia/Tokyo',
    display_name: 'Osaka, Sapporo, Tokyo',
  },
  {
    value: 'Australia/Darwin',
    display_name: 'Darwin',
  },
  {
    value: 'Australia/Adelaide',
    display_name: 'Adelaide',
  },
  {
    value: 'Asia/Vladivostok',
    display_name: 'Vladivostok',
  },
  {
    value: 'Pacific/Port_Moresby',
    display_name: 'Guam, Port Moresby',
  },
  {
    value: 'Australia/Brisbane',
    display_name: 'Brisbane',
  },
  {
    value: 'Australia/Sydney',
    display_name: 'Canberra, Melbourne, Sydney',
  },
  {
    value: 'Australia/Hobart',
    display_name: 'Hobart',
  },
  {
    value: 'Asia/Magadan',
    display_name: 'Magadan',
  },
  {
    value: 'SST',
    display_name: 'Solomon Islands',
  },
  {
    value: 'Pacific/Noumea',
    display_name: 'New Caledonia',
  },
  {
    value: 'Asia/Kamchatka',
    display_name: 'Kamchatka',
  },
  {
    value: 'Pacific/Fiji',
    display_name: 'Fiji Islands, Marshall Islands',
  },
  {
    value: 'Pacific/Auckland',
    display_name: 'Auckland, Wellington',
  },
  {
    value: 'Asia/Kolkata',
    display_name: 'Mumbai, Kolkata, New Delhi',
  },
  {
    value: 'Europe/Kiev',
    display_name: 'Kiev',
  },
  {
    value: 'America/Tegucigalpa',
    display_name: 'Tegucigalpa',
  },
  {
    value: 'Pacific/Apia',
    display_name: 'Independent State of Samoa',
  },
] satisfies IQoreAllowedValue<string>[];

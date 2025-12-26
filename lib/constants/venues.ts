// Common timezones
export const TIMEZONES = [
	"(UTC-08:00) Pacific Time (US & Canada)",
	"(UTC-07:00) Mountain Time (US & Canada)",
	"(UTC-06:00) Central Time (US & Canada)",
	"(UTC-05:00) Eastern Time (US & Canada)",
	"(UTC+00:00) GMT",
	"(UTC+01:00) Central European Time",
	"(UTC+05:30) India Standard Time",
	"(UTC+08:00) China Standard Time",
	"(UTC+09:00) Japan Standard Time",
];

// Common currency locales with their symbols
export const CURRENCY_LOCALES = [
	{ value: "en-US", label: "USD - $1,234.00", symbol: "$" },
	{ value: "en-CA", label: "CAD - $1,234.00", symbol: "$" },
	{ value: "en-GB", label: "GBP - £1,234.00", symbol: "£" },
	{ value: "en-AU", label: "AUD - $1,234.00", symbol: "$" },
	{ value: "fr-FR", label: "EUR - 1 234,00 €", symbol: "€" },
	{ value: "ja-JP", label: "JPY - ¥1,234", symbol: "¥" },
	{ value: "zh-CN", label: "CNY - ¥1,234.00", symbol: "¥" },
];

export const getCurrencySymbol = (locale: string): string => {
	const currency = CURRENCY_LOCALES.find((c) => c.value === locale);
	return currency?.symbol || "$";
};

// Common countries
export const COUNTRIES = [
	"United States",
	"Canada",
	"United Kingdom",
	"Australia",
	"France",
	"Germany",
	"Italy",
	"Spain",
	"Japan",
	"China",
	"Mexico",
	"Brazil",
	"India",
	"Other",
];

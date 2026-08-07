import axios from "axios";

// Fallback rates relative to 1 USD
export const FALLBACK_RATES = {
  USD: 1.0,
  INR: 83.5,
  JPY: 150.0,
  EUR: 0.92,
  GBP: 0.79,
  KRW: 1350.0,
  THB: 35.0,
  AUD: 1.50,
  CAD: 1.35,
  CHF: 0.88,
  BRL: 5.0,
  MXN: 17.0,
  EGP: 48.0,
  MYR: 4.7,
  NPR: 133.0,
  NZD: 1.65,
  LKR: 300.0,
  IDR: 15500.0,
  AED: 3.67,
  SGD: 1.35,
  NOK: 10.5,
  ISK: 138.0
};

let liveRates = { ...FALLBACK_RATES };
let ratesLoaded = false;

export async function fetchLiveRates() {
  if (ratesLoaded) return liveRates;
  try {
    const res = await axios.get("https://open.er-api.com/v6/latest/USD", { timeout: 3000 });
    if (res.data && res.data.rates) {
      liveRates = { ...FALLBACK_RATES, ...res.data.rates };
      ratesLoaded = true;
      console.log("Successfully fetched live exchange rates from Open Exchange Rates API.");
    }
  } catch (err) {
    console.warn("Failed to fetch live exchange rates, using fallback rates:", err.message);
  }
  return liveRates;
}

export function getRate(code) {
  const cleanCode = String(code || "USD").toUpperCase();
  return liveRates[cleanCode] || FALLBACK_RATES[cleanCode] || 1.0;
}

export function convertUSD(amountInUSD, targetCode) {
  const rate = getRate(targetCode);
  return amountInUSD * rate;
}

export function convert(amount, fromCode, toCode) {
  const fromRate = getRate(fromCode);
  const toRate = getRate(toCode);
  return (amount / fromRate) * toRate;
}

export const CURRENCY_SYMBOLS = {
  USD: "$",
  INR: "₹",
  JPY: "¥",
  EUR: "€",
  GBP: "£",
  KRW: "₩",
  THB: "฿",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  BRL: "R$",
  MXN: "MX$",
  EGP: "EGP",
  MYR: "RM",
  NPR: "रू",
  NZD: "NZ$",
  LKR: "Rs",
  IDR: "Rp",
  AED: "AED",
  SGD: "S$",
  NOK: "kr",
  ISK: "kr"
};

export function getCurrencySymbol(code) {
  const cleanCode = String(code || "USD").toUpperCase();
  return CURRENCY_SYMBOLS[cleanCode] || cleanCode;
}

export function getCurrencyCodeFromString(currencyStr) {
  if (!currencyStr) return "USD";
  const match = currencyStr.match(/\(([A-Z]{3})\)/);
  if (match) return match[1];
  
  // Try to match uppercase 3 letters in string
  const parts = currencyStr.split(" ");
  for (const part of parts) {
    const clean = part.replace(/[^A-Z]/g, "");
    if (clean.length === 3 && FALLBACK_RATES[clean]) {
      return clean;
    }
  }
  
  // Try mapping common names
  const lower = currencyStr.toLowerCase();
  if (lower.includes("rupee") || lower.includes("inr")) return "INR";
  if (lower.includes("yen") || lower.includes("jpy")) return "JPY";
  if (lower.includes("euro") || lower.includes("eur")) return "EUR";
  if (lower.includes("pound") || lower.includes("gbp") || lower.includes("sterling")) return "GBP";
  if (lower.includes("won") || lower.includes("krw")) return "KRW";
  if (lower.includes("baht") || lower.includes("thb")) return "THB";
  if (lower.includes("australian") || lower.includes("aud")) return "AUD";
  if (lower.includes("canadian") || lower.includes("cad")) return "CAD";
  if (lower.includes("swiss") || lower.includes("chf") || lower.includes("franc")) return "CHF";
  if (lower.includes("real") || lower.includes("brl")) return "BRL";
  if (lower.includes("peso") || lower.includes("mxn") || lower.includes("mexican")) return "MXN";
  if (lower.includes("rupiah") || lower.includes("idr")) return "IDR";
  if (lower.includes("dirham") || lower.includes("aed")) return "AED";
  if (lower.includes("singapore") || lower.includes("sgd")) return "SGD";
  if (lower.includes("kroner") || lower.includes("krone") || lower.includes("nok")) return "NOK";
  if (lower.includes("krona") || lower.includes("isk")) return "ISK";
  if (lower.includes("zealand") || lower.includes("nzd")) return "NZD";
  if (lower.includes("dollar") || lower.includes("usd")) return "USD";
  
  return "USD";
}

export function formatPrice(amount, code, decimals = 0) {
  const symbol = getCurrencySymbol(code);
  const formattedAmount = Math.round(amount).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  // Place symbol in front or back depending on currency
  if (code === "CHF") return `${formattedAmount} CHF`;
  return `${symbol}${formattedAmount}`;
}

export function formatDualPrice(usdAmount, destCurrencyStr, userCurrencyCode = "INR") {
  const destCode = getCurrencyCodeFromString(destCurrencyStr);
  const destVal = convertUSD(usdAmount, destCode);
  const destFormatted = formatPrice(destVal, destCode);
  
  const cleanUserCode = String(userCurrencyCode || "INR").toUpperCase();
  if (destCode === cleanUserCode) {
    return destFormatted;
  }
  
  const userVal = convertUSD(usdAmount, cleanUserCode);
  const userFormatted = formatPrice(userVal, cleanUserCode);
  return `${destFormatted} (≈ ${userFormatted})`;
}

export function formatDualPriceFromDest(destAmount, destCurrencyStr, userCurrencyCode = "INR") {
  const destCode = getCurrencyCodeFromString(destCurrencyStr);
  const destFormatted = formatPrice(destAmount, destCode);
  
  const cleanUserCode = String(userCurrencyCode || "INR").toUpperCase();
  if (destCode === cleanUserCode) {
    return destFormatted;
  }
  
  const userVal = convert(destAmount, destCode, cleanUserCode);
  const userFormatted = formatPrice(userVal, cleanUserCode);
  return `${destFormatted} (≈ ${userFormatted})`;
}

export const DEPARTURE_CITIES = [
  { name: "Bengaluru", country: "India", code: "BLR", currency: "INR", symbol: "₹", coords: [12.9716, 77.5946] },
  { name: "Mumbai", country: "India", code: "BOM", currency: "INR", symbol: "₹", coords: [19.0760, 72.8777] },
  { name: "Delhi", country: "India", code: "DEL", currency: "INR", symbol: "₹", coords: [28.7041, 77.1025] },
  { name: "New York", country: "United States", code: "JFK", currency: "USD", symbol: "$", coords: [40.7128, -74.0060] },
  { name: "London", country: "United Kingdom", code: "LHR", currency: "GBP", symbol: "£", coords: [51.5074, -0.1278] },
  { name: "Tokyo", country: "Japan", code: "HND", currency: "JPY", symbol: "¥", coords: [35.6762, 139.6503] },
  { name: "Paris", country: "France", code: "CDG", currency: "EUR", symbol: "€", coords: [48.8566, 2.3522] },
  { name: "Rome", country: "Italy", code: "FCO", currency: "EUR", symbol: "€", coords: [41.9028, 12.4964] },
  { name: "Sydney", country: "Australia", code: "SYD", currency: "AUD", symbol: "A$", coords: [-33.8688, 151.2093] },
  { name: "Seoul", country: "South Korea", code: "ICN", currency: "KRW", symbol: "₩", coords: [37.5665, 126.978] },
  { name: "Bangkok", country: "Thailand", code: "BKK", currency: "THB", symbol: "฿", coords: [13.7563, 100.5018] },
  { name: "Toronto", country: "Canada", code: "YYZ", currency: "CAD", symbol: "C$", coords: [43.6532, -79.3832] },
  { name: "Zurich", country: "Switzerland", code: "ZRH", currency: "CHF", symbol: "CHF", coords: [47.3769, 8.5417] },
  { name: "Rio de Janeiro", country: "Brazil", code: "GIG", currency: "BRL", symbol: "R$", coords: [-22.9068, -43.1729] },
  { name: "Mexico City", country: "Mexico", code: "MEX", currency: "MXN", symbol: "MX$", coords: [19.4326, -99.1332] }
];

export function getClosestDepartureCity(lat, lng) {
  let closest = DEPARTURE_CITIES[0];
  let minDistance = Infinity;
  for (const city of DEPARTURE_CITIES) {
    const dist = Math.sqrt(Math.pow(city.coords[0] - lat, 2) + Math.pow(city.coords[1] - lng, 2));
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }
  return closest;
}



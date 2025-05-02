// {
// 	"disclaimer": "Usage subject to terms: https://openexchangerates.org/terms",
// 	"license": "https://openexchangerates.org/license",
// 	"timestamp": 1746154809,
// 	"base": "USD",
// 	"rates": {
// 		"CRC": 506.631889,
// 		"GTQ": 7.703866,
// 		"HNL": 26.029114,
// 		"NIO": 36.909359,
// 		"USD": 1
// 	}
// }

export interface IOpenExchangeRateResponse {
  disclaimer: string;
  license: string;
  timestamp: number;
  base: string;
  rates: {
    [key: string]: number;
  };
}

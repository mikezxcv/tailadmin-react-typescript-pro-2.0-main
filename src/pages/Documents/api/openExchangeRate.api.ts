import { useQuery } from "@tanstack/react-query";
import openexchangerateService from "../../../services/openexchangerate.service";
import { IOpenExchangeRateResponse } from "../interfaces/open-exchange-rate.interfaces";

export const useCurrencyLatest = (enabled: boolean) => {
    return useQuery({
        queryKey: ["currency-latest"],
        queryFn: (): Promise<IOpenExchangeRateResponse> =>
            openexchangerateService.get("/latest.json", {
                params: {
                    app_id: import.meta.env.VITE_OPENEXCHANGE_RATE_APP_ID,
                    symbols: "GTQ,CRC,USD,NIO,HNL",
                },
            }).then((res) => res.data),
        enabled,
    });
};
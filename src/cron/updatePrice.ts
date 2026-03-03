import { PricesCreateManyInput } from "generated/prisma/models.js";
import prisma from "services/database.js";
import * as z from "zod";
import * as RandomString from "randomstring";

const currencyDataShape = z.object({
  amount: z.number(),
  base: z.string(),
  date: z.coerce.date(),
  rates: z.record(z.string(), z.number()),
});

const subscribedCommodities = ["GBP", "PHP"];
const baseCurrency = "USD";
const precision = 10000;

const fetchConversionRate = async (
  commodity: string,
  currency: string,
  on: Date,
) => {
  const dateString = on.toISOString().slice(0, 10);
  const { success, data } = currencyDataShape.safeParse(
    await (
      await fetch(
        `https://api.frankfurter.dev/v1/${dateString}?base=${commodity}&symbols=${currency}`,
      )
    ).json(),
  );
  if (!success) throw new Error("Invalid response from API");
  if (data.rates[currency]) return data.rates[currency];
  else
    throw new Error(
      `No rate found for requested currency ${commodity + currency}`,
    );
};

const fetchCommodityGuid = async (symbol: string) => {
  const commodity = await prisma.commodities.findFirst({
    where: {
      mnemonic: symbol,
    },
    select: {
      guid: true,
    },
  });
  if (!commodity) throw new Error(`No commodity found for ${symbol}`);
  return commodity.guid;
};

const main = async () => {
  const currencyGuid = await fetchCommodityGuid(baseCurrency);
  const date = new Date();
  await prisma.prices.createMany({
    data: await Promise.all(
      subscribedCommodities.map(
        async (symbol) =>
          ({
            guid: RandomString.generate({
              length: 32,
              charset: "hex",
            }),
            commodity_guid: await fetchCommodityGuid(symbol),
            currency_guid: currencyGuid,
            date,
            source: "system:api",
            type: "last",
            value_denom: precision,
            value_num: Math.round(
              (await fetchConversionRate(symbol, baseCurrency, date)) *
                precision,
            ),
          }) satisfies PricesCreateManyInput,
      ),
    ),
  });
};

try {
  await main();
  console.log(
    `Prices successfully updated for ${subscribedCommodities.join(", ")} in ${baseCurrency}`,
  );
  process.exit();
} catch (e) {
  console.error(e);
  process.exit(1);
}

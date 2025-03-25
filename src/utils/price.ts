interface CGToken {
  id: string;
  current_price: number;
  image: string;
}

interface TokenData {
  price: number;
  logo: string;
}

export const fetchCGTokenData = async (symbols: string[]): Promise<Record<string, TokenData>> => {
  if (symbols.length === 0) return {};
  const ids = symbols.join(",");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
  );
  const data: CGToken[] = await res.json();

  return data.reduce<Record<string, TokenData>>((acc, token) => {
    acc[token.id] = { price: token.current_price, logo: token.image };
    return acc;
  }, {});
};

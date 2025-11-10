import { MetadataSeo } from "@/lib/metadata";
import { Stats } from "./(components)/stats";
import { TokenList } from "./(components)/token-list";
import s from "./page.module.scss";

export const metadata = MetadataSeo({
  title: "Portfolio",
  description: "View and manage all your tokens in one place",
});

export default function PortfolioPage() {
  return (
    <div className={s.portfolio}>
      <Stats />
      <TokenList />
    </div>
  );
}


import prisma from "../services/database.js";
import { Accounts as Account } from "../generated/prisma/client.js";

export type AccountWithFullName = Account & {
  fullAccountName: string;
};

export const getAccountsWithFullNames = async (): Promise<
  AccountWithFullName[]
> => {
  const allAccounts = await prisma.accounts.findMany();

  const accountMap = new Map<string, Account>(
    allAccounts.map((acc: Account) => [acc.guid, acc]),
  );

  const buildPath = (account: Account): string => {
    if (!account.parent_guid || !accountMap.has(account.parent_guid)) {
      return account.name === "Root Account" ? "" : account.name;
    }
    const parent = accountMap.get(account.parent_guid)!;
    const parentPath = buildPath(parent);
    if (parentPath === "") {
      return account.name;
    }
    return `${parentPath}:${account.name}`;
  };
  return allAccounts.map((account: Account) => ({
    ...account,
    fullAccountName: buildPath(account),
  }));
};

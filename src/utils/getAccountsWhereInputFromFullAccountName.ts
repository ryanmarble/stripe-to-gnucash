import { AccountsWhereInput } from "../generated/prisma/models.js";

export function getAccountsWhereInputFromFullAccountName(fullAcctName: string): AccountsWhereInput {
  const segments = fullAcctName.split(':')
  if (segments.length == 0) throw Error(`Invalid full account string in payload: ${fullAcctName}`)
  return segments.reduce((acc, accountName) => ({name: accountName, parent_account: acc}), {})
}
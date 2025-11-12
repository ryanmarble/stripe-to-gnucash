import { Api as Noco } from "nocodb-sdk";

let _nocoClient: Noco<unknown> | null = null

export function getNocoClient(): Noco<unknown> {
  if (_nocoClient) return _nocoClient

  const apiKey = process.env.NOCO_API_KEY as string

  _nocoClient = new Noco({
    baseURL: "https://noco.vftv.org",
    headers: {
      "xc-token": apiKey
    }
  })

  console.log("Noco Client successfully initialized.")

  return _nocoClient
}

export default getNocoClient;
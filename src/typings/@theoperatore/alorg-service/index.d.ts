declare module '@theoperatore/alorg-service' {
  export function createClient(): AlorgClient;

  interface AlorgResponse {
    payload?: string;
  }

  class AlorgClient {
    get(alorgUrl: string): Promise<AlorgResponse>;
  }
}

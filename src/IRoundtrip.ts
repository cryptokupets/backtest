export interface IRoundtrip {
    begin: string;
    end?: string;
    openPrice: number;
    closePrice?: number;
    openAmount: number;
    closeAmount?: number;
    fee: number;
    profit?: number;
}

export class Strategy {
    public readonly buffer: any = {};
    public readonly code: string;

    constructor(code: string = 'return "";') {
        this.code = code;
        this.executeCode = new Function("indicators", "buffer", code) as (
            indicator: Record<string, number | number[]>,
            buffer: any
        ) => string;
    }

    private executeCode: (
        indicator: Record<string, number | number[]>,
        buffer: any
    ) => string;

    public execute(
        indicators: Record<string, number | number[]> // key position valueIndex
    ): string {
        return this.executeCode(indicators, this.buffer);
    }
}

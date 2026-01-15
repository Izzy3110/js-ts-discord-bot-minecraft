export function unixTimestampMs(): number {
    return Date.now();
}

export function writeVarInt(value: number): Buffer {
    const bytes: number[] = [];
    let val = value;

    do {
        let temp = val & 0b01111111;
        val >>>= 7;
        if (val !== 0) temp |= 0b10000000;
        bytes.push(temp);
    } while (val !== 0);

    return Buffer.from(bytes);
}

export function readVarInt(buffer: Buffer, offset = 0): { value: number; size: number } {
    let num = 0;
    let shift = 0;
    let size = 0;

    while (true) {
        const b = buffer[offset + size];
        if (b === undefined) {
            throw new Error("VarInt is too big or buffer ended unexpectedly");
        }
        num |= (b & 0x7f) << shift;
        shift += 7;
        size++;
        if ((b & 0x80) !== 0x80) break;
    }

    return { value: num, size };
}
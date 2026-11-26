import Packet from '#/io/Packet.js';
import OnDemand from '#/engine/OnDemand.js';
import { printDebug } from '#/util/Logger.js';

export const CrcBuffer: Packet = new Packet(new Uint8Array(4 * 9 + 4));
export let CrcTable: number[] = [];
export let CrcBuffer32: number = 0;

export function makeCrcs() {
    CrcTable = [];

    CrcBuffer.pos = 0;

    const count = OnDemand.cache.count(0);
    for (let i = 0; i < count; i++) {
        const jag = OnDemand.cache.read(0, i);
        if (jag) {
            CrcTable[i] = Packet.getcrc(jag, 0, jag.length);
            CrcBuffer.p4(CrcTable[i]);
        } else {
            CrcTable[i] = 0;
            CrcBuffer.p4(0);
        }

        printDebug(`[World] makeCrcs => index: ${i}, crc: ${CrcTable[i]}`);
    }

    let hash = 1234;
    for (let i = 0; i < 9; i++) {
        hash = (hash << 1) + CrcTable[i];
    }
    CrcBuffer.p4(hash);

    CrcBuffer32 = Packet.getcrc(CrcBuffer.data, 0, CrcBuffer.data.length - 4);

    printDebug(`[World] makeCrcs => CrcBuffer32: ${CrcBuffer32}`);
}

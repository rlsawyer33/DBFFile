//
// This code originated from https://github.com/emmanuelmillionaer/node-memo-parser
// and was changed to handle dBase IV memo files. The original was for dBase III+.
// 

const fs = require('fs');


export class MemoHeader {
    constructor(public blockSize: number, public nextFreeBlock: number) {
    }
}

export class BlockHeader {
    constructor(public blockSignature: number, public recordLength: number) {
        // TODO: check block signature matches 0xFFFF0808 (for dBase IV -- different than III+)
    }
}

export class MemoFile {

    private readonly memoHeaderLength = 512;
    private readonly blockHeaderLength = 8;

    path: string;
    encoding: string = "utf8";
    fd: number;
    memoHeader: MemoHeader;

    
    constructor(path: string, encoding: string = "utf8") {
        this.fd = fs.openSync(path,'r');
        this.memoHeader = this.parseMemoHeader();
    }
    
    getBlockContentAt(offset): String {
        var blockHeader = this.getBlockHeaderAt(offset);
        
        var contentStart = offset * this.memoHeader.blockSize + this.blockHeaderLength;
        var contentEnd = contentStart + blockHeader.recordLength;

        var contentBuffer = this.readBytes(contentStart, contentEnd);
        return contentBuffer.toString(this.encoding);
    }

    getBlockHeaderAt(offset): BlockHeader {
        var headerStart = offset * this.memoHeader.blockSize;
        var headerEnd = headerStart + this.blockHeaderLength;

        var buffer = this.readBytes(headerStart, headerEnd);

        var blockSignature = buffer.readUIntLE(0,4);
        var recordLength = buffer.readUIntLE(4,4);

        return new BlockHeader(blockSignature, recordLength);
    }

    private parseMemoHeader(): MemoHeader {
        var buffer = this.readBytes(0, this.memoHeaderLength);

        var nextFreeBlock = buffer.readUInt32LE(0);
        var blockSize = buffer.readUInt16LE(20);

        return new MemoHeader(blockSize, nextFreeBlock);
    }
    
    private readBytes(start, end) {
        var length = end - start;
        var buffer = new Buffer(length);

        fs.readSync(this.fd, buffer, 0, length, start);

        return buffer;
    };
}

//
// This code originated from https://github.com/emmanuelmillionaer/node-memo-parser
// and was changed to handle dBase IV memo files. The original was for dBase III+.
//
// It was also modified to allow writing to memo files
// 

const fs = require('fs');
const path = require('path');


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

    private readonly defaultBlockSize = 512;
    
    path: string;
    encoding: string = "utf8";
    fd: number;
    memoHeader: MemoHeader;

    
    constructor(path: string, encoding: string = "utf8") {
        this.path = path;
        this.encoding = encoding;
        this.fd = fs.openSync(path,'a+');
        var stats = fs.statSync(path);
        if (stats.size < this.memoHeaderLength) {
            this.memoHeader = this.writeMemoHeader();
        } else {
            this.memoHeader = this.parseMemoHeader();
        }
    }
    
    getNextBlockNumber(): number {
        var stats = fs.statSync(this.path);
        // Should be padded to blockSize, but use ceiling just in case
        var blocksUsed = Math.ceil((stats.size - this.memoHeaderLength) / this.memoHeader.blockSize);
        return blocksUsed + 1;
    }
    
    getBlockContentAt(offset): string {
        var blockHeader = this.getBlockHeaderAt(offset);
        
        var contentStart = offset * this.memoHeader.blockSize + this.blockHeaderLength;
        var contentEnd = contentStart + blockHeader.recordLength - this.blockHeaderLength;

        var contentBuffer = this.readBytes(contentStart, contentEnd);
        if (contentBuffer.slice(-2).compare(Buffer.from([0x1A, 0x1A])) === 0) {
            contentBuffer = contentBuffer.slice(0, -2);
        }
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
    
    writeNextBlock(text: string) {
        var bytesToWrite = text.length + 10; // memo data + signature (4) + length field (4) + terminator (0x1A1A)
        var blocksNeeded = Math.ceil(bytesToWrite / this.memoHeader.blockSize);
        
        var buffer = Buffer.alloc(blocksNeeded * this.memoHeader.blockSize);

        buffer.writeUInt32LE(0x0008FFFF, 0x00);                 // dBase IV memo block signature
        buffer.writeUInt32LE(bytesToWrite, 0x04);               // Length of data
        buffer.write(text, 0x08, text.length, this.encoding);   // Actual memo data
        buffer.writeUInt16LE(0x1A1A, text.length + 8);          // Terminator (+8 is for the signature and length)
        
        fs.appendFileSync(this.path, buffer, this.encoding);
    }
    
    writeMemoHeader(blockSize: number = this.defaultBlockSize, nextFreeBlock: number = 1): MemoHeader {
        var buffer = Buffer.alloc(this.memoHeaderLength);
        
        var memoHeader = new MemoHeader(blockSize, nextFreeBlock);
        
        buffer.writeUInt32LE(memoHeader.nextFreeBlock, 0x00);                       // Next available block
        // buffer.writeUInt32LE(memoHeader.blockSize, 0x04);                        // Block size
        // var baseName = this.path.substr(0, this.path.lastIndexOf("."));
        var baseName = path.basename(this.path, path.extname(this.path));
        buffer.write(baseName, 0x08, Math.min(baseName.length, 8), this.encoding);  // Base file name
        buffer.writeUInt16LE(memoHeader.blockSize, 0x14);                           // Block size
        
        fs.writeSync(this.fd, buffer, 0, this.memoHeaderLength, 0);
        
        return memoHeader;
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

const {FileBasedDb, keccak256FlyHash, MMR} = require('@subql/x-merkle-mountain-range')
const fs = require('fs')
const { Buffer } = require('buffer');

const LOG_FILE = './debug.log'
const MMR_FILE = './test.mmr'
const DEFAULT_WORD_SIZE = 32;
const DEFAULT_LEAF = Buffer.from(
    '0000000000000000000000000000000000000000000000000000000001001001',
    'hex',
);
const PRINT_PER_LOG = 2000;
const TARGET_HEIGHT = 9016583;

function createOrOpenFileBasedMmr(projectMmrPath){
    let fileBasedDb;
    if (fs.existsSync(projectMmrPath)) {
        fileBasedDb = FileBasedDb.open(projectMmrPath);
    } else {
        fileBasedDb = FileBasedDb.create(projectMmrPath, DEFAULT_WORD_SIZE);
    }

    return fileBasedDb;
}

function writeAndLog(message){
    console.log(message)
    const log_file = fs.appendFileSync(LOG_FILE, message+'\n');
}


async function main(){

    let fileBasedDb = createOrOpenFileBasedMmr(MMR_FILE)
    const fileBasedMmr = new MMR(keccak256FlyHash, fileBasedDb)
    const startHeight = await fileBasedMmr.getLeafLength();

    for (i = startHeight; i < TARGET_HEIGHT; i++) {
        await fileBasedMmr.append(DEFAULT_LEAF)

        if ((i+1) % PRINT_PER_LOG == 0 && i != 0) {
            const stats = await fs.statSync(MMR_FILE);
            const fileSizeInBytes = stats.size;
            const fileSizeInMegabytes = fileSizeInBytes / (1024*1024);
            let nodeLength = await fileBasedMmr.getNodeLength();
            let leafLength = await fileBasedMmr.getLeafLength();
            writeAndLog(`[${new Date().toISOString()}]: leaf length ${leafLength}, node length: ${nodeLength}, mmr size: ${fileSizeInMegabytes} MB`)
        }
    }


}





main()

const fs = require('fs')
const PATH = "./comm.json";

class Comm {

    add(newComm) {
        const data = this.readData();
        data.unshift(newComm);
        this.storeData(data);
    }

    get() {
        return this.readData();
    }

    readData() {
        try {
            return JSON.parse(fs.readFileSync(PATH, 'utf8'));
        } catch (err) {
            console.error(err)
            return false;
        }
    }

    storeData(data) {
        try {
            fs.writeFileSync(PATH, JSON.stringify(data));
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = Comm;
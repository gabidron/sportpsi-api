const fs = require('fs')
const PATH = "./msg.json";

class Msg {

    add(newMsg) {
        const data = this.readData();
        data.unshift(newMsg);
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

module.exports = Msg;
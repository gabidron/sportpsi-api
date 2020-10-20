const fs = require('fs');
const Web = require('./web');
const PATH = "./webReq.json";

class WebReq {

    add(newWebReq) {
        const data = this.readData();
        data.unshift(newWebReq);
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

module.exports = WebReq;
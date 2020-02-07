let Command = require('../src/Command');
const request = require('request');

module.exports = class Shop extends Command {
    static name = "shop";
    static alias = [
        "shop"
    ]
    static description = "Intéragir avec le marché de Phoenix"
    static data = [];

    static async call(msg, Phoenix) {
        this.Phoenix = Phoenix;
        this.textChannel = msg.channel;
        if(this.data.length == 0)
            this.data = await this.get();
        
        if(msg.args.length > 0)
            this.showCategory(msg.args[0])
        else
            this.showCategories();
    }
    static showCategories () {
        console.log("Show categories.");
        let res = "**Liste des catégories :**";
        let i = 1;
        this.data.forEach(category => {
            res += "\n" + i + ': ' + category.name;
            i++;
        })
        res += "\n" + this.Phoenix.config.prefix + "shop [id categorie] : Affiche les items de la catégorie";
        this.textChannel.send(res);
    }
    static showCategory(id) {
        if(id > this.data.length) return false;
        let categorie = this.data[id - 1];
        let res = "Catégorie " + id + " : " + categorie.name;
        res += "\nItem : Achat Unité / Achat Stack / Vente Unité / Vente Stack (point de vue de Phoenix)";
        categorie.items.forEach(item => {
            res += '\n' + item.name + ': ' + item.prices.buyUnit + ' / ' + item.prices.buyStack + ' / ' + item.prices.sellUnit + ' / ' + item.prices.sellStack;
        })
        this.textChannel.send(res);
    }
    static async get() {
        console.log('[Sheet] Getting data...')
        return new Promise(resolve => {
            request('https://sheets.googleapis.com/v4/spreadsheets/1az14S1w-GIS9JuWpne93xJs6aFAHMfdWG86poYaQH8A?includeGridData=true&key=' + this.Phoenix.config.sheetskey, (err, res, body) => {
                if(err) {
                    console.error(err);
                    resolve([]);
                }
                console.log('[Sheet] Data harvested. Filtering...');
                let doc = JSON.parse(body);
                let rows = [];
                let rowdata = doc.sheets[0].data[0].rowData;
                rowdata.forEach(row => {
                    let cells = [];
                    if(row.values) {
                        row.values.forEach(cell => {
                            if (cell.formattedValue)
                                cells.push(cell.formattedValue);
                        })
                    }
                    rows.push(cells);
                });
                console.log('[Sheet] Data filtered.');
                resolve(this.parse(rows));
            })
        })
    }
    static parse(rows) {
        console.log('[Sheeet] Parsing data...');
        function category(name) {
            this.name = name;
            this.items = [];
        }
        // let category = {
        //     name: "",
        //     items: []
        // };
        let data = [];
        let cat = false
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if(cat) {
                if(row.length > 0 != "") {
                    let item = {
                        name: row[0],
                        prices: {
                            buyUnit: row[1],
                            buyStack: row[2],
                            sellUnit: row[3],
                            sellStack: row[4],
                            sellChest: row[5]
                        }
                    };
                    cat.items.push(item);
                }else if(cat) {
                    data.push(cat);
                    cat = false;
                }
            }
            if(row[0] == '//') { // Marqueur de nouvelle catégorie
                cat = new category(rows[i + 1][0]); // Create the categorie
                i++;
            }
        }

        console.log('[Sheet] Data parsed');
        return data;
    }
}

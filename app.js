const path = require("path");
const express = require("express");
const expressHbs = require("express-handlebars");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const app = express();
const mariadb = require("mariadb");
const parser = bodyParser.urlencoded();
/**
 * @type {mariadb.Connection}
 * */
let db;
const PORT = process.env.PORT || 5000;

(async function () {
    try {
    db = await mariadb.createConnection({
        host: "localhost",
        user: "daniil",
        password: "12qw"
    }).catch(err => {throw new Error("MariaDB connection error:"+err.message)})
    db.query("USE catalog");
} catch (err) {
    console.error(err);
    process.exit(1);
}
})()

/**
 * @param {Array} array 
 * @param {Number} number
 */
function selectRandom(array, number) {
    const randint = (min, max) => {
        const r = Math.random();
        const l = r * (max - min) + min;
        return Math.round(l);
    };
    let ret = [];
    for (let i = 0; i < number; i++) {
        const s = randint(0, array.length - 1);
        ret[i] = array[s];
    }
    return ret;
}

app.engine("hbs", expressHbs(
    {
        layoutsDir: "views/layouts/",
        defaultLayout: "layout",
        extname: "hbs",
    }
));
app.set("view engine", "hbs");
app.use(express.static(__dirname + "/public"));
hbs.registerPartials(__dirname + "/views/partials");

app.get("/catalog/:latin/edit", async (req, res) => {
    const data = await db.query(`SELECT * FROM items WHERE LatinName='${req.params.latin}'`);
    res.render("admin", {
        list: [],
        data: data[0]
    });
})

app.post("/catalog/:latin/edit", parser, async (req, res) => {
    const data = req.body;
    db.query(`UPDATE items SET Name = ${data.name},Description = ${data.description} WHERE LatinName = ${data.latin};`)
        .then(val => console.log(val))
        .catch(err => console.error(err));
    res.redirect('.');
})

app.get("/catalog/new", async (req, res) => {
    const catalog = await db.query("SELECT * FROM items")
    res.render("admin", {
        list: catalog,
        data: []
    });
});
app.post("/catalog/new", parser, async (req, res) => {
    const data = req.body;
    data.latin = data.latin.toLowerCase();
    db.query(`INSERT INTO items (Name,LatinName,Description) VALUES ('${data.name}','${data.latin}','${data.description}');`)
        .then(val => console.log(val))
        .catch(err => console.error(err));
    const catalog = await db.query("SELECT * FROM items")
    res.redirect(".")
});
app.get("/catalog/show",async (req,res) => {
    const catalog = await db.query("SELECT * FROM items")
    res.render("admin", {
        list: catalog
    });
})
app.get("/catalog/:latin", async (req, res) => {
    const data = await db.query(`SELECT * FROM items WHERE LatinName='${req.params.latin}'`);
    res.render("plant", {
        plant: data[0]
    });
});

app.delete("/catalog/:latin", async (req,res) => {
    db.query(`DELETE FROM items WHERE LatinName=${req.params.latin}`).then(res.sendStatus(200));
});
app.get("/", async (req, res) => {
    const data = await db.query(`SELECT * FROM items`);
    res.render("home.hbs", {
        blocks: selectRandom(data, 6)
    });
});

app.get("/*", (req, res) => {
    let file = path.basename(req.url);
    try {
    res.render(`${file}.hbs`);
    }
    catch (error) {res.sendStatus(500)}
});
app.listen(PORT);
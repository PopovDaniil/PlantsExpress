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
db = await mariadb.createConnection({
    host: "localhost",
    user: "daniil",
    password: "12qw"
});
db.query("USE catalog").then(val=>console.log(val));
})()


/**
 * @param {Array} array 
 * @param {Number} number
 */
function selectRandom(array,number) {
    const randint = (min,max) => {
        const r = Math.random();
        const l = r * (max - min) + min;
        return Math.round(l);
    };
    let ret = [];
    for (let i = 0; i < number; i++) {
        const s = randint(0,array.length-1);
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

app.get("/catalog/:id", async (req,res) => {
    const data = await db.query(`SELECT * FROM Scientific WHERE LatinName='${req.params.id}'`);
    res.render("plant", {
      plant: data[0]
    });
});

app.get("/", async (req,res) => {
    const data = await db.query(`SELECT * FROM Scientific`);
    res.render("home.hbs",{
        blocks:  selectRandom(data,6)
    });
});
app.post("/admin", parser, async (req,res) => {
  const data = req.body;
  data.latin = data.latin.toLowerCase();
  client.db("catalog").collection("scientific").insertOne(req.body)
  .then(val => console.log(val))
  .catch(err => console.error(err));
  const catalog = await client.db("catalog").collection("scientific").find().toArray();
  res.render("admin",{
    list: catalog
  });
});
app.get("/*", (req, res) => {
    let file = path.basename(req.url);
    res.render(`${file}.hbs`);
});
app.listen(PORT);
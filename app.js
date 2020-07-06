const path = require("path");
const express = require("express");
const expressHbs = require("express-handlebars");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const app = express();
const parser = bodyParser.urlencoded();
  
const catalog = {};
const PORT = process.env.PORT || 5000;

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

const client = new MongoClient("mongodb://localhost:27017",{ useUnifiedTopology: true });

client.connect().then(base => {
    const db = base.db("plants");
    const catalog = db.collection("catalog");
     /* catalog.insertOne({
          "scientific": [
              {
                "title": "Кукушкин лён1",
                "text": "Стройные коричневатые стебли кукушкиного льна покрыты небольшими тёмно-зелёными листьями и немного напоминают растение льна в миниатюре. Отсюда происходит вторая часть названия — лён. Коробочки, появляющиеся на женских растениях, напоминают кукушку, сидящую на «шесте»"
              },
              {
                "title": "Кукушкин лён2",
                "text": "Стройные коричневатые стебли кукушкиного льна покрыты небольшими тёмно-зелёными листьями и немного напоминают растение льна в миниатюре. Отсюда происходит вторая часть названия — лён. Коробочки, появляющиеся на женских растениях, напоминают кукушку, сидящую на «шесте»"
              },
              {
                "title": "Кукушкин лён3",
                "text": "Стройные коричневатые стебли кукушкиного льна покрыты небольшими тёмно-зелёными листьями и немного напоминают растение льна в миниатюре. Отсюда происходит вторая часть названия — лён. Коробочки, появляющиеся на женских растениях, напоминают кукушку, сидящую на «шесте»"
              },      
              {
                "title": "Кукушкин лён4",
                "text": "Стройные коричневатые стебли кукушкиного льна покрыты небольшими тёмно-зелёными листьями и немного напоминают растение льна в миниатюре. Отсюда происходит вторая часть названия — лён. Коробочки, появляющиеся на женских растениях, напоминают кукушку, сидящую на «шесте»"
              },
              {
                "title": "Кукушкин лён5",
                "text": "Стройные коричневатые стебли кукушкиного льна покрыты небольшими тёмно-зелёными листьями и немного напоминают растение льна в миниатюре. Отсюда происходит вторая часть названия — лён. Коробочки, появляющиеся на женских растениях, напоминают кукушку, сидящую на «шесте»"
              },
              {
                "title": "Кукушкин лён6",
                "text": "Стройные коричневатые стебли кукушкиного льна покрыты небольшими тёмно-зелёными листьями и немного напоминают растение льна в миниатюре. Отсюда происходит вторая часть названия — лён. Коробочки, появляющиеся на женских растениях, напоминают кукушку, сидящую на «шесте»"
              }
          ]
        }).then(val => console.log(val))  */
});
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
    const data = await client.db("catalog").collection("scientific").findOne({"latin":req.params.id})
    res.render("plant", {
      plant: data
    });
});

app.get("/", async (req,res) => {
    const data = await client.db("catalog").collection("scientific").find().toArray();
    const sci = data[0] || [];
    console.log(sci); 
    res.render("home.hbs",{
        blocks:  selectRandom(data,6)
    });
});
app.post("/admin", parser, (req,res) => {
  for (let i in req.body) {
    i = i.toLowerCase();
  }
  client.db("catalog").collection("scientific").insertOne(req.body)
  .then(val => console.log(val))
  .catch(err => console.error(err));
  res.render("admin.hbs");
});
app.get("/*", (req, res) => {
    let file = path.basename(req.url);
    res.render(`${file}.hbs`);
});
app.listen(PORT);
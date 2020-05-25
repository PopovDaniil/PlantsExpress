const path = require("path")
const querystring = require("querystring");
const express = require("express");
const expressHbs = require("express-handlebars");
const hbs = require("hbs");
const app = express();
  
const PORT = process.env.PORT || 5000;
// устанавливаем настройки для файлов layout
app.engine("hbs", expressHbs(
    {
        layoutsDir: "views/layouts", 
        defaultLayout: "layout",
        extname: "hbs"
    }
))
app.set("view engine", "hbs");
app.use(express.static(__dirname + "/public"));
hbs.registerPartials(__dirname + "/views/partials");
 
app.get("/catalog/*", (req,res) => {
    console.log(path.basename(req.url))
})

app.get("/", (req,res) => {
    res.render("home.hbs");
});

app.get("/*", (req, res) => {
    let file = path.basename(req.url);
    res.render(`${file}.hbs`);
})
app.listen(PORT);
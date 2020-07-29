const { assert } = require("chai");
const { JSDOM } = require("jsdom");
const { createPool } = require("mariadb");

const rootPath = "http://localhost:5000";
const { window } = new JSDOM("", { url: rootPath });
const $ = require("jquery")(window);

const DBParams = {
    host: "localhost",
    user: "daniil",
    password: "12qw"
};
const DBPool = createPool(DBParams);
const testRecord = {
    name: "Ромашка",
    latin: "chamomilla",
    description: "травянистое растение"
}
const postData = {
    name: "Название",
    latin: "latinname",
    description: "длинное описание"
}
/**
 * 
 * @param {string} page 
 * @param {string} sel 
 */
async function getElements(page, sel) {
    const dom = await JSDOM.fromURL(page)
    return dom.window.document.querySelectorAll(sel)
}
before("Проверка соединения", function () {
    it("Соединение с сервером", async function () {
        await JSDOM.fromURL(rootPath).catch(err => assert.fail(err.message))
    })
    it("Соединение с базой", async function () {
        const db = await DBPool.getConnection().catch(err => { assert.fail(err.message) });
        db.query("USE catalog;");
        db.query(`INSERT INTO items (Name,LatinName,Description) VALUES ('${testRecord.name}','${testRecord.latin}','${testRecord.description}');`)
        db.end();
    })
});

describe("Проверка маршрутов", function () {
    this.timeout(1000);
    it("get /", async function () {
        const title = await getElements(rootPath, "h2");
        assert.strictEqual(title[0].innerHTML, "Главная");
    });
    it("get /catalog index", async function () {
        assert.isDefined(await getElements(`${rootPath}/catalog`, "a[href$=scientific]"));
        assert.isDefined(await getElements(`${rootPath}/catalog`, "a[href$=lifeform]"));
    });
    it("get /catalog/:plant", async function () {
        const title = await getElements(`${rootPath}/catalog/${testRecord.latin}`, "#name");
        assert.include(title[0].innerHTML, testRecord.name);
        const descr = await getElements(`${rootPath}/catalog/${testRecord.latin}`, "#description");
        assert.include(descr[0].innerHTML, `${testRecord.name} - ${testRecord.description}`);
    });
    it("Страница создания элемента каталога", async function() {
        const title = await getElements(`${rootPath}/catalog/new`, "h2");
        assert.propertyVal(title[0], 'innerHTML', "Создание элемента");
    });
    it("Страница редактирования каталога", async function () {
        const title = await getElements(`${rootPath}/catalog/show`, "h2");
        assert.include(title[0].innerHTML, "Редактирование каталога");
        const name = await getElements(`${rootPath}/catalog/show`, ".name");
        const count = await DBPool.query("SELECT COUNT(ID) FROM catalog.items");
        const id = count[0]['COUNT(ID)'];
        assert.propertyVal(name[id - 1], "innerHTML", `${testRecord.name}(${testRecord.latin})`);
    });
    it("Создание элемента каталога", async function () {
        $.post(`${rootPath}/catalog/new`, postData).fail(assert.fail).done(async () => {
            const expect = (await DBPool.query(`SELECT * FROM catalog.items WHERE LatinName='${postData.latin}'`))[0];
            assert.deepEqual(postData, {
                name: expect["Name"],
                latin: expect["LatinName"],
                description: expect["Description"]
            });
        });
    });
    it("Удаление элемента каталога", async function () {
        $.ajax(`${rootPath}/catalog/${postData.latin}`, { method: "DELETE" }).fail(assert.fail)
    });
    it("Страница редактирования элемента каталога", async function () {
        const form = {
            name: (await getElements(`${rootPath}/catalog/${testRecord.latin}/edit`, "[name=name]"))[0].getAttribute("value"),
            latin: (await getElements(`${rootPath}/catalog/${testRecord.latin}/edit`, "[name=latin]"))[0].getAttribute("value"),
            description: (await getElements(`${rootPath}/catalog/${testRecord.latin}/edit`, "[name=description]"))[0].innerHTML
        }
        assert.deepEqual(form, testRecord);
    });
    it("Редактирование элемента каталога");
    it("Статические страницы", async function () {
        const titles = {
            [(await getElements(`${rootPath}/calendar`, "h2"))[0].innerHTML]: "Календарь цветения",
            [(await getElements(`${rootPath}/about`, "h2"))[0].innerHTML]: "О нас"
        };
        for (const key in titles) {
            assert.equal(key, titles[key])
        }
    })
});
describe("Завершение", function () {
    this.slow(400);
    it("Очистка базы", async function () {
        const db = await DBPool.getConnection().catch(err => { assert.fail(err.message) });
        await db.query("USE catalog;");
        await db.query(`DELETE FROM items WHERE LatinName='${testRecord.latin}';`);
        db.end();
    });
    
    after(() => {
        DBPool.end();
    })
});
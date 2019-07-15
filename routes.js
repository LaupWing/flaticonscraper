const express   = require('express')
const router    = express.Router()
const puppeteer = require('puppeteer')

router.get('/', (req,res)=>{
    res.send('Hallo')
})

router.post('/', async (req,res)=>{
    const searchTerm = req.body.search
    const result     = await getIconFromFlaticon(searchTerm)
    console.log(result)
    res.send(result)
})

router.get('/icon', (req,res)=>{
    const searchTerm = req.body.search
    const result     = await getIconFromFlaticon("react")
    console.log(result)
    res.send(result)
})


// test()

async function getIconFromFlaticon(searchTerm){
    const evalVal = searchTerm
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://www.flaticon.com/')
    await page.waitFor('input[type="search"].home_search_input')
    await page.evaluate((evalVal)=>{
        document.querySelector('input[type="search"].home_search_input').value = evalVal
    }, evalVal)
    await page.evaluate(() => {
        document.querySelectorAll('button[type="submit"].flaticon-magnifier.nostyle')[1].click();
    })
    await page.waitForNavigation()
    const imgLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('ul.icons li.icon img'))
            .map(item=>item.src)

    })
    await browser.close()
    return imgLinks
}

async function getIconFromGoogle(searchterm){
    const evalVal = searchTerm
    const browser = await puppeteer.launch({devtools: true})
    const page = await browser.newPage()
    await page.goto('https://www.google.com/')
    await page.waitFor('input[type="text"]')
    await page.evaluate((evalVal)=>{
        document.querySelector('input[type="text"]').value = evalVal
    }, evalVal)
    await page.evaluate(() => {
        document.querySelectorAll('button[type="submit"].flaticon-magnifier.nostyle')[1].click();
    })
    await page.waitForNavigation()
    const imgLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('ul.icons li.icon img'))
            .map(item=>item.src)

    })
    await browser.close()
    return imgLinks
}

module.exports = router
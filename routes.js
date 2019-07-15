const express   = require('express')
const router    = express.Router()
const puppeteer = require('puppeteer')

router.get('/', (req,res)=>{
    res.send('Hallo')
})

router.post('/flatIcon', async (req,res)=>{
    let searchTerm = req.body.search
    if(searchTerm.trim().toLowerCase() === "vue")   searchTerm = "react"
    const result     = await getIconFromFlaticon(searchTerm)
    res.send(result)
})

router.post('/google', async (req,res)=>{
    let searchTerm = req.body.search
    const result   = await getIconFromGoogle(searchTerm)
    res.send(result)
})

router.get('/icon', async (req,res)=>{
    const result     = await getIconFromFlaticon("react")
    res.send(result)
})

async function getIconFromFlaticon(searchTerm){
    const evalVal = searchTerm
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
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
    const evalVal = searchterm
    const browser = await puppeteer.launch({devtools: true})
    const page = await browser.newPage()
    await page.goto('https://www.google.com/')
    await page.waitFor('input[type="text"]')
    await page.evaluate((evalVal)=>{
        document.querySelector('input[type="text"]').value = evalVal + "icon.png"
    }, evalVal)
    await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="submit"]'))
        const filterout = inputs.filter(input=>{
            if(input.value.trim()==="Google zoeken")    return input
        })
        filterout[1].click()
    })
    await page.waitForNavigation()
    await page.evaluate(() => {
        const a = Array.from(document.querySelectorAll('#top_nav a'))
        a.forEach(link=>{
            if(link.innerText==="Afbeeldingen") link.click()
        })
    })
    await page.waitForNavigation()
    const imgLinks = await page.evaluate(() => {
        String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
        const imgs = Array.from(document.querySelectorAll('#search a'))
            .filter(y=>{
                if(y.querySelector('img')!==null)   return y
            })
            .filter(x=>{
                if(x.querySelector('img').src !=="") return x
            })
            .slice(0,20)
            .map(a=>a.href)
            .map(a=>{
                return a.split("https://www.google.com/imgres?imgurl=")[1]
                        .split("&imgrefurl=")[0]
                        .replaceAll("%2F", "/")
                        .replaceAll("%3A", ":")
            })
        console.log(imgs)
        return imgs
    })
    await browser.close()
    return imgLinks
}
console.log('logeed die wel')

module.exports = router
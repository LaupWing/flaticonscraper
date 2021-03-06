const express   = require('express')
const router    = express.Router()
const puppeteer = require('puppeteer')

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

router.get('/', (req,res)=>{
    res.send('Hallo Welcome to the icon api which is a part of the skills website... Suddend bug: Returned a empty object')
})

router.post('/flatIcon', async (req,res)=>{
    try{
        let searchTerm = req.body.search
        if(searchTerm.trim().toLowerCase() === "vue")   searchTerm = "react"
        const result     = await getIconFromFlaticon(searchTerm)
        res.send(result)
    }
    catch(err){
        res.send(err)
    }
})

router.post('/undraw', async (req,res)=>{
    try{
        let searchTerm = req.body.search
        const result     = await getIconFromUnDraw(searchTerm)
        res.send(result)
    }
    catch(err){
        res.send(err)
    }
})

router.post('/noun', async (req,res)=>{
    try{
        let searchTerm = req.body.search
        const result     = await getIconFromNounProject(searchTerm)
        res.send(result)
    }
    catch(err){
        res.send(err)
    }
})

router.post('/getFavicon', async (req,res)=>{
    try{
        let url = req.body.url
        const result     = await getFavicon(url)
        res.send(result)
    }
    catch(err){
        res.send(err)
    }
})

router.post('/google', async (req,res)=>{
    let searchTerm = req.body.search
    const result   = await getIconFromGoogle(searchTerm)
    res.send(result)
})

router.get('/testFlaticon', async (req,res)=>{
    const result     = await getIconFromFlaticon("react")
    res.send(result)
})
router.get('/testGoogle', async (req,res)=>{
    const result     = await getIconFromGoogle("react")
    res.send(result)
})
router.get('/testUndraw', async (req,res)=>{
    const result     = await getIconFromUnDraw("react")
    res.send(result)
})
router.get('/testNoun', async (req,res)=>{
    const result     = await getIconFromNounProject("react")
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

async function getIconFromUnDraw(searchTerm){
    const evalVal = searchTerm
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()
    await page.goto('https://undraw.co/search')
    await page.waitFor('input[type="text"]#searchDraw')
    await page.evaluate(async (evalVal)=>{
        const input = document.querySelector('input[type="text"]#searchDraw') 
        input.value = evalVal
    }, evalVal)
    // setTimeout(async ()=>{
    //     console.log('took to long')
    //     await browser.close()
    //     return []
    // },5000)
    await page.type('input[type="text"]#searchDraw',String.fromCharCode(13),{delay:20})
    // await page.waitFor('.item svg')
    await timeout(2000)
    const svgs = await page.evaluate(()=>{
        const svgCode = document.querySelectorAll('.item svg')
        return Array.from(svgCode)
            .map(svg=>svg.outerHTML)
    })
    await browser.close()
    return svgs
}

async function getIconFromNounProject(searchTerm){
    const evalVal = searchTerm
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()
    await page.goto('https://thenounproject.com/')
    await page.waitFor('input#search')
    await page.evaluate(async (evalVal)=>{
        const input = document.querySelector('input#search') 
        input.value = evalVal
    }, evalVal)
    await page.evaluate(async ()=>{
        const form = document.querySelector('form')
        form.submit()
    })
    await page.waitForNavigation();
    await timeout(500)
    const imgs = await page.evaluate(async ()=>{
        const imgsArray = document.querySelectorAll('.Grid-cell.loaded img')
        return Array.from(imgsArray)
            .map(img=>img.src)
    })
    await browser.close()
    return imgs
}

async function getIconFromGoogle(searchterm){
    const evalVal = searchterm
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()
    await page.goto('https://www.google.com/')
    await page.waitFor('input[type="text"]')
    await page.evaluate((evalVal)=>{
        document.querySelector('input[type="text"]').value = evalVal + "icon.png"
    }, evalVal)
    await page.waitFor('form')
    await page.evaluate(() => {
        const form = document.querySelector('form')
        form.submit()
    })
    await page.waitForNavigation()
    await page.waitFor('#top_nav a')
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


async function getFavicon(url){
    const browser = await puppeteer.launch({devtools: true})
    const page = await browser.newPage()
    await page.goto(url)
    // setTimeout(async()=>{
    //     await browser.close()
    // },5000)
    await page.waitFor('head link[rel="icon"]')
    const iconRel = await page.evaluate(()=>{
        const link = Array.from(document.querySelectorAll('head link[rel="icon"]'))
            .map(icon=>icon.href)
        console.log(link)
        return link
    })
    await browser.close()
    return iconRel
}

module.exports = router
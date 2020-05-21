const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = process.env.PORT || 5000;
const fs = require('file-system');


app.listen(port, () => console.log(`Listening on port ${port}`));


(async() => {

    const pageURL = "https://jobline.hu/allasok/?p=6"
        //check for other pages if the script doesnt find any  Example: https://jobline.hu/allasok/?p=51 
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(pageURL);
    await page.waitForSelector("h2.job-title")


    var jobs = await page.evaluate(() => {
        var title = document.querySelectorAll(`h2.job-title`);
        var link = document.querySelectorAll(`h2.job-title > a`)
        var jobsArray = [];
        for (var i = 0; i < title.length; i++) {
            jobsArray[i] = {
                link: "https://jobline.hu" + link[i].getAttribute("href"),

            };
            // found.push(jobsArray)
        }
        return jobsArray;
    })



    var jobsFound = []

    for (i = 0; i < jobs.length; i++) {
        //console.log(jobs[i].link)

        await page.goto(jobs[i].link, { waitUntil: "load" })

        const found = await page.evaluate(() => window.find("home office")[1]);
        const foundOneMore = await page.evaluate(() => window.find("home"));
        const foundAnother = await page.evaluate(() => window.find("otthon"))

        //console.log(foundOneMore)
        //console.log(foundAnother)
        if (found === true || foundAnother === true || foundOneMore === true) {
            // console.log(jobs[i].link)
            jobsFound[i] = {
                link: page.url() //jobs[i].link

            }
            console.log(jobsFound)
            jobsFound = jobsFound.filter(function(x) { return x !== null });
        } else {
            console.log('no home office')
        }

    }

    fs.writeFile("jobs.txt", JSON.stringify(jobsFound), function(err) {

        if (err) throw err;
        console.log('Data saved')
    })

    await browser.close()


    console.log('Browser Closed')


})();
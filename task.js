import puppeteer from "puppeteer"; //Import puppeteer to mimic the chrome browser in rendering pages

//creates an array with the twitter profiles in the documents
const array = [
    "https://twitter.com/Mr_Derivatives", 
    "https://twitter.com/warrior_0719",
    "https://twitter.com/ChartingProdigy",
    "https://twitter.com/allstarcharts",
    "https://twitter.com/yuriymatso",
    "https://twitter.com/TriggerTrades",
    "https://twitter.com/AdamMancini4",
    "https://twitter.com/CordovaTrades", 
    "https://twitter.com/Barchart"
];

const interval = 15*60*1000; //15 minutes = 15*60 second = 15*60*1000 ms

//The reason of using the try-catch method is to continue executing the block and catching error without killing the process

async function evaluateSign(url, page){     //passing the url and page defined in the scrapTwitterSign
    try {
        // Launch the browser and open a new blank page
        const stockSign = /\$[A-Z]{3,4}\b/g; //assigns the stock sign to $ and then a range of 3-4 characters from A-Z using RegExp
        const populateSigns = {}; //populates the signs returned in the populatedSigns object

        await page.goto(url, {waitUntil: 'networkidle2'}); //renders the link provided to the function after the network finishes loading all of its elements
        await page.waitForSelector('div div[lang]'); //puppeteer waits for the selector (div div[lang]) to full load
        const tweet = await page.$$eval('div div[lang]', tweets => tweets.map(tweet => tweet.innerHTML)); //creates a variable called tweets loaded with the page innerHTML of a div with lang attributes
        
        //for loop iterates through the tweet, setting tweetMatch to the tweets that match the stockSign => if there is a match then iterate over the tweetMatch and if the
        //tweetMatch already exists in the stack increment it else set it up for the first time
        for (let tweets of tweet){
            const tweetMatch = tweets.match(stockSign);
            if(tweetMatch){
                for (let counter of tweetMatch){
                    if(populateSigns[counter]){
                        populateSigns[counter]++;
                    }
                    else{
                        populateSigns[counter] = 1;
                    }
                }
            }
        }
        return populateSigns;
    } catch (error) {
        console.log(error.message);     //catch any error happens in the try block
    }
};

async function ScrapeTwitterSign() {
    try {
        // Launch the browser and open a new blank page
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        const stockObject = {}; //empty object later to be populated

        //iterate over the array of twitter profiles => set the stockMentions to the returned value of the previous function => iterate of the stockMentions keys => for of loop 
        //used to populate the stockObject with the stockMention, if they already exits increase their presence by one and if not set up for first time
        for (let url of array){
            const stockMentions = await evaluateSign(url, page);
            for (let counter of Object.keys(stockMentions)){
                if(stockObject[counter]){
                    stockObject[counter] += stockMentions[counter];
                }
                else{
                    stockObject[counter] = stockMentions[counter]
                }
            }
        }
        for (let individualStock of Object.keys(stockObject)){      //iterate over the stockbOject keys 
            console.log(`${individualStock} was mentioned ${stockObject[individualStock]} times in the last ${interval/(60*1000)} minutes.`);
        }
        await browser.close();
    } catch (error) {
        console.log(error.message);     //catch any error happens in the try block
    }
}

ScrapeTwitterSign(); //Call the function
//Creates an interval that call the ScrapeTwitterSign function every 15 minutes
setInterval(() => {
    ScrapeTwitterSign();
}, interval);

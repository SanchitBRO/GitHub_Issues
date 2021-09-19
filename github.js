const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const pdf = require("pdfkit");
const chalk = require("chalk");

const { stringify } = require("querystring");


let url = "https://github.com/topics";
request(url, cb);

function cb(err,response,html){
    if (err){
        console.log(err);
    }
    else{
        getTopicLink(html);
    }
}

function getTopicLink(html){
    let $ = cheerio.load(html);
    let linkElement = $(".topic-box.position-relative.hover-grow.height-full.text-center.border.color-border-secondary.rounded.color-bg-primary.p-5")
    for(let i=0; i<linkElement.length;i++){ //linkElement.length
        let href = $(linkElement[i]).find('a').attr('href');
        let topicName = href.split('/').pop();
        let url = "https://github.com/"+href;
        getRepoPage(url, topicName);
    }
}

function getRepoPage(url, topicName){
    request(url,cb);
    function cb(err,response,html){
        if (err){
            console.log(err);
        }
        else{
            getRepoLink(html, topicName);
        }
    }
}

function getRepoLink(html, topicName){
    let $ = cheerio.load(html);
    let repos =$(".f3.color-text-secondary.text-normal.lh-condensed ");
    for(let i=0; i<8 && i<repos.length;i++){
        let name =$(repos[i]).find('a');
        let href = $(name[1]).attr('href');
        let Issueurl = "https://github.com/"+href+"/issues";
        let repoName = href.split('/').pop();
        GetIssueHTMl(Issueurl,topicName,repoName);
    }
}

function GetIssueHTMl(Issueurl,topicName,repoName){
    request(Issueurl,cb);
    function cb(err,response,html){
        if (err){
            console.log(err);
        }
        else{
            getIssues(html,topicName,repoName);
        }
    }
}
function getIssues(html,topicName,repoName){
    let $ = cheerio.load(html);
    let issueArr = $('.Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title');
    let arr=[];
    for(let i=0;i<issueArr.length;i++){
        let href = $(issueArr[i]).attr('href');
        let link = "https://github.com/"+href;
        arr.push(link);
    }
    let folderpath=path.join(__dirname,topicName);
    dirCreator(folderpath);
    let filepath=path.join(folderpath,repoName+".pdf");
    let issue = JSON.stringify(arr)
    
    
    let pdfDocument = new pdf();
    pdfDocument.pipe(fs.createWriteStream(filepath));
    pdfDocument.text(issue);
    pdfDocument.end();
    
    
}
function dirCreator(folderpath){
    if (fs.existsSync(folderpath)==false){
        fs.mkdirSync(folderpath)
    }
}
console.log(chalk.green("#----------Created GitHub Issues PDFs Successfully----------#"));


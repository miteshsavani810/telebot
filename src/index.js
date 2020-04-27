let TelegramBot = require('node-telegram-bot-api');
let request = require('request-promise');
let moment = require('moment');


// **************************************************** Covid-19 Data *******************************/


let telegramToken_Covid = process.env.COVID_Telegram_Token;
let covidBot = new TelegramBot(telegramToken_Covid, { polling: true });

// response format
let secondColFormatlength = 6;
let thirdColFormatlength = 6;

// Intervale
let enableInterval = false;
let sendBackEvery = 60000 * 60 * 3;
let timeOutAfter = 60000 * 60 * 24 * 20;


startIntervalReport(enableInterval);

let availableMapReport = {
    "INDIA": {
        path:'src/images/INDIA_Case.jpg',
        Users: [{ id: 542770235, first_name: 'Mitesh', type: 'private' }]
    },
    "GUJARAT": {
        path: 'src/images/Gujarat_Case.jpg',
        Users: []
    }
}


// Sending update to Owner on start up;

covidBot.sendMessage(542770235, `Hello Owner! I just started my job.`, {parse_mode: "HTML"} );



/* let response = `Select any below
            /INDIA
            /Maharashtra
            /Gujarat
            /Delhi
            /Tamil_Nadu
            /Madhya_Pradesh
            /Uttar_Pradesh
            /Telangana
            /Rajasthan
            /Punjab
            /Odisha
            \n`; */


let replyOptions = {
    reply_markup: {
        keyboard: [
            [{  text: "/INDIA"  }],
            [{  text: "/Gujarat" },
                { text: "/Maharashtra" }],
            [{  text: "/Rajastan" },
                { text: "/Delhi" },
                { text: "/Punjab" }],
            [{  text: "/Telangana" },
                { text: "/Karnataka" },
                { text: "/Haryana" }],
            [{  text: "/Uttarakhand" },
                { text: "/Goa"} ],
            [{  text: "/Assam" },
                { text: "/Tripura" },
                { text: "/Nagaland" } ]
            
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    },
};


covidBot.onText(/\/(.+)/,async (msg, match) => await GetCovidData(msg,match[0]));
//covidBot.onText(/\/Gujarat/,async (msg, match) => await GetCovidData(msg,match[0]));
//covidBot.onText(/\/Goa/,async (msg, match) => await GetCovidData(msg,match[0]));



async function GetCovidData(msg, match) {
    try {

    let chatId = msg.chat.id;

    // who is requested...
    console.log(`${msg.from.first_name} is asking for ${msg.text}`);
    covidBot.sendChatAction(chatId, "typing");
    

    let input = String(match).replace('/','').replace('_', ' ');

    if(input.toUpperCase() === 'INDIA') {

        //covidBot.sendPhoto(chatId, 'images/INDIA_Case.jpg');

        // Below code to send text data.
        let IndiaData = await request('https://covid19-server.chrismichael.now.sh/api/v1/IndiaCasesByStates');
        IndiaData = JSON.parse(IndiaData).data[0].table;

        let GetFormateData = makefullDataResponse(IndiaData);
        let makeResponse = `<pre>${GetFormateData.response}</pre>`;
        makeResponse += `<b>#INDIA</b>          | ${formatMe(GetFormateData.India.confirmed, secondColFormatlength)}|${formatMe(GetFormateData.India.deaths, thirdColFormatlength)} \n`;

        covidBot.sendMessage(chatId, makeResponse, {parse_mode: "HTML"});
    
    } else {

        let stateData = await request('https://api.covid19india.org/state_district_wise.json');
        stateData = JSON.parse(stateData);


        if (input in stateData) {  //&& !input.toUpperCase().includes('GUJARAT')) {
            let districtData = stateData[input].districtData;
            let response = `Covid-19 status of <b>#${input.replace('Islands', '').replace('Haveli','').replace(' and', ' &').replace(" ", "_")}</b>\n\n`;
            let total = 0;

            response += `${formatMe("District", 13)}|${formatMe("Confirmed", 11)}\n<pre>`;


            Object.keys(districtData).filter(d=> d !== 'Unknown').forEach(d=> {
                total+= Number(districtData[d].confirmed);
                response += `${formatMe(truncate(d),13)}|${formatMe(districtData[d].confirmed, secondColFormatlength)}\n`;
            });

            response +=`</pre><b>Total:</b> ${total}`;
            console.log(response);
            covidBot.sendMessage(chatId, response, {parse_mode: "HTML"});

        } else if (input.toUpperCase().includes('GUJARAT')){

            //covidBot.sendPhoto(chatId, 'images/Gujarat_Case.jpg');
            
            // Below code send photo + text
            let districtData = stateData[input].districtData;
            let response = '';
            Object.keys(districtData).filter(d=> d !== 'Unknown').forEach(d=> {
                response += `${d} ===> ${districtData[d].confirmed}`;
            });

            covidBot.sendPhoto(chatId, 'images/Gujarat_Case.jpg',{caption: response, parse_mode:"HTML"});

        } else {
            covidBot.sendMessage(chatId, "Choose option from below", replyOptions);
        }
    }

} catch(error) {
    console.log(error);
}
    
};

function makefullDataResponse(allStateData) {
    
    let response = `${formatMe("State", 13)}|${formatMe("Confirmed", 11)}|${formatMe("Death", 11)}\n`;
    let TotalData = allStateData.find(ele => ele.statecode === "TT");

    allStateData.filter(d => d.statecode !== "TT").forEach(state => {
        let statename = state.state.replace('Islands', '').replace('Haveli','').replace(' and', ' &').replace(" ", "_");
        response += `${formatMe(truncate(statename),13)}|${formatMe(state.confirmed, secondColFormatlength)}|${formatMe(state.deaths, thirdColFormatlength)} \n`;
    });

    return { response: response,
            India: TotalData
    };
}


function formatMe(data, wordlength = 18){

    let TotalSpace = (wordlength - String(data).length);    
    return ' ' + data + Array(TotalSpace).fill(' ').join("");
}

function truncate(input) {
    if(input.length > 10) {
        return input.substring(0,10) + '...';
    }
    return input;
}

  
covidBot.on('message', (msg) => {
    const user = msg.chat;
    const input = msg.text.toLowerCase();
    
    if (!input.includes('/')){
        
        if(input.includes('start') && enableInterval) {

            console.log('in start');
            let reportName = input.split(' ')[1].toUpperCase();
            if (typeof availableMapReport[reportName] !== 'undefined') {
                
                if(checkUserPresentInRegister(availableMapReport[reportName].Users, user)){ 
                    //console.log('You registered already!');
                    covidBot.sendMessage(user.id, `You registered already for ${reportName} report`, {parse_mode: 'HTML'});
                } else {
                    console.log(`Registering ${user.first_name} for ${reportName} report`);
                    availableMapReport[reportName].Users.push(user);
                    covidBot.sendMessage(user.id, `You registered for <b>${reportName}</b> report`, {parse_mode: 'HTML'});
                }

            } else {
                covidBot.sendMessage(user.id, `Sorry! I can't serve for <b>${reportName}</b> report`, {parse_mode: 'HTML'});
            }
            
        } else if (input.includes('stop') && enableInterval) {

            let reportName = input.split(' ')[1].toUpperCase();
            if (typeof availableMapReport[reportName] !== 'undefined') {
                console.log(`Unregistering ${user.first_name} for ${reportName} report`);
                availableMapReport[reportName].Users = availableMapReport[reportName].Users.filter(registerUser => registerUser.id !== user.id);
                covidBot.sendMessage(user.id, `You will not get update of <b>${reportName}</b> report`, {parse_mode: 'HTML'});
            } else {
                covidBot.sendMessage(user.id, `Sorry! I can't serve for <b>${reportName}</b> report`, {parse_mode: 'HTML'});
            }
        } else if(input.includes('india map')) {
            covidBot.sendPhoto(user.id, availableMapReport.INDIA.path,{ parse_mode:"HTML"});
        } else if(input.includes('gujarat map')) {
            covidBot.sendPhoto(user.id, availableMapReport.GUJARAT.path,{ parse_mode:"HTML"});
        } else { 
            console.log(msg);
            covidBot.sendMessage(user.id, "Choose option from below", replyOptions);
        }
    }
});


function startIntervalReport(enableInterval) {

    if (!enableInterval) return;

    console.log('Timer for reports started!');
    let reportInterval = null;

    reportInterval = setInterval(()=>{
        Object.keys(availableMapReport).forEach(report => {
            availableMapReport[report].Users.forEach(registerUser => {
                console.log(`Sending ${report} report to ${registerUser.first_name} at ${currentTime()}`);

                let captionMsg = `Next report you will get at \n   <b>${indianMoment().millisecond(sendBackEvery).format('h:mm:ss A')}</b>`;
                covidBot.sendPhoto(registerUser.id, availableMapReport[report].path, {caption: captionMsg, parse_mode: 'HTML'});
            });
        });
    }, sendBackEvery);

    setTimeout(()=>{ 
        console.log('STOP >>>>> Timer');
        clearInterval(reportInterval);

        let allRegisterUser = [];
        Object.keys(availableMapReport).forEach(report => {
            availableMapReport[report].Users.forEach(registerUser => {
                allRegisterUser.push(registerUser.id);
            });
        });
        // remove duplicate from allRegisterUser
        allRegisterUser = [...new Set(allRegisterUser)];
        allRegisterUser.forEach(userId => {
            covidBot.sendMessage(userId, `Time's up! I will not serve report from now!`);
        });
        
    }, timeOutAfter);
            
}

function currentTime() {
    return indianMoment().format('DD-MMM-YYYY h:mm:ss A');
}

function checkUserPresentInRegister(users, requestUser) {

    let isPresent = false;
    users.forEach(user => {
        if(user.id === requestUser.id) {
            isPresent= true;
            break;
        }
    })
    return isPresent;
}

function indianMoment() {
    // https://www.techrepublic.com/article/convert-the-local-time-to-another-time-zone-with-this-javascript/
    let d = new Date();
    let offset = '+5.5'

    let  utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return moment(utc + (3600000*offset));
}

// ****************************************************END >>>>> Covid-19 Data *******************************/








// **************************************************** CIRCLECI BOT *********************************/



let token = process.env.CI_Telegram_Token;
let bot = new TelegramBot(token, { polling: true });

let CIRCLECI_TOKEN = process.env.CIRCLECI_TOKEN;
let CircleciAPI = 'https://circleci.com/api/v2';

let iSuccess = '\u{2705}';
let iFailed = '\u{274C}';
let iHold = '\u{23F8}';
let iQuestion = '\u{2754}';
let iBlock = '\u{1F6AB}';

let gWorkflow = null;

let gUserPhoto = null;

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    let ticketID = '';


    if (String(msg.text).toUpperCase().includes('PREAPPS') && msg.text.match(/\d+/g) !== null)
        ticketID = 'PREAPPS-' + msg.text.toUpperCase().replace('PREAPPS-', '').replace('PREAPPS', '');
    else
        ticketID = msg.text.toLowerCase();

    let response = await responseToPREAPPS(ticketID);
    if (response === null) {
        bot.sendMessage(chatId, `\u{1F61E} Sorry Can't find status of <b>${ticketID}</b>`, { parse_mode: "HTML" });
    } else {
        bot.sendMessage(chatId, response, { parse_mode: "HTML" });
        if (gUserPhoto !==null) {
            //bot.sendPhoto(chatId, gUserPhoto);
        }
    }
});


async function responseToPREAPPS(ticketID) {

    let jobsData = await fetchCirceCIStatus(ticketID);
    return preparedResponse(jobsData, ticketID);

}

async function fetchCirceCIStatus(ticketID) {
    let pipelineData = await CI_PipeLine(ticketID);
    let workflowID = await CI_Workflow(pipelineData.id);
    let jobsData = await CI_Jobs(workflowID);
    gWorkflow = workflowID
    return { jobs: jobsData , pipelineData: pipelineData};
}

async function preparedResponse(apiData, ticketID) {

    console.log(apiData);

    let jobsData = apiData.jobs;
    if (jobsData === null) return null;

    let response = `CircleCI Status of <b><a href='https://circleci.com/workflow-run/${gWorkflow}'>${ticketID}</a></b> \n`;
    let jobNameAndStatus = jobsData.map(job => [job.name, job.status]);

    let zimbra9x = [];
    let zimbrax = [];
    let zimbra9 = [];
    let approval = [];
    let build = [];
    let other = [];

    for (let i = 0; i < jobNameAndStatus.length; i++) {
        
        if (jobNameAndStatus[i][0].includes('-approval')) {
            approval.push(jobNameAndStatus[i]);
        } else if (jobNameAndStatus[i][0].includes('zimbra9x-testcafe')) {
            zimbra9x.push(jobNameAndStatus[i]);
        } else if (jobNameAndStatus[i][0].includes('zimbrax-testcafe')) {
            zimbrax.push(jobNameAndStatus[i]);
        } else if (jobNameAndStatus[i][0].includes('-testcafe')) {
            zimbra9.push(jobNameAndStatus[i]);
        } else if (jobNameAndStatus[i][0].includes('build')) {
            build.push(jobNameAndStatus[i]);
        } else {
            other.push(jobNameAndStatus[i]);
        }
    }


    zimbra9 = zimbra9.sort(compareSecondColumn);
    zimbra9x = zimbra9x.sort(compareSecondColumn);
    zimbrax = zimbrax.sort(compareSecondColumn);
    build = build.sort(compareSecondColumn);
    approval = approval.sort(compareSecondColumn);


    response += `Author: <b>${apiData.pipelineData.user}</b>\n`;
    gUserPhoto = apiData.pipelineData.userImage;
    

    build.length > 0 ? response += '\n\n\n<b><u>Build</u></b>\n' : '';
    build.forEach(job => {
        response += attachedIcon(job);
    });

    Called = 0;

    zimbra9.length > 0 ? response += '\n\n\n<b><u>Zimbra 9</u></b>\n' : '';
    zimbra9.forEach(job => {
        response += attachedIcon(job);
    });

    Called = 0;

    zimbra9x.length > 0 ? response += '\n\n\n<b><u>Zimbra 9x</u></b>\n' : '';
    zimbra9x.forEach(job => {
        response += attachedIcon(job);
    });

    Called = 0;

    zimbrax.length > 0 ? response += '\n\n\n<b><u>Zimbra x</u></b>\n' : '';
    zimbrax.forEach(job => {
        response += attachedIcon(job);
    });

    Called = 0;

    approval.length > 0 ? response += '\n\n\n<b><u>Approval</u></b>\n' : '';
    approval.forEach(job => {
        response += attachedIcon(job);
    });

    Called = 0;

    other.length > 0 ? response += '\n\n\n<b><u>Other</u></b>\n' : '';
    other.forEach(job => {
        response += attachedIcon(job);
    });

    return response;
}

let Called = 0;
function attachedIcon(job) {
    Called++;
    let data = '';
    job[0] = job[0].replace('-zimbra9x-testcafe','').replace('-zimbrax-testcafe','').replace('-testcafe','').replace('-approval','');

    if (String(job[1]).includes('hold'))
        data += iHold;
    else if (String(job[1]).includes('success')) {
        data += iSuccess;
    } else if (String(job[1]).includes('fail')) {
        data += iFailed;
    } else if (String(job[1]).includes('block')) {
        data += iBlock;
    } else {
        data += iQuestion;
    }

    if (Called%3 === 0) 
        data += ` ${job[0]} \n`;
    else
        data += ` ${job[0]} | `;
    return data;
}


function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}



async function preparedResponse_NoCategories(jobsData, ticketID) {

    if (jobsData === null) return null;

    let response = `Status of <b>${ticketID}</b> \n`;
    let jobNameAndStatus = jobsData.map(job => [job.name, job.status]);

    let successJobs = jobNameAndStatus.filter(job => job[1].includes('success'));
    let failedJobs = jobNameAndStatus.filter(job => job[1].includes('fail'));
    let holdJobs = jobNameAndStatus.filter(job => job[1].includes('hold'));
    let blockJobs = jobNameAndStatus.filter(job => job[1].includes('block'));


    //successJobs.length >0 ? response += `\n\n------ Success -----\n\n`:'';
    successJobs.forEach(job => {
        response += `${iSuccess} ${job[0]} \n`;
    });

    //failedJobs.length > 0 ? response += `\n\n------ Failed -----\n\n`: '';
    failedJobs.forEach(job => {
        response += `${iFailed} ${job[0]} \n`;
    });


    //holdJobs.length > 0 ? response += `\n\n------ on Hold -----\n\n`: '';
    holdJobs.forEach(job => {
        response += `${iHold} ${job[0]} \n`;
    });


    //blockJobs.length > 0 ? response += `\n\n------ Block -----\n\n`: '';
    blockJobs.forEach(job => {
        response += `${iBlock} ${job[0]} \n`;
    });

}


async function CI_PipeLine(ticketID) {

    if (ticketID === null) return null;

    try {
        console.log(`${CircleciAPI}/project/github/ZimbraOS/zm-x-web/pipeline?branch=${ticketID}&circle-token=${CIRCLECI_TOKEN}`);
        let pipelineData = JSON.parse(await request(`${CircleciAPI}/project/github/ZimbraOS/zm-x-web/pipeline?branch=${ticketID}&circle-token=${CIRCLECI_TOKEN}`));
        console.log('pipeline data');
        console.log(pipelineData);

        if (pipelineData.items.length > 0) {
            return {
                id: pipelineData.items[0].id,
                user: pipelineData.items[0].trigger.actor.login,
                userImage: pipelineData.items[0].trigger.actor.avatar_url
            }
        }

        return {
                id: null,
                user: null,
                userImage: null
        }
        
    } catch (error) {
        console.log('Error at CI_PipeLine');
        return null;
    }

}

async function CI_Workflow(latestPipeLineID) {

    if (latestPipeLineID === null) return null;

    try {

        let workflowData = JSON.parse(await request(`${CircleciAPI}/pipeline/${latestPipeLineID}/workflow?circle-token=${CIRCLECI_TOKEN}`));

        console.log('workflow data');
        console.log(workflowData);

        if (workflowData.items.length > 0)
            return workflowData.items[0].id;

        return null;

    } catch (error) {
        console.log('error at CI_Workflow', error);
        return null;
    }
}

async function CI_Jobs(workflowID) {

    if (workflowID === null) return null;

    try {
        let jobsData = JSON.parse(await request(`${CircleciAPI}/workflow/${workflowID}/job?circle-token=${CIRCLECI_TOKEN}`));

        console.log('jobs data');
        console.log(jobsData)

        if (jobsData.items.length > 0)
            return jobsData.items;

        return null;
    } catch (error) {
        console.log('error at CI_Jobs');
        return null;
    }
}



// ****************************************************END >>>>>> CIRCLECI BOT *********************************/
















/* 

bot.onText(/\/echo (.+)/, function (msg, match) {
    let chatId = msg.chat.id;
    let echo = match[1];
    let response = 'This bot will response the latest status of CI of PREAPPS project ticket';

    if (String(echo).includes('PREAPPS')) {
        response = 'You are asking about PREAPPS Project! \n one moment please';
    }

    bot.sendMessage(chatId, response);
});

bot.onText(/\/PREAPPS-(.+)/, function (msg, match) {
    let chatId = msg.chat.id;
    let echo = match[1];
    let response = 'Received';

    bot.sendMessage(chatId, response);
});

bot.on('help', function (msg, match) {
    let chatId = msg.chat.id;
    let echo = match[1];
    let response = 'Received';

    bot.sendMessage(chatId, response);
});

***/

//Backup 

/****
 * 
 * bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    let ticketID = '';
    //console.log(msg);

    

         if (String(msg.text).toUpperCase().includes('PREAPPS') && msg.text.match(/\d+/g) !== null) {

            ticketID = 'PREAPPS-' + msg.text.match(/(\d+)/)[0];
            let response = await responseToPREAPPS(ticketID);
            bot.sendMessage(chatId, `Status of <b>${ticketID}</b>
            
            <u>Zimbra9x</u>
                \u{2705} Smoke | \u{23F8} BHR | \u{274C} Functional 
    
            <u>ZimbraX</u>
                \u{2705} <a href='https://circleci.com/workflow-run/e6e0a0b5-10a5-4a77-ad11-03d776f0e79e'>Smoke</a> | \u{2705} BHR | \u{274C} Functional 
            
            `, { parse_mode: "HTML" });
    
    
    
        } else {
            bot.sendMessage(chatId, `\u{1f64f} Please send me like PREAPPS-4141 \u{1f64f}`, { parse_mode: "HTML" });
        }
    });
 */



  /* for(let i=0;i<jobNameAndStatus.length;i++) {
        
        if(String(jobNameAndStatus[i][1]).includes('hold'))
            response += iHold;
        else if (String(jobNameAndStatus[i][1]).includes('success')) {
            response += iPassed;
        } else if (String(jobNameAndStatus[i][1]).includes('fail')) {
            response += iFailed;
        } else if (String(jobNameAndStatus[i][1]).includes('block')) {
            response += iBlock;
        } else {
            response += iQuestion;
        }

        response +=` ${jobNameAndStatus[i][0]} \n`;
    } */



    //--------------

    /****
     * 
     * 
     * 
     * async function preparedResponse(jobsData, ticketID) {

    if (jobsData === null) return null;

    let response = `Status of <b>${ticketID}</b> \n`;
    let jobNameAndStatus = jobsData.map(job => [job.name, job.status]);

    let successJobs = jobNameAndStatus.filter(job => job[1].includes('success'));
    let failedJobs = jobNameAndStatus.filter(job => job[1].includes('fail'));
    let holdJobs = jobNameAndStatus.filter(job => job[1].includes('hold'));
    let blockJobs = jobNameAndStatus.filter(job => job[1].includes('block'));


    //successJobs.length >0 ? response += `\n\n------ Success -----\n\n`:'';
    successJobs.forEach(job => {
        response += `${iSuccess} ${job[0]} \n`;
    });

    //failedJobs.length > 0 ? response += `\n\n------ Failed -----\n\n`: '';
    failedJobs.forEach(job => {
        response += `${iFailed} ${job[0]} \n`;
    });


    //holdJobs.length > 0 ? response += `\n\n------ on Hold -----\n\n`: '';
    holdJobs.forEach(job => {
        response += `${iHold} ${job[0]} \n`;
    });


    //blockJobs.length > 0 ? response += `\n\n------ Block -----\n\n`: '';
    blockJobs.forEach(job => {
        response += `${iBlock} ${job[0]} \n`;
    });
    
    return response;
}
     * 
     * 
     *  */  
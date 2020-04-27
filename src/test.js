let request = require('request-promise');
let Jimp = require('jimp');
let moment = require('moment');

let enableInterVal = true;
let reportGenerateIntervalTime = (60000 * 1 * 2);
let clearIntervalTimer = 60000 * 60 * 24 * 20;

GenerateReport();




function GenerateReport() {

    if(enableInterVal) {
        let intervalfun = setInterval(()=>{
            Report_Gujarat();
            Report_INDIA();
        }, reportGenerateIntervalTime);
        
        setTimeout(()=>{
            console.log('STOP >>>>>> Timer');
            clearInterval(intervalfun);
        }, clearIntervalTimer);        

    } else {
        Report_Gujarat();
        Report_INDIA();
    }

}



let XY_GJ = {
    "Ahmadabad":{
        x: 616,
        y: 312
    },
    "Surat": {
        x: 717,
        y: 568
    },
    "Vadodara": {
        x: 760,
        y: 419
    },
    "Bhavnagar": {
        x: 582,
        y: 509
    },
    "Kachchh": {
        x: 250,
        y: 175
    },
    "Rajkot": {
        x: 429,
        y: 429
    },
    "Patan": {
        x: 540,
        y: 183
    },
    "Bharuch": {
        x: 739,
        y: 493
    },
    "Botad": {
        x: 541,
        y: 437
    },
    "Dahod": {
        x: 905,
        y: 314
    },
    "Gandhinagar": {
        x: 703,
        y: 255
    },
    "Jamnagar": {
        x: 325,
        y: 419
    }
}

let XY_IND = {
    "Gujarat": {
        x: 68,
        y: 507
    },
    "Maharashtra": {
        x: 202,
        y: 603
    },
    "Delhi": {
        x: 43,
        y: 201
    },
    "Rajasthan": {
        x: 154,
        y: 390
    },
    "Tamil Nadu": {
        x: 280,
        y: 850
    },
    "Madhya Pradesh": {
        x: 280,
        y: 485
    },
    "Uttar Pradesh": {
        x: 345,
        y: 360
    },
    "Telangana": {
        x: 293,
        y: 638
    },
    "Andhra Pradesh": {
        x: 290,
        y: 740
    },
    "Karnataka": {
        x: 208,
        y: 755
    },
    "Kerala": {
        x: 200,
        y: 870
    },
    "Jammu and Kashmir": {
        x: 240,
        y: 140
    },
    "West Bengal": {
        x: 552,
        y: 493
    },
    "Haryana": {
        x: 226,
        y: 295
    },
    "Punjab": {
        x: 210,
        y: 250
    },
    "Bihar": {
        x: 490,
        y: 412
    },
    "Odisha": {
        x: 463,
        y: 570
    },
    "Uttarakhand": {
        x: 314,
        y: 270
    },
    "Jharkhand": {
        x:476,
        y:461
    },
    "Himachal Pradesh": {
        x: 300,
        y: 205
    },
    "Chhattisgarh": {
        x: 380,
        y: 538
    },
    "Assam":{
        x: 680,
        y:350
    },
    "Ladakh": {
        x: 432,
        y: 80
    },
    "Andaman and Nicobar Islands": {
        x: 673,
        y: 866
    },
    "Meghalaya": {
        x: 622,
        y: 404
    },
    "Goa": {
        x: 141,
        y: 727
    },
    "Manipur": {
        x: 746,
        y: 433
    },
    "Tripura": {
        x: 620,
        y: 463
    },
    "Mizoram": {
        x: 726,
        y: 490
    },
    "Arunachal Pradesh": {
        x: 767,
        y: 298
    },
    "Nagaland": {
        x: 763,
        y: 384
    },
    "Dadra and Nagar Haveli": {
        x: 58,
        y: 625
    },
    "Daman and Diu": {
        x: 39,
        y: 552
    },
    "Lakshadweep": {
        x: 141,
        y: 892
    },
    "Sikkim": {
        x: 579,
        y: 318
    }
};


async function Report_Gujarat() {
    console.log('start Gujarat Report');
    let cases = await fetchData_GJ();
    const font_14 = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    const font_16 = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    const font_32 = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    const image = await Jimp.read('src/images/Gujarat.jpg');


    // ADD title of image;
    image.print(font_32, 800, 20, reportTitle(), 200);

    // ADD Bottom text;
    image.print(font_16, 219, 730, 'Mitesh Covid-19', 200);

    // Total cases
    let totalCases = 0;
    Object.keys(cases).forEach(c => totalCases += Number(cases[c].confirmed));
    image.print(font_32, 100, 580, totalCases, 200);

    // ADD State Name
    //image.print(font_32, 828, 90, 'Gujarat', 200);


   Object.keys(XY_GJ).forEach(async name => {
        //console.log(name);
        makeRoundBackground(image, cases[name].confirmed, XY_GJ[name].x, XY_GJ[name].y);
        image.print(font_14, XY_GJ[name].x, XY_GJ[name].y, cases[name].confirmed, 50);
    });

    image.writeAsync(`src/images/Generated/${storeFileName('Gujarat')}`);
    image.writeAsync('src/images/Gujarat_Case.jpg');
    console.log('Done >>>>> Gujarat Report at ' + currentTime());
}




async function Report_INDIA() {
    console.log('start  INDIA report');
    let cases = await fetchData_INDIA();
    const font_14 = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    const font_16 = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    const font_32 = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    const image = await Jimp.read('src/images/INDIA.jpg');


    // ADD title of image;
    image.print(font_32, 500, 150, reportTitle(), 200);

    // ADD Bottom text;
    image.print(font_16, 378, 920, 'Mitesh Covid-19', 200);

    // Total cases
    let totalCases = cases['Total'].confirmed;
    image.print(font_32, 544, 685, totalCases, 200);


   Object.keys(XY_IND).forEach(async name => {
        //console.log(name);
        makeRoundBackground(image, cases[name].confirmed, XY_IND[name].x, XY_IND[name].y);
        image.print(font_14, XY_IND[name].x, XY_IND[name].y, cases[name].confirmed, 50);
    });

    image.writeAsync(`src/images/Generated/${storeFileName('India')}`);
    image.writeAsync('src/images/INDIA_Case.jpg');
    console.log('Done >>>> INDIA report at '+ currentTime());
}



async function fetchData_GJ() {
    let stateData = await request('https://api.covid19india.org/state_district_wise.json');
    stateData = JSON.parse(stateData);
    let Gujarat = stateData = stateData['Gujarat'].districtData;
    return Gujarat;
}

async function fetchData_INDIA() {
    let IndiaData = await request('https://covid19-server.chrismichael.now.sh/api/v1/IndiaCasesByStates');
    IndiaData = JSON.parse(IndiaData).data[0].table;
    let obj = {};
    IndiaData.forEach(state=>{
        obj[state.state] = {
            "confirmed": state.confirmed
        }
    });

    return obj;
}



function reportTitle() {
    return indianMoment().format('DD-MMM-YYYY h:mm A');
}

function currentTime() {
    return indianMoment().format('DD-MMM-YYYY h:mm:ss A');
}

function storeFileName(name) {
    return `${name}_${currentTime().replace(/ /g,'_').replace(/:/g,'_').replace(/-/g,'_')}.jpg`;
}

function indianMoment() {
    // https://www.techrepublic.com/article/convert-the-local-time-to-another-time-zone-with-this-javascript/
    let d = new Date();
    let offset = '+5.5'

    let  utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return moment(utc + (3600000*offset));
}

function makeBackground(image, caseNumber, xCor, yCor) {

    let startPixel = xCor - 2;
    let endPixel = startPixel + String(caseNumber).length * 10 + 3;
    let colorHashCode = 0xFFFFFF;
    let fontSize = 16;

    console.log('startPixel', startPixel, 'endPixel', endPixel);

    for(let i = startPixel; i < endPixel; i++) {

        for (let j=0; j < fontSize + 2; j++) {
            image.setPixelColor(colorHashCode, i, yCor + j);
        }
    }

}


function makeRoundBackground(image, caseNumber, xCor, yCor) {

    let startPixel = xCor - 2;
    let endPixel = startPixel + String(caseNumber).length * 10 + 5;
    let colorHashCode = 0xFFFFFF;
    let fontSize = 18;

    let p1 = { x: xCor - 4, y: yCor - 5};
    let p2 = { x: endPixel, y: yCor - 5};
    let p3 = { x: xCor - 4, y: yCor + fontSize + 5};
    let p4 = { x: endPixel, y: yCor + fontSize + 5};

    let p = { x: p1.x + Math.floor((p2.x - p1.x)/2), y: p1.y + Math.floor((p3.y - p1.y)/2)};
    let radius = Math.floor(Math.abs(p.x - p1.x));
    //console.log('radius', radius);

    for(let i = p1.x; i < p2.x; i++) {


        for (let j=p1.y; j < p3.y; j++) {
            let currentPoint = {x: i, y: j};
            let calDistance = Math.sqrt(Math.pow(Math.abs(p.x - currentPoint.x), 2) + Math.pow(Math.abs(p.y - currentPoint.y), 2));
            if (calDistance <= radius)
                image.setPixelColor(colorHashCode, i, j);
        }
    }

}


/* Jimp.read('images/Gujarat.jpg', (err, lenna) => {
    if (err) throw err;
    lenna
      .resize(256, 256) // resize
      .quality(60) // set JPEG quality
      .greyscale() // set greyscale
      .write('images/Proceed.jpg'); // save

      Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font => {
        lenna.print(
          font,
          x,
          y,
          {
            text: 'Hello world!',
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
          },
          maxWidth,
          maxHeight
        ); // prints 'Hello world!' on an image, middle and center-aligned, when x = 0 and y = 0
      }).then()
  }); */






//fetchCovid19Data();

async function fetchCovid19Data() {

    /* let IndiaData = await request('https://covid19-server.chrismichael.now.sh/api/v1/IndiaCasesByStates');
    IndiaData = JSON.parse(IndiaData).data[0].table;

    let maharastra = IndiaData.find(ele => ele.statecode==='MdfdfH');


    console.log('IndiaData', maharastra); */

    let input = "Gujarat";

    let stateData = await request('https://api.covid19india.org/state_district_wise.json');
    stateData = JSON.parse(stateData);

    if (input in stateData) {
        let districtData = stateData = stateData[input].districtData;

    }

    console.log(stateData);

}


























































/* let request = require('request-promise');
let CIRCLECI_TOKEN = '694adc27f180f210fa9da500795b08741fd12f1f';
let CircleciAPI = 'https://circleci.com/api/v2'; */

/* request(`${CircleciAPI}/project/github/ZimbraOS/zm-x-web/pipeline?branch=PREAPPS-4767&circle-token=${CIRCLECI_TOKEN}`)
        .then(data => JSON.parse(data))
        .then(response=>{
            if(response.items.length > 0) {
                let latestPipeLineID = response.items[0].id;
            }
            console.log(response.items[0].id);
        }).catch(error => {
            console.log('error', error.message);
        }); */

/* test();

async function test() {
    let pipelineData = JSON.parse(await request(`${CircleciAPI}/project/github/ZimbraOS/zm-x-web/pipeline?branch=PREAPPS-4767&circle-token=${CIRCLECI_TOKEN}`));
    
    if(pipelineData.items.length > 0) {
        let latestPipeLineID = pipelineData.items[0].id;

        let workflowData = JSON.parse(await request(`${CircleciAPI}/pipeline/${latestPipeLineID}/workflow?circle-token=${CIRCLECI_TOKEN}`));

        if (workflowData.items.length > 0) {
            let workflowID = workflowData.items[0].id;

            let jobsData = JSON.parse(await request(`${CircleciAPI}/workflow/${workflowID}/job?circle-token=${CIRCLECI_TOKEN}`));
            let jobNames = jobsData.items.map(job => [job.name, job.status]);
            console.log(jobNames);
        }
    }
} */
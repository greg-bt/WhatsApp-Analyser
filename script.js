// JavaScript source code

// Listen for the txt being submited
document.getElementById('input-file')
    .addEventListener('change', getFile)

// Reception of the file
function getFile(event) {
    const input = event.target
    if ('files' in input && input.files.length > 0) {
        placeFileContent(
            document.getElementById('content-target'),
            input.files[0])
    }
}

// Read the chat from the file and analyse
function placeFileContent(target, file) {
    readFileContent(file).then(rawChat => {

        // Make array "chat" of all messages
        var chat = rawChat.split("\n");


        //  -= Analysis of message frequency =-

        var dates = [];
        var frequency = [];
        var messages = [];
        var total = 0;

        // Record dates, frequency of messages, and content of messages
        chat.forEach(message => {
            // Get the dates of days where messages were sent
            var date = message.split(",")[0]
            if (dates.includes(date)) {
                frequency[dates.indexOf(date)]++;   // Add to frequency if date has already been recorded
                total++;
            } else if (date.length == 10) {
                dates.push(date);                   // Create new date if it hasnt already been recorded
                frequency.push(1);
                total++;                            // And increase the total message count
            }

            messages.push(message.split(" - ")[1]); // Record the message content for analysis
        });

        var fewest = [ "" , 2000 ];
        var most = ["", 0];

        // Find the days of most and least frequent messaging
        for (i = 0; i < dates.length; i++) {
            if (frequency[i] > most[1]) {
                most = [dates[i], frequency[i]];
            } else if (frequency[i] < fewest[1]) {
                fewest = [dates[i], frequency[i]];
            }
        }

        // Find the start and end dates from when messages were first sent
        var date1 = new Date(dates[0].split("/")[2], dates[0].split("/")[1], dates[0].split("/")[0]); // start
        var date2 = new Date(dates[dates.length - 1].split("/")[2], dates[dates.length - 1].split("/")[1], dates[dates.length - 1].split("/")[0]); // end
        var days = Math.round((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)); // Amount of days since first message


        //  -= Analysis of messages =-

        var wpm = 0;        // Adv words per message
        var wordl = 0;      // Adv word length
        var longest = [0, ""];
        var outin = ["", 0, 0, "", 0, 0]

        messages.forEach(message => {
            if (message != undefined) {
                wpm += message.split(" ").length - 2;                 // total up the words

                if (message.split(" ").length >= longest[0]) {
                    longest[0] = message.split(" ").length;           // find longest message
                    longest[1] = message;
                }

                // Total up the messages sent by each party
                if (message.split(": ").length > 1) {
                    if (outin[0] == "") {                                   // Determine which parties were involved
                        outin[0] = message.split(": ")[0];
                        outin[1]++; outin[2] += message.split(": ")[1].split(" ").length;
                    } else if (outin[3] == "") {
                        outin[3] = message.split(": ")[0];
                        outin[4]++; outin[5] += message.split(": ")[1].split(" ").length;
                    } else if (message.split(": ")[0] == outin[0]) {        // And total up messages for each party
                        outin[1]++; outin[2] += message.split(": ")[1].split(" ").length;
                    } else if (message.split(": ")[0] == outin[3]) {
                        outin[4]++; outin[5] += message.split(": ")[1].split(" ").length;
                    }
                }

                message.split(" ").forEach(word => {                  // Total up the number of characters that have been sent
                    wordl += word.length;
                })
            }
        });
        console.log(outin);

        wordl = wordl / wpm;
        wpm = wpm / messages.length;


        // Output majour stats to the webpage 
        document.getElementById("stats").innerHTML = `\nA total of ${total} messages since ${dates[0]} over ${days} days
With an adverage of ${total / days} daily messages
Messaging on ${dates.length}/${days} or ${dates.length / days * 100}% of those days

Total messages sent by ${ outin[0]}: ${outin[1]}
Total messages sent by ${ outin[3]}: ${outin[4]}

Most messages on ${ most[0]}, totalling ${most[1]}
Fewest messages on ${fewest[0]}, totalling ${fewest[1]}

An adverage of  ${ wpm}  words per message with an adverage length of  ${ wordl }  letters per word
The longest message was
    "${ longest[1] }"

Too much info:

    Characters sent: ${ Math.round(wordl * wpm * messages.length) }
    Words sent: ${ wpm * messages.length }

    ${ outin[0]} Words: ${outin[2]}
    ${ outin[3]} Words: ${outin[5]}

    ${ outin[0]} WPM: ${outin[2] / outin[1]}
    ${ outin[3]} WPM: ${outin[5] / outin[4]}
`;

        // Make graphics from analysis
        var dataPoints = [];

        // Plot the frequency against the date, marking the most and least frequent days of messaging
        for (i = 0; i < dates.length; i++) {
            var dat = dates[i].split("/");
            if (dates[i] == most[0]) {              // Most frequent
                dataPoints.push({ x: new Date(dat[2], dat[1] - 1, dat[0]), y: frequency[i], indexLabel: "Most",markerColor: "red",markerType: "triangle" });
            } else if (dates[i] == fewest[0]) {     // Least frequent
                dataPoints.push({ x: new Date(dat[2], dat[1] - 1, dat[0]), y: frequency[i], indexLabel: "Least",markerColor: "DarkSlateGrey",markerType: "cross" });
            } else {                                // Any other point
                dataPoints.push({ x: new Date(dat[2], dat[1] - 1, dat[0]), y: frequency[i] });
            }
        };

        var meanPoints = [];
        var mean = 0;

        // Plot the mean number of messages up to that point
        for (i = 0; i < dates.length; i++) {
            var dat = dates[i].split("/");
            mean += frequency[i];
            meanPoints.push({ x: new Date(dat[2], dat[1] - 1, dat[0]), y: (mean/(i+1)) });
        };

        // Create the graph and it's properties
        var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            theme: "dark2",
            title: {
                text: "Message Frequency"           // Title
            },
            axisX: {
                valueFormatString: "DD MMM",
                crosshair: {
                    enabled: true,
                    snapToDataPoint: true
                }
            },
            axisY: {
                title: "Messages",
                crosshair: {
                    enabled: true
                }
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                verticalAlign: "bottom",
                horizontalAlign: "left",
                dockInsidePlotArea: true,
            },
            data: [{                                // Frequency
                type: "line",
                showInLegend: true,
                name: "Total Messages",
                markerType: "square",
                xValueFormatString: "DD MMM, YYYY",
                color: "#F08080",
                dataPoints: dataPoints
            },
                {                                   // Mean
                    type: "spline",
                    showInLegend: true,
                    name: "Mean",
                    lineDashType: "dash",
                    markerSize: 0,
                    dataPoints: meanPoints
                }]
        });
        chart.render();

    }).catch(error => console.log(error))
}


// Get the contents of the file
function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}
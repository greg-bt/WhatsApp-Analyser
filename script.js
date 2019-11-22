// JavaScript source code written by su-greg [github]. Please don't steal or redistribute! 

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
        var chat = rawChat.split("\n");
		


		//   -= Analyse the chat messages =-   //

		// Get starting date
		var splitDate = chat[0].split(",")[0].split("/");
		var startDate = new Date(splitDate[2], splitDate[1]-1, splitDate[0]);
		
		// Get most resent message date
		for(i = chat.length-1; i != 0; i--) {
			if( chat[i].length > 20 ) {
				splitDate = chat[i].split(",")[0].split("/");
				var lastDate = new Date(splitDate[2], splitDate[1]-1, splitDate[0]);
				break;
			}
		}

		// Create array of dates between starting date and most resent message date
		Date.prototype.addDays = function(days) {
			var date = new Date(this.valueOf());
			date.setDate(date.getDate() + days);
			return date;
		}
	
		var dates = new Array();
		while (startDate <= lastDate) {
			dates.push(new Date (startDate));
			startDate = startDate.addDays(1);
		}

		// Record the Frequency of messages, their times, and their content.
		var total = 0;		// Total sent messages
		var words = 0;      // Total words sent
		var characters = 0; // Total characters sent
		var parties = {}    // { "party" : [messages, words ,characters], }

		var hours = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"]
		var hoursFreq = []; // Message frequency per hour
		for (i = 0; hours.length > i; i++) {
			hoursFreq[i] = 0;
		}

		var frequency = []; // Message frequency per day
		for (i = 0; dates.length > i; i++) {
			frequency[i] = 0;
		}

        chat.forEach(message => {
			// For valid messages
			if (message.split(": ")[1] != undefined && message.length > 20) {
				
				var content = message.split(" - ")[1]

				// Get the dates and times of days where messages were sent
				splitDate = message.split(", ")[0].split("/");
				var hour = message.split(", ")[1].split(":")[0];
				var date = new Date(splitDate[2], splitDate[1]-1, splitDate[0]);
				hoursFreq[hours.indexOf(hour)]++;
			
				// Increase frequency for that day and the total message count
				for (i = 0; dates.length > i; i++) {
					if (date.getTime() == dates[i].getTime()) {
						frequency[i]++;
						total++;
						break;
					}
				}

				// Count the approximate number of words in the message
				words += content.split(": ")[1].split(" ").length;

				// Total up the messages sent by each party
				if (content.split(": ")[0] in parties) {
					parties[content.split(": ")[0]][0]++;												// Count the message and then ...
					parties[content.split(": ")[0]][1] += content.split(": ")[1].split(" ").length;		// Words in message
					parties[content.split(": ")[0]][2] += content.split(": ")[1].length;					// Characters in message
				} else {
					parties[content.split(": ")[0]] = [0, 0, 0]; // If party hasn't been added yet add them to array
				}

				// Total up the number of characters that have been sent
				content.split(": ")[1].split(" ").forEach(word => {
                    characters += word.length;
                });
			}
		});

		// Find the days of most and least frequent messaging
		var fewest = [ "" , 99999 ];
		var most = ["" , 0];
		var active = 0;

		for (i = 0; i < dates.length; i++) {
            if (frequency[i] > most[1]) {
                most = [dates[i], frequency[i]];
            } else if (frequency[i] <= fewest[1]) {
                fewest = [dates[i], frequency[i]];
            }
			if (frequency[i] != 0) {
				active++;
			}
        }
		
		// Find the most active user
		var topMessager = ["", 0];
		for (party in parties) {
			if (parties[party][0] > topMessager[1]) {
				topMessager[0] = party;
				topMessager[1] = parties[party][0];
			}
		}

		// Find the top linguist
		var topLinguist = ["", 0];
		for (party in parties) {
			if (parties[party][1]/parties[party][0] > topLinguist[1]) {
				topLinguist[0] = party;
				topLinguist[1] = (parties[party][1]/parties[party][0]).toFixed(1);
			}
		}

		// Mean messages over last day, week, month, all
		var meanRanges = ["Resent", "Week", "Month", "Overall"]
		var means = [frequency[frequency.length-1], 0, 0, (total/dates.length).toFixed(1)];
		for (i= dates.length-1; i > dates.length-31; i--) {
			if (i > dates.length-8) {
				means[1] += frequency[i];
			}
			means[2] += frequency[i];
		}
		means[1] = (means[1]/7).toFixed(1);
		means[2] = (means[2]/30).toFixed(1);
		var topMean = 0;
		for (i in means) {
			if (means[i] > topMean) {
				topMean = means[i];
			}
		}



		//   -= Outputing the stats to the page =-   //

		document.getElementById("statsGrid").innerHTML = `
<div style="float: left;"class="div" onclick="switchDiv('msgGraph')"><p><span>${total} </span> messages sent</p>
<p>over<span> ${dates.length} </span>days, with</p>
<p>activity on<span> ${(active/dates.length*100).toFixed(1)}% </span></p>
<p>of those days.</p></div>

<div style="float: right;text-align: right;"class="div" onclick="switchDiv('langStats')"><br><br><p>Thats<span> ${words} </span>words,</p>
<p>or<span> ${characters} </span>characters!</p>
<p>With an adverage of<span> ${(words/total).toFixed(1)} </span></p>
<p>words per message.</p></div>

<div style="float: left;" class="div" onclick="switchDiv('meanStats')"><p>Highest score on<span> ${most[0].getDay()}/${most[0].getMonth()+1}/${most[0].getYear()-100} </span></p>
<p>with<span> ${most[1]} </span>messages in</p>
<p> one day, annnd you're currently</p>
<p>on a<span> ${Math.round((lastDate - fewest[0])/(24 * 60 * 60 * 1000))} </span>day streak!</p></div>

<div style="float: right;text-align: right;"class="div" onclick="switchDiv('partyStats')"><br><br><p>Most active member is</p><span> ${topMessager[0]} </span>
<p>with<span> ${topMessager[1]} </span>messages,</p>
<p>making up<span> ${(topMessager[1]/total*100).toFixed(1)}%</span></p>
<p>of all the messages.</p></div>
		`;

		// Create graph for messages per user
		var partyTable = "<a>Messages</a><div class='table'>";
		for (party in parties) { partyTable += `
			<div title="${parties[party][0]}" style="width:${Math.round(parties[party][0]/topMessager[1]*100)-5}%;" class="bar">
				<p>${ party }
					<span style="float: right;text-align: center;">${parties[party][0]} </span>
				</p>
			</div>`}
		document.getElementById("partyStats").innerHTML = `${partyTable}</div><pre onclick="switchDiv('statsGrid')" style="cursor: pointer;text-align: right;">Back</pre>`;

		// Create graph for words per user
		var partyTable = "<a>Words per message</a><div class='table'>";
		for (party in parties) { partyTable += `
			<div title="${(parties[party][1]/parties[party][0]).toFixed(1)}" style="width:${Math.round((parties[party][1]/parties[party][0])/topLinguist[1]*100)-5}%;" class="bar">
				<p>${ party }
					<span style="float: right;">${(parties[party][1]/parties[party][0]).toFixed(1)} </span>
				</p>
			</div>`}
		document.getElementById("langStats").innerHTML = `${partyTable}</div><pre onclick="switchDiv('statsGrid')" style="cursor: pointer;text-align: right;">Back</pre>`;

		// Create graph for message means
		var partyTable = "<a>Adv daily messages</a><div class='table'>";
		for (i=0; i < 4; i++) { partyTable += `
			<div title="${means[i]}" style="width:${Math.round(means[i]/topMean*100)-5}%;" class="bar">
				<p>${ meanRanges[i] }
					<span style="float: right;">${means[i]} </span>
				</p>
			</div>`}
		document.getElementById("meanStats").innerHTML = `${partyTable}</div><pre onclick="switchDiv('statsGrid')" style="cursor: pointer;text-align: right;">Back</pre>`;

		// Make graphics from analysis
        var dataPoints = [];

        // Plot the frequency against the date, marking the most and least frequent days of messaging
        for (i = 0; i < dates.length; i++) {
            dataPoints.push({ x: dates[i], y: frequency[i] });
        };

		var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            theme: "light2",
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
            }]
        });
        chart.render();


		document.getElementById("content").style.visibility = "hidden";
		document.getElementById("statsGrid").style.visibility = "visible";

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

// Switch to iOS script
function iOS() {
	document.getElementById("iOS").style.backgroundColor = "#EABD96";
	document.getElementById("android").style.backgroundColor = "#d4a981";
	document.getElementById("script").src = "script2.js";
}

function switchDiv(div) {
	var elements = document.getElementsByClassName("panel")

    for (var i = 0; i < elements.length; i++){
        elements[i].style.visibility = "hidden";
	}
	
	document.getElementById(div).style.visibility = "visible";
	window.scrollTo(0, 0);

}

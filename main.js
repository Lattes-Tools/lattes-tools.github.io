 // Fetch the CSV from the repository
 fetch('https://lattes-tools.github.io/qualis.csv')
 .then(response => response.text())
 .then(data => {
     window.csvString = data;
 });

document.getElementById('upload-form').addEventListener('submit', function(e) {
 e.preventDefault();
 var xmlFile = document.getElementById('xml-upload').files[0];

 var xmlReader = new FileReader();
 xmlReader.onload = function() {
     var buffer = xmlReader.result;
     var decoder = new TextDecoder("iso-8859-1");
     var xmlString = decoder.decode(buffer);                    
     parseCSV(window.csvString, xmlString);
 };
 xmlReader.readAsArrayBuffer(xmlFile);
});

function parseCSV(csvString, xmlString) {
 let lines = csvString.split("\n");
 let qualisList = {};

 for(let i = 1; i < lines.length; i++) {
     let currentLine = lines[i].split(",");
     if(currentLine.length < 2) continue;

     let issn = currentLine[0].replace(/-/g, '');
     let grade = currentLine[currentLine.length - 1];
     qualisList[issn] = grade;
 }
 console.log("qualisList: ", qualisList);

 console.log(getQualisClassification(xmlString, qualisList));

 let result = getQualisClassification(xmlString, qualisList);
 document.getElementById('output').value = JSON.stringify(result, null, 2);
}

function getQualisClassification(xmlString, qualisList) {
 let parser = new DOMParser();
 let xmlDoc = parser.parseFromString(xmlString, "text/xml");

 let records = xmlDoc.getElementsByTagName("ARTIGO-PUBLICADO");

 let classifications = [];
 for(let i = 0; i < records.length; i++) {
     let basicData = records[i].querySelector("DADOS-BASICOS-DO-ARTIGO");
     let articleDetails = records[i].querySelector("DETALHAMENTO-DO-ARTIGO");

     let articleTitle = basicData.getAttribute("TITULO-DO-ARTIGO") || "N/A";
     let journalTitle = articleDetails.getAttribute("TITULO-DO-PERIODICO-OU-REVISTA") || "N/A";
     let issn = articleDetails.getAttribute("ISSN") || "N/A";

     if(qualisList[issn]) {
         classifications.push({ 'TITULO-DO-ARTIGO': articleTitle, 'TITULO-DO-PERIODICO-OU-REVISTA': journalTitle, 'ISSN': issn, 'Grade': qualisList[issn] });
     } else {
         classifications.push({ 'TITULO-DO-ARTIGO': articleTitle, 'TITULO-DO-PERIODICO-OU-REVISTA': journalTitle, 'ISSN': issn, 'Grade': "N/A" });
     }
 }

 // Sort the array based on the 'Grade' property
 classifications.sort(function(a, b) {
     return a.Grade.localeCompare(b.Grade);
 });

 return classifications;
}

function copyToClipboard() {
 /* Get the text field */
 var copyText = document.getElementById("output");

 /* Select the text field */
 copyText.select();
 copyText.setSelectionRange(0, 99999); /* For mobile devices */

 /* Copy the text inside the text field */
 document.execCommand("copy");

 /* Alert the copied text */
 alert("Copied the text: " + copyText.value);
}

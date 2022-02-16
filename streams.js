const { createReadStream, createWriteStream, readFile, writeFile, ReadStream } = require("fs");

const { join } = require("path");

let readSource = join(__dirname, "../public/about.html");
let writeSource = join(__dirname, "../data/about.copy.html");

// readFile(readSource, (err, contents, (err) => {
//     if (err) return console.error(err);

//     writeFile(writeSource, contents, (err) => {
//         if (err) return console.error(err);

//         console.log("Successfully copied folder!");
//     })
// }))

let readStream = createReadStream(readSource);
let writeStream = createWriteStream(writeSource);

// readStream.on("end", () => {
//     console.log("Finished");
// });

// writeStream.on("data", (data) => {
//     console.log("Data\n", data);
// });

readStream.pipe(writeStream).on("close", () => console.log("File is written"));
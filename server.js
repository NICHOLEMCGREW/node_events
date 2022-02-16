const http = require("http");
const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

const port = 5001;
const newsletter = new EventEmitter();

// Create a server
let server = http.createServer(requestHandler);

server.listen(port, () => console.log(`Servier listening on port ${port}...`));

//Define a request handler

function requestHandler(req, res) {

    // Hadle the request body
    const chunksArr = [];

    req.on("data", (chunk) => chunksArr.push(chunk));

    req.on("end", () => {

        // Handle a "/newsletter_sighup" POST route

        if (req.url == "/newletter_signup" && req.method == "POST") {
            let reqBody = Buffer.concat(chunksArr).toString();

            try {
                reqBody = JSON.parse(reqBody);
            } catch (e) {
                console.error(e);

                res.writeHead(400, { "Content-Type": "application/json" });
                res.write(
                    JSON.stringify({ 
                        message: "You must send request body as JSON format",
                    })
                    );
              return res.end();
            }
            // emit a "signup" event
            newsletter.emit("signup",{ data: reqBody, response: res });           
        } else {
            let filePath = path.join(__dirname, `./public/notFound.html`);
            let statusCode = 404;

            if (req.url == "/") {
                filePath = path.join(__dirname, `./public/index.html`);
                statusCode = 200;
            } else if (req.url == "/about") {
                filePath = path.join(__dirname, `./public/about.html`);
                statusCode = 200
            }

            const readStream = fs.createReadStream(filePath);
            
            res.writeHead(statusCode, { "Content-Type": "text/html"});
            readStream.pipe(res);


            // // Handle 404s
            // res.writeHead(404, { "Content-Type": "text/html" });
            // res.write("<h1>Page not found</h1>");
            // res.end();
        }
    });
}

newsletter.on("signup", updateNewsletter);

function updateNewsletter({ data, res }) {
     //append name + email record to a csv file
     if (!data.name || !data.email) {
        res.writeHead(400, { "Content-Type": "applicaiton/json" });
        res.write(JSON.stringify({
            message: `You must include values for both name and email.`,
            status: "FAILED",
            success: flase,
        })
        );
        return res.end();
     }

     let filePath = path.join(__dirname, "data/newsletter.csv");
     let contents = `${data.name},${data.email}\n`;

     if (!fs.existsSync("./data")) fs.mkdirSync("data");

     if (!fs.existsSync(filePath)) {
         contents = `name,email\n` + contents;
     }

     fs.appendFile(filePath, contents, (err) => {
         if (err)
         console.error(err);
         res.writeHead(500, { "Content-Type": "applicaiton/json" });
            res.write
            JSON.stringify({
                message: "The server failed ot update the newsletter list",
                status: "FAILED",
                success: false,
            });
       res.end();
     } else {
         console.log(`Added ${data.name} to newsletter list!`);
         res.writeHead(404, { "Content-Type": "applicaiton/json" });
            res.write(JSON.stringify({
                message: `Added ${data.name} to newsletter list!`,
                status: "SUCCEEDED",
                success: true,
            }));
            res.end();
     }
     });
}



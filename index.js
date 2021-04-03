const http = require("http");
const path = require("path");
const fs = require("fs").promises;

const cwd = process.cwd();

http.createServer(async (request, response) => {
    try {
        const reqUrl = new URL(request.url, 'http://localhost:4800');
        
        if (reqUrl.pathname === "/") {
            reqUrl.pathname = reqUrl.pathname.concat("index.html");
        }

        const filepath = path.join(cwd, reqUrl.pathname);
        
        const file = await getFile(filepath);

        if (file === null) {
            const fileNotFound = await getFile(path.join(__dirname, "/public/404.html"));

            response.writeHead(404, "Not Found", { "Content-Type": "text/html" });
            response.write(fileNotFound);
        } else {
            const contentType = getFileMIME(filepath);

            response.writeHead(200, "Success", { "Content-Type": contentType });
            response.write(file);
        }
        response.end();

    } catch (e) {
        response.writeHead(500, "Server Error", { "Contect-Type": "application/json" });
        response.write(JSON.stringify({ message: e }));
        response.end();

        console.log(`[ERROR]: server - ${e}`);

        process.exit(1);
    }
}).listen(4800, () => {
    console.log(`Server running at http://localhost:4800/`);
});

/**
 * Retrieves file specified by argument given to filepath parameter
 * 
 * @param {string} filepath Absolute or relative path to a file
 * @returns {Promise<string | null>} Contents of the requested file or null if not found
 */
async function getFile (filepath) {
    try {
        return await fs.readFile(filepath, "utf-8");   

    } catch (e) {
        console.log(`[ERROR]: getFile - ${e}`);

        return null;
    }
}

/**
 * Determines MIME type of a given file
 * 
 * This method is not intended for use as a mechanism to determine an application's support 
 * of the given file type. It will always return a string value, even in cases where the given 
 * file's extension is not included in the method's filetype checklist
 * 
 * Common MIME types listed at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 * 
 * @param {string} filename Name of the file, including extenstion
 * @returns {string} A string value with standard MIME type formatting
 */
 function getFileMIME (filename) {
    const ext = path.extname(filename).toLowerCase();

    switch (ext) {
        /* Text types */
        case ".html":
            return "text/html";
        case ".js":
            return "text/javascript";
        case ".css":
            return "text/css"
        /* Image types */
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".svg":
            return "image/svg+xml";
        /* Application types */
        case ".json":
            return "application/json";
        /* Standard default MIME type for files whose type cannot be determined */
        default: 
            return "application/octet-stream"
    }
}
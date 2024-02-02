var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const path = require("path");
const fs = require('fs');
const axios = require('axios'); // Import the axios library
const fastify = require("fastify")({
    logger: false,
});
const handlebars = require('handlebars');
// Register the static files plugin to serve static assets
fastify.register(require("@fastify/static"), {
    root: path.join(__dirname, "public"),
    prefix: "/", // optional: default '/'
});
// Register the formbody plugin for parsing incoming forms
fastify.register(require("@fastify/formbody"));
// Register the view engine for templates using Handlebars
fastify.register(require("@fastify/view"), {
    engine: {
        handlebars: require("handlebars"),
    },
    options: {
        helpers: {
            eq: function (arg1, arg2, options) {
                return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
            }
        }
    }
});
let seoData = {}; // Initialize an empty object to store the JSON data
// Read and parse the JSON data from seo.json
try {
    const seoJson = fs.readFileSync(path.join(__dirname, 'src', 'seo.json'), 'utf8');
    seoData = JSON.parse(seoJson);
}
catch (error) {
    console.error('Error reading or parsing seo.json:', error);
}
// Define the home page route
fastify.get("/", function (request, reply) {
    // Pass the seoData object to the template
    let params = { seo: seoData };
    return reply.view("/src/pages/index.hbs", params);
});
// Define the /stream route with an optional :key parameter
fastify.get("/stream/:key?", function (request, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        if (request.params.key) {
            try {
                const response = yield axios.get('http://ns330222.ip-5-196-66.eu:1985/api/v1/streams');
                const streamsData = response.data.streams;
                let params = {
                    seo: seoData,
                    streamKey: request.params.key,
                    live: 0, // Set live = 1 (for "Live")
                };
                // Find a stream with a matching name
                const foundStream = streamsData.find(stream => stream.name === request.params.key);
                if (foundStream) {
                    //We need to update the components on stream.hbs to indicate that its live.
                    return reply.view("/src/pages/stream.hbs", params);
                }
                else {
                    return reply.view("/src/pages/index.hbs", params);
                }
            }
            catch (error) {
                // Handle error in case of a failed HTTP request
                console.error(error);
            }
        }
        else {
            let params = { seo: seoData };
            // If no :key parameter, render the index.hbs template
            return reply.view("/src/pages/index.hbs", params);
        }
    });
});
// Define the POST route to handle form submissions
fastify.post("/", function (request, reply) {
    // Pass the seoData object to the template
    let params = { seo: seoData };
    return reply.view("/src/pages/index.hbs", params);
});
// Run the server and specify the port and host
fastify.listen({ port: 80, host: "0.0.0.0" }, function (err, address) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
});
//# sourceMappingURL=app.js.map
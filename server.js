import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util.js";

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.send("try GET /filteredimage?image_url={{}}");
});

app.get("/filteredimage", async (req, res, next) => {
  const { image_url } = req.query;

  // Check if the image_url parameter is provided
  if (!image_url) {
    return res.status(400).send("Image URL is required");
  }

  try {
    // Call the filterImageFromURL function to filter the image
    const filteredImagePath = await filterImageFromURL(image_url);

    // Send the resulting file in the response
    res.sendFile(filteredImagePath, async (err) => {
      // Delete the filtered image file on finish of the response
      if (err) {
        console.error("Error sending file:", err);
        return next(err);
      } else {
        await deleteLocalFiles([filteredImagePath]);
        console.log("File deleted:", filteredImagePath);
      }
    });
  } catch (error) {
    console.error("Error filtering image:", error);
    if (error.response?.status === 404) {
      return res.status(404).send("Check URL");
    } else {
      return res
        .status(500)
        .send("Internal Server Error: maybe not valid image URL");
    }
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});

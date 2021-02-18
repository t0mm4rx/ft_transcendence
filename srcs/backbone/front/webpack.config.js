const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const mime = require("mime-types");

module.exports = {
  entry: {
    app: ["./src/app.js", "./scss/main.scss"],
  },
  output: {
    path: path.resolve(__dirname, "./dist/"),
    filename: "bundle.js",
  },
  devServer: {
    before: function (app, server, compiler) {
      app.use(
        bodyParser.raw({
          type: "image/*",
          limit: "1000mb",
        })
      );
      app.post("/upload", function (req, res) {
        console.log("UPLOAD POST", req.body);
        const fileExtension = mime.extension(req.header("Content-Type"));
        const filename = `${req.header("X-Login")}.${fileExtension}`;
        console.log("FILE NAME:", filename);
        if (!req.body || !req.header("X-Login")) {
          return res.status(400).send({ error: "No data" });
        }
        fs.writeFile("./assets/user_images/" + filename, req.body, (err) => {
          // if (err) res.status(400).send({ error: "Failed to write to file" });
          // else res.send({ filename: filename });
          res.send({ filename: filename });
        });
      });
    },
    publicPath: "/server/",
    contentBase: path.resolve(__dirname, "./"),
    watchContentBase: true,
    compress: true,
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "./src"),
        loader: "babel-loader",
      },
      {
        test: /\.(scss|css)$/,
        include: path.resolve(__dirname, "./scss"),
        use: [
          {
            loader: "file-loader",
            options: { outputPath: "./", name: "[name].min.css" },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.html$/i,
        include: path.resolve(__dirname, "./templates"),
        loader: "html-loader",
      },
      {
        test: /\.(ico|gif|png|jpe?g|svg)$/,
        // loaders: [
        // 	{
        // 		loader: 'file-loader',
        // 		// options: {
        // 		// 	name: '[path][name].[ext]',
        // 		// 	context: './src'
        // 		// }
        // 	}
        loader: "file-loader",
        // ]
      },
    ],
  },
};

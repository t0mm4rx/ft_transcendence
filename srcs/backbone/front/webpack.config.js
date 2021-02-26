const path = require("path");
const multer = require("multer");
const mime = require("mime-types");

const storage = multer.diskStorage({
  destination: "./assets/user_images",
  filename: function (req, file, cb) {
    const fileExtension = mime.extension(file.mimetype);
    cb(null, `${req.header("X-Login")}.${fileExtension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },
  filename: function (req, file, cb) {
    const fileExtension = mime.extension(file.mimetype);
    return `${req.header("X-Login")}.${fileExtension}`;
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Please upload an image."));
    }
    console.log("FILE FILTER", file);
    cb(undefined, true);
  },
});

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
      app.post(
        "/upload",
        upload.single("file"),
        (req, res) => {
          res.send({ filepath: req.file.path });
        },
        (error, req, res, next) => {
          res.status(400).send({ error: error.message });
        }
      );
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

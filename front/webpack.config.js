const path = require("path");

module.exports = {
	entry: {
		app: ["./src/app.js"]
	},
	output: {
		path: path.resolve(__dirname, "./dist/"),
		filename: "bundle.js"
	},
	devServer: {
		publicPath: "/server/",
		contentBase: path.resolve(__dirname, "./"),
		watchContentBase: true,
		compress: true,
		port: 8080
	},
	module: {
		rules: [{
			test: /\.js$/,
			include: path.resolve(__dirname, './src'),
			loader: "babel-loader"
		}]
	}
};
const path = require("path");

module.exports = {
	entry: {
		app: ["./src/app.js", "./scss/main.scss"]
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
		rules: [
			{
				test: /\.js$/,
				include: path.resolve(__dirname, './src'),
				loader: "babel-loader"
			},
			{
				test: /\.(scss|css)$/,
				include: path.resolve(__dirname, './scss'),
				use: [{
					loader: 'file-loader',
					options: {outputPath: './', name: '[name].min.css'}
				}, 'sass-loader'],
			},
			{
				test: /\.html$/i,
				include: path.resolve(__dirname, './templates'),
				loader: 'html-loader',
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
				loader: 'file-loader'
				// ]
			},
		]
	}
};
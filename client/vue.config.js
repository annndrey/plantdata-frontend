module.exports = {
    runtimeCompiler:true,
    lintOnSave: true,
    configureWebpack: {
    },
    devServer: {
        disableHostCheck: true,
	watchOptions: {
	    poll: true
	},
	port: 8082,
	hot: true
    }
};

module.exports = {
	productionSourceMap: process.env.NODE_ENV === 'development',
    lintOnSave: true,
    devServer: {
	    overlay: {
	      warnings: true,
	      errors: true
	    }
    },
    configureWebpack: {
        externals: {
            'vue': 'Vue',
            'vuex': 'Vuex',
            'vue-router': 'VueRouter',
            'vant': 'vant'
        }
    }
};
